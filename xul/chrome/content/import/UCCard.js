Components.utils.import("resource://gre/modules/NetUtil.jsm");

function UCCard(db, cardTbl, itemMap) {
  this.mDb = db;
  this.cardTable = cardTbl;
  this.itemMap = itemMap;
  
  this.cardId = 0;
  this.userId = 0;
  
};

UCCard.prototype.getSourceType = function() {
    this.mDb.selectQuery("select rowid from km_source where type = 'UCカード'" );
    var records = this.mDb.getRecords();
    if (records.length === 1) {
      return records[0][0];
    }
    return 0;
};


UCCard.prototype.getItemInfo = function(detail) {
  // TODO: このマップは編集できるようにする
  var importItemArray = [
    { "detail": "その他",
      "itemId": this.itemMap["食材・生活用品"],
      "internal": 0,
      "default" : 1
    }
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

UCCard.prototype.onFileOpen = function(inputStream, status) {
  if (!Components.isSuccessCode(status)) {
    return;
  }

  var strBuff = NetUtil.readInputStreamToString(inputStream, inputStream.available(),
    {"charset": "Shift_JIS"});

  var rowArray = CSVToArray(strBuff, ",");
  
  if (rowArray.length === 0) {
    return;
  }
  var payMonth = "";
  var sourceType = this.getSourceType();
  for (var i = 0; i < rowArray.length; ++i) {
    
    if (rowArray[i].length === 0) {
      continue;
    }

    if (rowArray[i].length > 1 && rowArray[i][1].match(/\d{4}\/\d{2}\/\d{2}$/)){
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
      rec["transactionDate"] = rowArray[i][1].replace("/", "-", "g");
      rec["boughtAmount"] = parseInt(rowArray[i][6]);
      rec["payAmount"] = parseInt(rowArray[i][7]);
      rec["detail"] = rowArray[i][3];
      var itemInfo = this.getItemInfo(rowArray[i][3]);
      rec["itemId"] = itemInfo["itemId"];
      
      if (rowArray[i][0] != "１回払い") {
        // TODO: 一回払いでないときはどんなデータになる？
      }
      this.cardTable.addNewRecord(rec);
      
    } else if (rowArray[i][0] === "お支払日") {
      matched = rowArray[i][1].match(/(\d{4})年(\d{2})月/);
      payMonth = matched[1] + "-" + matched[2];
    }
    
  }
  this.cardTable.executeInsert();
};

UCCard.prototype.importDb = function(csvFile, userId) {
  this.userId = userId;
  this.cardId = this.cardTable.getCardId("UCカード", userId);

  NetUtil.asyncFetch(csvFile, this.onFileOpen.bind(this));
  
};
