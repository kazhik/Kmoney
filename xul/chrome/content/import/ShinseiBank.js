Components.utils.import("resource://gre/modules/NetUtil.jsm");

function ShinseiBank(db, bankTbl, itemMap) {
  this.mDb = db;
  this.bankTable = bankTbl;
  this.itemMap = itemMap;
  
  this.bankId = 0;
  this.userId = 0;
  
};

ShinseiBank.prototype.getSourceType = function() {
    this.mDb.selectQuery("select rowid from km_source where type = '新生銀行'" );
    var records = this.mDb.getRecords();
    if (records.length === 1) {
      return records[0][0];
    }
    return 0;
};


ShinseiBank.prototype.getItemInfo = function(detail) {
  // TODO: このマップは編集できるようにする
  var importItemArray = [
    { "detail": "その他",
      "itemId": this.itemMap["食材・生活用品"],
      "internal": 0,
      "default" : 1
    },
    { "detail": "税引前利息",
      "itemId": this.itemMap["利子"],
      "internal": 0,
      "default" : 0
    },
    { "detail": "振込手数料",
      "itemId": this.itemMap["雑費"],
      "internal": 0,
      "default" : 0
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

ShinseiBank.prototype.onFileOpen = function(inputStream, status) {
  if (!Components.isSuccessCode(status)) {
    return;
  }

  var strBuff = NetUtil.readInputStreamToString(inputStream, inputStream.available(),
    {"charset": "UTF-16"});

  var rowArray = CSVToArray(strBuff, "\t");
  
  if (rowArray.length === 0) {
    return;
  }
  var payMonth = "";
  var sourceType = this.getSourceType();
  var newRecordArray = [];
  for (var i = rowArray.length - 1; i >= 0; --i) {
    
    if (rowArray[i].length === 0) {
      continue;
    }

    if (rowArray[i][0].match(/\d{4}\/\d{2}\/\d{2}$/)){
      var rec = {
        "transactionDate": "",
        "itemId": 0,
        "detail": "",
        "income": 0,
        "expense": 0,
        "userId": this.userId,
        "bankId": this.bankId,
        "source": sourceType,
        "internal": 0
      };
      rec["transactionDate"] = rowArray[i][0].replace("/", "-", "g");
      rec["expense"] = parseInt(rowArray[i][3]) || 0;
      rec["income"] = parseInt(rowArray[i][4]) || 0;
      rec["detail"] = rowArray[i][2];
      var itemInfo = this.getItemInfo(rowArray[i][2]);
      rec["itemId"] = itemInfo["itemId"];
      
      if (rec["detail"] === "振込手数料" && rec["income"] > 0) {
        // キャッシュバック
        newRecordArray.pop();
      } else {
        newRecordArray.push(rec);
      }
    }
    
  }
  this.bankTable.executeInsert(newRecordArray);
};

ShinseiBank.prototype.importDb = function(csvFile, userId) {
  this.userId = userId;
  this.bankId = this.bankTable.getBankId("新生銀行", userId);

  NetUtil.asyncFetch(csvFile, this.onFileOpen.bind(this));
  
};

