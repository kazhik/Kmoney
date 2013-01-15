
function BankImport(db) {
  AbstractImport.call(this, db, km_getLStr("import.bank"));
  
}
BankImport.prototype = Object.create(AbstractImport.prototype);


BankImport.prototype.importDb = function (name, csvFile, userId, importCallback) {
    var bankId;
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
            for (var i = 0; i < rowArray.length; i++) {
                if (rowArray[i].length === 0) {
                    continue;
                }
                var matchResult = rowArray[i][0].match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                if (matchResult !== null) {
                    var rec = {
                        "transactionDate": "",
                        "categoryId": 0,
                        "detail": "",
                        "income": 0,
                        "expense": 0,
                        "userId": userId,
                        "bankId": bankId,
                        "source": sourceType,
                        "internal": 0
                    };
                    rec["transactionDate"] = toYYYYMMDD(matchResult[1], matchResult[2], matchResult[3],
                                                        "-"),
                    rec["detail"] = rowArray[i][1];
                    var category = this.getItemInfo(rowArray[i][1]);
                    if (category["categoryId"] === undefined) {
                        km_alert(km_getLStr("error.title"),
                                 km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["categoryId"] = category["categoryId"];
                    rec["internal"] = category["internal"];
                    rec["income"] = parseFloat(rowArray[i][2]) || 0;
                    rec["expense"] = parseFloat(rowArray[i][3]) || 0;
        
                    newRecordArray.push(rec);
                }
        
            }
            this.mDb.bankTrns.import(newRecordArray, insertCallback.bind(this));
        }
        NetUtil.asyncFetch(csvFile, onFileOpen.bind(this));
    }
    bankId = this.mDb.bankInfo.getBankId(name, userId);
    this.loadImportConf(userId, name, onLoadImportConf.bind(this))

};
