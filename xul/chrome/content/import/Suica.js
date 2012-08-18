Components.utils.import("resource://gre/modules/NetUtil.jsm");

function Suica(emoneyTbl, itemMap) {
  this.emoneyTable = emoneyTbl;
  
  // TODO: このマップは編集できるようにする
  this.importItemMap = {
    "Fare": itemMap["交通費"],
    "Charge": itemMap["ATM/振替"],
    "Other": itemMap["食材・生活用品"]
  };
  this.sourceType = 200;

  this.emoneyId = 0;
  this.userId = 0;
  
};

Suica.prototype.setMoneyId = function(moneyId) {
  this.emoneyId = moneyId;
};

Suica.prototype.setSourceType = function(type) {
  this.sourceType = type;
};

Suica.prototype.setUserId = function(userid) {
  this.userId = userid;
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
  
  var columnData;
  var colDate;
  var colDetail;
  var colIncome;
  var colExpense;
  var colInternal;
  var colItemId;
  var prevBalance = -1;
  var balance = 0;
  for (var i = rowData.length - 1; i >= 0; --i) {
    columnData = rowData[i].getElementsByClassName("whtbg");
    if (columnData.length === 0) {
      continue;
    }

    // 月日を年月日に変換
    // ファイル内に年データがないので、データは1年以内のものと想定
    var today = new Date();
    var year = today.getFullYear();
    var monthday = (columnData[0].textContent).split("/");
    if (monthday[0] > today.getMonth() + 1) {
      --year;
    }
    colDate = year + "-" + monthday[0] + "-" + monthday[1];
    
    colDetail = columnData[1].textContent.trim();
   
    balance = parseInt(columnData[5].textContent.replace(/[^\d.]+/g, ""));

    if (colDetail === "繰") {
      prevBalance = balance;
      continue;
    }
    // 残高が減っていれば支出、増えていれば収入とする
    if (prevBalance > balance) {
      // 第5カラムがある場合は電車
      if (columnData[4].textContent != "") {
        colDetail += ":";
        colDetail += columnData[2].textContent.trim();
        colDetail += "-";
        colDetail += columnData[3].textContent.trim();
        colDetail += ":";
        colDetail += columnData[4].textContent.trim();
        colItemId = this.importItemMap["Fare"];
      // 「物販」以外は交通費のはず（バス等）
      } else if (columnData[4].textContent != "物販") {
        colItemId = this.importItemMap["Fare"];
      } else {
        colItemId = this.importItemMap["Other"];
      }
      colIncome = 0;
      colExpense = prevBalance - balance;
    } else {
      colItemId = this.importItemMap["Charge"];
      colInternal = 1;
      colIncome = balance - prevBalance;
      colExpense = 0;
    }
    prevBalance = balance;
    km_log(colDate + "," + colItemId + "," + colDetail +","
           + colIncome + "," + colExpense + "," + this.userId);
  }
  
};

Suica.prototype.importDb = function(suicaHtmlFile, userId) {
  this.userId = userId;

  NetUtil.asyncFetch(suicaHtmlFile, this.onFileOpen.bind(this));
  
};


