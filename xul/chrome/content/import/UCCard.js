Components.utils.import("resource://gre/modules/NetUtil.jsm");

function UCCard(db, cardTbl) {
  CreditCardImport.call(this, db, cardTbl);
}
UCCard.prototype = Object.create(CreditCardImport.prototype);

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
  var newRecordArray = [];
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
        "source": this.sourceType,
        "internal": 0,
        "remainingBalance": 0
      };
      rec["transactionDate"] = rowArray[i][1].replace("/", "-", "g");
      rec["boughtAmount"] = parseInt(rowArray[i][6]);
      rec["payAmount"] = parseInt(rowArray[i][7]);
      rec["detail"] = rowArray[i][3];
      var itemInfo = this.getItemInfo(rowArray[i][3]);
      if (itemInfo["itemId"] === undefined) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.import.noConf"));
        return;
      }
      rec["itemId"] = itemInfo["itemId"];
      
      if (rowArray[i][0] != "１回払い") {
        // TODO: 一回払いでないときはどんなデータになる？
      }
      newRecordArray.push(rec);
      
    } else if (rowArray[i][0] === "お支払日") {
      matched = rowArray[i][1].match(/(\d{4})年(\d{2})月/);
      payMonth = matched[1] + "-" + matched[2];
    }
    
  }
  
  this.cardTable.executeImport(newRecordArray);
};

UCCard.prototype.importDb = function(csvFile, userId) {
  this.userId = userId;
  this.cardId = this.cardTable.getCardId("UCカード", userId);
  this.loadSourceType("ビューカード");
  this.loadImportConf();

  NetUtil.asyncFetch(csvFile, this.onFileOpen.bind(this));
  
};
