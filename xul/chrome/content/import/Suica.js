Components.utils.import("resource://gre/modules/NetUtil.jsm");

function Suica(db, emoneyTbl, itemMap) {
  this.mDb = db;
  this.emoneyTable = emoneyTbl;
  
  // TODO: このマップは編集できるようにする
  this.importItemMap = {
    "Fare": itemMap["交通費"],
    "Charge": itemMap["ATM/振替"],
    "Other": itemMap["食材・生活用品"]
  };

  this.emoneyId = 0;
  this.userId = 0;
  
};

Suica.prototype.getSourceType = function() {
    this.mDb.selectQuery("select rowid from km_source where type = 'Suica'" );
    var records = this.mDb.getRecords();
    if (records.length === 1) {
      return records[0][0];
    }
    return 0;
};

Suica.prototype.onFileOpen = function(inputStream, status) {
  var strBuff = "";
  var parser = new DOMParser();
  var htmlDoc;
  var elemTable;
  var rowData;
  
  if (!Components.isSuccessCode(status)) {
    return;
  }

  strBuff = NetUtil.readInputStreamToString(inputStream, inputStream.available(),
    {"charset": "Shift_JIS"});

  htmlDoc = parser.parseFromString(strBuff, "text/html"); 

  elemTable = htmlDoc.getElementsByClassName("grybg01");
  if (elemTable.length === 0) {
    return;
  }
  
  rowData = elemTable[0].getElementsByTagName("tr");
  if (rowData.length === 0) {
    return;
  }
  var sourceType = this.getSourceType();
  var columnData;
  var prevBalance = -1;
  var balance = 0;
  for (var i = rowData.length - 1; i >= 0; --i) {
    columnData = rowData[i].getElementsByClassName("whtbg");
    if (columnData.length === 0) {
      continue;
    }

    var rec = {
      "transactionDate": "",
      "income": 0,
      "expense": 0,
      "itemId": 0,
      "detail": "",
      "userId": this.userId,
      "moneyId": this.emoneyId,
      "internal": 0,
      "source": sourceType,
    };
    // 月日を年月日に変換
    // ファイル内に年データがないので、データは1年以内のものと想定
    var today = new Date();
    var year = today.getFullYear();
    var monthday = (columnData[0].textContent).split("/");
    if (monthday[0] > today.getMonth() + 1) {
      --year;
    }
    rec["transactionDate"] = year + "-" + monthday[0] + "-" + monthday[1];
    
    rec["detail"] = columnData[1].textContent.trim();
   
    balance = parseInt(columnData[5].textContent.replace(/[^\d.]+/g, ""));

    if (rec["detail"] === "繰") {
      prevBalance = balance;
      continue;
    }
    // 残高が減っていれば支出、増えていれば収入とする
    if (prevBalance > balance) {
      // 第5カラムがある場合は電車
      km_log("[" + columnData[1].textContent + "]");
      if (columnData[4].textContent != "") {
        rec["detail"] += ":";
        rec["detail"] += columnData[2].textContent.trim();
        rec["detail"] += " - ";
        rec["detail"] += columnData[3].textContent.trim();
        rec["detail"] += ":";
        rec["detail"] += columnData[4].textContent.trim();
        rec["itemId"] = this.importItemMap["Fare"];
      // 「物販」以外は交通費のはず（バス等）
      } else if (columnData[1].textContent != "物販") {
        rec["itemId"] = this.importItemMap["Fare"];
      } else {
        rec["itemId"] = this.importItemMap["Other"];
      }
      rec["income"] = 0;
      rec["expense"] = prevBalance - balance;
    } else {
      rec["itemId"] = this.importItemMap["Charge"];
      rec["internal"] = 1;
      rec["income"] = balance - prevBalance;
      rec["expense"] = 0;
    }
    
    prevBalance = balance;
    
    this.emoneyTable.addNewRecord(rec);
  }
  this.emoneyTable.executeInsert();
};

Suica.prototype.importDb = function(suicaHtmlFile, userId) {
  this.userId = userId;
  this.emoneyId = this.emoneyTable.getMoneyId("Suica", userId);

  NetUtil.asyncFetch(suicaHtmlFile, this.onFileOpen.bind(this));
  
};


