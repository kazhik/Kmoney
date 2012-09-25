Components.utils.import("resource://gre/modules/NetUtil.jsm");

function Suica(db, emoneyTbl) {
  EMoneyImport.call(this, db, emoneyTbl);
}
Suica.prototype = Object.create(EMoneyImport.prototype);

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
  var columnData;
  var prevBalance = -1;
  var balance = 0;
  var newRecordArray = [];
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
      "source": this.sourceType,
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
      if (columnData[4].textContent != "") {
        rec["detail"] += ":";
        rec["detail"] += columnData[2].textContent.trim();
        rec["detail"] += " - ";
        rec["detail"] += columnData[3].textContent.trim();
        rec["detail"] += ":";
        rec["detail"] += columnData[4].textContent.trim();
        rec["itemId"] = this.getItemId("交通費");
      } else {
        rec["itemId"] = this.getItemId(rec["detail"]);
      }
      rec["income"] = 0;
      rec["expense"] = prevBalance - balance;
    } else {
      rec["itemId"] = this.getItemId("チャージ");
      rec["internal"] = 1;
      rec["income"] = balance - prevBalance;
      rec["expense"] = 0;
    }
    
    prevBalance = balance;
    
    newRecordArray.push(rec);
  }
  this.emoneyTable.executeInsert(newRecordArray);
  this.emoneyTable.load();
};

Suica.prototype.importDb = function(suicaHtmlFile, userId) {
  this.userId = userId;
  this.emoneyId = this.emoneyTable.getMoneyId("Suica", userId);
  this.loadSourceType("Suica");
  this.loadImportConf();

  NetUtil.asyncFetch(suicaHtmlFile, this.onFileOpen.bind(this));
  
};


