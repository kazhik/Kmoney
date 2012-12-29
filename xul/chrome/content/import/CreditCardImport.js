Components.utils.import("resource://gre/modules/NetUtil.jsm");

function CreditCardImport(db) {
  AbstractImport.call(this, db, km_getLStr("import.creditcard"));
  
}
CreditCardImport.prototype = Object.create(AbstractImport.prototype);

CreditCardImport.prototype.importDb = function (name, csvFile, userId, importCallback) {
    var cardId;
    function onLoadImportConf(sourceType) {
        function onFileOpen(inputStream, status) {
            function insertCallback() {
                var importHistory = {
                    "user_id": userId,
                    "source_type": sourceType,
                    "source_name": name,
                    "source_url": csvFile.path,
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
                                                          {"charset": "UTF-8"}
                                                          );
        
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
        
                var matchResult = rowArray[i][0].match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                if (rowArray[i].length > 1 && matchResult !== null) {
                    var rec = {
                        "boughtAmount": 0,
                        "itemId": 0,
                        "detail": "",
                        "userId": userId,
                        "cardId": cardId,
                        "source": sourceType,
                        "internal": 0,
                        "remainingBalance": 0
                    };
                    rec["transactionDate"] = toYYYYMMDD(matchResult[1], matchResult[2], matchResult[3],
                                                        "-"),
                    rec["boughtAmount"] = parseFloat(rowArray[i][2]);
                    rec["detail"] = rowArray[i][1];
                    var itemInfo = this.getItemInfo(rowArray[i][1]);
                    if (itemInfo["itemId"] === undefined) {
                        km_alert(km_getLStr("error.title"),
                                 km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["itemId"] = itemInfo["itemId"];
                    rec["internal"] = itemInfo["internal"];
                    if (rowArray[i].length >= 4 && rowArray[i][3].length > 0) {
                        rec["payMonth"] = rowArray[i][3].replace("/", "-", "g");
                        rec["payAmount"] = rec["boughtAmount"];
                    }
        
                    newRecordArray.push(rec);
        
                }
        
            }
            this.mDb.creditCardTrns.import(newRecordArray,
                                           insertCallback.bind(this));
        
        }
        NetUtil.asyncFetch(csvFile, onFileOpen.bind(this));
    }
    cardId = this.mDb.creditCardInfo.getCardId(name, userId);
    this.loadImportConf(userId, name, onLoadImportConf.bind(this));

};