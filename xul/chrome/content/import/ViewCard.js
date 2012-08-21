Components.utils.import("resource://gre/modules/NetUtil.jsm");

function ViewCard(db, cardTbl, itemMap) {
  this.mDb = db;
  this.cardTable = cardTbl;
  this.itemMap = itemMap;
  
  this.cardId = 0;
  this.userId = 0;
  
};

ViewCard.prototype.getSourceType = function() {
    this.mDb.selectQuery("select rowid from km_source where type = 'ビューカード'" );
    var records = this.mDb.getRecords();
    if (records.length === 1) {
      return records[0][0];
    }
    return 0;
};


ViewCard.prototype.getItemInfo = function(detail) {
  // TODO: このマップは編集できるようにする
  var importItemArray = [
    { "detail": "ソフトバンクＭ",
      "itemId": this.itemMap["通信費"],
      "internal": 0,
      "default" : 0
    },
    { "detail": "ヤフージャパン",
      "itemId": this.itemMap["通信費"],
      "internal": 0,
      "default" : 0
    },
    { "detail": "モバイルＳｕｉｃａ",
      "itemId": this.itemMap["交通費"],
      "internal": 0,
      "default" : 0
    },
    { "detail": "オートチャージ",
      "itemId": this.itemMap["ATM/振替"],
      "internal": 1,
      "default" : 0
    },
    { "detail": "その他",
      "itemId": this.itemMap["食材・生活用品"],
      "internal": 0,
      "default" : 1
    },
  ];
  
  var defaultItem = {};
  for (var i in importItemArray) {
    if (importItemArray[i]["default"] == 1) {
      defaultItem = importItemArray[i];
    } else if (detail.search(importItemArray[i]["detail"]) != -1) {
      return importItemArray[i];
    }
  }
  return defaultItem;

};

ViewCard.prototype.onFileOpen = function(inputStream, status) {
  if (!Components.isSuccessCode(status)) {
    return;
  }

  var strBuff = "";
  
  strBuff = NetUtil.readInputStreamToString(inputStream, inputStream.available(),
    {"charset": "Shift_JIS"});

  var parser = new DOMParser();
  var htmlDoc;
  htmlDoc = parser.parseFromString(strBuff, "text/html"); 

  var payMonth = htmlDoc.getElementById("LblPayDte").textContent;
  payMonth = payMonth.replace(/年/g, "-");
  payMonth = payMonth.replace(/月\d+日/g, "");
  
  var elemTable = htmlDoc.getElementsByClassName("listtable2");
  if (elemTable.length === 0) {
    return;
  }
  
  var rowData = elemTable[0].getElementsByTagName("tr");
  if (rowData.length === 0) {
    return;
  }
  var sourceType = this.getSourceType();
  var columnData;
  var columnData2;
  var dataNo = 0;
  for (var i = 0; i < rowData.length; ++i) {
    columnData = rowData[i].getElementsByTagName("td");
    
    // カラム9個なら一段目とみなす
    if (columnData.length === 9) {
      var rec = {
        "transactionDate": "",
        "payAmount": 0,
        "payMonth" : payMonth,
        "boughtAmount": 0,
        "itemId": 0,
        "detail": "",
        "userId": this.userId,
        "cardId": this.cardId,
        "source": sourceType,
        "internal": 0,
        "remainingBalance": 0
      };

      dataNo++;
      var dateElem = htmlDoc.getElementById("RtUseInfoList__ctl" + dataNo + "_LblUseDte");
      rec["transactionDate"] = dateElem.textContent.replace(/\//g, "-");
      rec["detail"] = columnData[2].textContent.trim();
      var itemInfo = this.getItemInfo(rec["detail"]);
      rec["itemId"] = itemInfo["itemId"];
      rec["internal"] = itemInfo["internal"];
      columnData2 = rowData[i].getElementsByTagName("th");
      rec["payAmount"] = columnData2[0].textContent.trim().replace(/,/g, "");
      
      // 二段目にある請求額（合計値）も取り出す
      columnData = rowData[i + 1].getElementsByTagName("td");
      rec["boughtAmount"] = columnData[0].textContent.trim().replace(/,/g, "");
      
      this.cardTable.addNewRecord(rec);
    }
  }
  this.cardTable.executeInsert();
};

ViewCard.prototype.importDb = function(suicaHtmlFile, userId) {
  this.userId = userId;
  this.cardId = this.cardTable.getCardId("Viewカード", userId);

  NetUtil.asyncFetch(suicaHtmlFile, this.onFileOpen.bind(this));
  
};


