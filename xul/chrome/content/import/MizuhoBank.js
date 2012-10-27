Components.utils.import("resource://gre/modules/NetUtil.jsm");

function MizuhoBank(db) {
    AbstractImport.call(this, db);
}

MizuhoBank.prototype = Object.create(AbstractImport.prototype);

MizuhoBank.prototype.importDb = function (inputFile, userId, importCallback) {
    var bankId;
    function onLoadImportConf(sourceType) {
        function onFileOpen(inputStream, status) {
            function insertCallback() {
                var importHistory = {
                    "source_type": sourceType,
                    "source_url": inputFile.path,
                    "period_from": newRecordArray[0]["transactionDate"],
                    "period_to": newRecordArray[newRecordArray.length - 1]["transactionDate"]
                };
                this.mDb.importHistory.insert(importHistory, importCallback.bind(this));
            }
            
            if (!Components.isSuccessCode(status)) {
                return;
            }
    
            var strBuff = NetUtil.readInputStreamToString(inputStream,
                                                          inputStream.available(),
                                                          {
                                                            "charset": "UTF-8"
                                                          }
                                                          );
    
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
                        "userId": userId,
                        "bankId": bankId,
                        "source": sourceType,
                        "internal": 0
                    };
                    rec["transactionDate"] = dtPosted;
                    rec["expense"] = (trnAmt > 0) ? 0 : Math.abs(trnAmt);
                    rec["income"] = (trnAmt <= 0) ? 0 : trnAmt;
                    rec["detail"] = memo;
                    var itemInfo = this.getItemInfo(memo);
                    if (itemInfo["itemId"] === undefined) {
                        km_alert(km_getLStr("error.title"),
                                 km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["itemId"] = itemInfo["itemId"];
                    rec["internal"] = itemInfo["internal"];
    
                    newRecordArray.push(rec);
    
                }
                matchedTrn = matchedLine[1].match(/<DTPOSTED>(\d{4})(\d{2})(\d{2})/);
                if (matchedTrn) {
                    dtPosted = matchedTrn[1] + '-' +
                        matchedTrn[2] + '-' + matchedTrn[3];
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
    
            this.mDb.bankTrns.import(newRecordArray, insertCallback.bind(this));
        }
        NetUtil.asyncFetch(inputFile, onFileOpen.bind(this));
    }
    bankId = this.mDb.bankInfo.getBankId("みずほ銀行", userId);
    this.loadImportConf("みずほ銀行", onLoadImportConf.bind(this))

};