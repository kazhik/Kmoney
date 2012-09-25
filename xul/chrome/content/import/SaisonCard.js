Components.utils.import("resource://gre/modules/NetUtil.jsm");

function SaisonCard(db, cardTbl) {
  CreditCardImport.call(this, db, cardTbl);
}
SaisonCard.prototype = Object.create(CreditCardImport.prototype);

SaisonCard.prototype.onFileOpen = function(inputStream, status) {
  if (!Components.isSuccessCode(status)) {
    return;
  }

  var strBuff = "";
  
  strBuff = NetUtil.readInputStreamToString(inputStream, inputStream.available(),
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

    if (rowArray[i][0].match(/\d{4}\/\d{2}\/\d{2}$/)){
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
      rec["transactionDate"] = rowArray[i][0].replace("/", "-", "g");
      rec["boughtAmount"] = parseInt(rowArray[i][5]);
      strBuff = convertZen2han(rowArray[i][6]);
      strBuff = strBuff.replace("，", "");
      strBuff = strBuff.replace("円", "");
      strBuff = strBuff.replace("割引対象優待後金額：", "");
      rec["payAmount"] = parseInt(strBuff);
      rec["detail"] = rowArray[i][1];
      var itemInfo = this.getItemInfo(rowArray[i][1]);
      if (itemInfo["itemId"] === undefined) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.import.noConf"));
        return;
      }
      rec["itemId"] = itemInfo["itemId"];
      
      if (rowArray[i][3] != "１回") {
        // TODO: 一回払いでないときはどんなデータになる？
      }
      newRecordArray.push(rec);
      
    } else if (rowArray[i].length > 6 &&
      rowArray[i][6].match(/割引除外金額　　　：[０-９]+円/) != null ) {
      
      matched = rowArray[i][6].match(/割引除外金額　　　：([０-９]+)円/);
      
      newRecordArray[newRecordArray.length - 1]["payAmount"] +=
        parseInt(convertZen2han(matched[1]));
    } else if (rowArray[i][0] === "お支払日") {
      matched = rowArray[i][1].match(/(\d{4})\/(\d{2})\/\d{2}$/);
      payMonth = matched[1] + "-" + matched[2];
    }
    
  }
  this.cardTable.executeInsert(newRecordArray);
  this.cardTable.load();
};

SaisonCard.prototype.importDb = function(csvFile, userId) {
  this.userId = userId;
  this.cardId = this.cardTable.getCardId("セゾンカード", userId);
  this.loadSourceType("セゾンカード");
  this.loadImportConf();

  NetUtil.asyncFetch(csvFile, this.onFileOpen.bind(this));
  
};


