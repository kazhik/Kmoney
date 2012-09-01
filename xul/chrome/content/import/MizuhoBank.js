Components.utils.import("resource://gre/modules/NetUtil.jsm");


function MizuhoBank(db, bankTbl) {
  BankImport.call(this, db, bankTbl);
}
MizuhoBank.prototype = Object.create(BankImport.prototype);

MizuhoBank.prototype.onFileOpen = function(inputStream, status) {
  if (!Components.isSuccessCode(status)) {
    return;
  }

  var strBuff = NetUtil.readInputStreamToString(inputStream, inputStream.available(),
    {"charset": "UTF-8"});

  // 一行ずつ読むための正規表現
  var regex = /(.+)$/my;
   
  var matchedLine;
  var matchedTrn;
  var bankTransactionList = false;
  var newRecordArray = [];
  var trnAmt = 0;
  var memo = "";
  var dtPosted = "";
  while ((matchedLine = regex.exec(strBuff)) != null) {
    if (matchedLine[1].match(/<\/BANKTRANLIST>/)) {
      break;
    } else if (matchedLine[1].match(/<BANKTRANLIST>/)) {
      bankTransactionList = true;
    }
    if (!bankTransactionList) {
      continue;
    }
    if (matchedLine[1].match(/<\/STMTTRN>/)) {
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
      rec["transactionDate"] = dtPosted;
      rec["expense"] = (trnAmt > 0)? 0: Math.abs(trnAmt);
      rec["income"] = (trnAmt <= 0)? 0: trnAmt;
      rec["detail"] = memo;
      var itemInfo = this.getItemInfo(memo);
      if (itemInfo["itemId"] === undefined) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.import.noConf"));
        return;
      }
      rec["itemId"] = itemInfo["itemId"];
      rec["internal"] = itemInfo["internal"];
      
      newRecordArray.push(rec);
      
    }
    matchedTrn = matchedLine[1].match(/<DTPOSTED>(\d{4})(\d{2})(\d{2})/);
    if (matchedTrn) {
      dtPosted = matchedTrn[1] + '-' + matchedTrn[2] + '-' + matchedTrn[3];
    }
    matchedTrn = matchedLine[1].match(/<TRNAMT>(.+)/);
    if (matchedTrn) {
      trnAmt = parseFloat(matchedTrn[1]);
    }
    matchedTrn = matchedLine[1].match(/<MEMO>(.+)/);
    if (matchedTrn) {
      memo = matchedTrn[1];
    }
  }    
  this.bankTable.executeInsert(newRecordArray);
  this.bankTable.load('last');
};

MizuhoBank.prototype.importDb = function(inputFile, userId) {
  this.userId = userId;
  this.bankId = this.bankTable.getBankId("みずほ銀行", userId);
  this.loadSourceType("みずほ銀行");
  this.loadImportConf();

  NetUtil.asyncFetch(inputFile, this.onFileOpen.bind(this));
  
};

