Components.utils.import("resource://gre/modules/NetUtil.jsm");


function ShinseiBank(db, bankTbl) {
  BankImport.call(this, db, bankTbl);
}
ShinseiBank.prototype = Object.create(BankImport.prototype);

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
        "source": this.sourceType,
        "internal": 0
      };
      rec["transactionDate"] = rowArray[i][0].replace("/", "-", "g");
      rec["expense"] = parseInt(rowArray[i][3]) || 0;
      rec["income"] = parseInt(rowArray[i][4]) || 0;
      rec["detail"] = rowArray[i][2];
      var itemInfo = this.getItemInfo(rowArray[i][2]);
      if (itemInfo["itemId"] === undefined) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.import.noConf"));
        return;
      }
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
  this.bankTable.load();
};

ShinseiBank.prototype.importDb = function(csvFile, userId) {
  this.userId = userId;
  this.bankId = this.bankTable.getBankId("新生銀行", userId);
  this.loadSourceType("新生銀行");
  this.loadImportConf();

  NetUtil.asyncFetch(csvFile, this.onFileOpen.bind(this));
  
};

