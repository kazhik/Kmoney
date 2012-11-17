
function CashImport(db) {
  AbstractImport.call(this, db, km_getLStr("import.cash"));
  
}
CashImport.prototype = Object.create(AbstractImport.prototype);


CashImport.prototype.importDb = function (name, csvFile, userId, importCallback) {
    function onLoadImportConf(sourceType) {
        function onFileOpen(inputStream, status) {
            function insertCallback() {
                var importHistory = {
                    "source_type": sourceType,
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
                        "itemId": 0,
                        "detail": "",
                        "income": 0,
                        "expense": 0,
                        "userId": userId,
                        "source": sourceType,
                        "internal": 0
                    };
                    rec["transactionDate"] = toYYYYMMDD(matchResult[1], matchResult[2], matchResult[3],
                                                        "-"),
                    rec["detail"] = rowArray[i][1];
                    var itemInfo = this.getItemInfo(rowArray[i][1]);
                    if (itemInfo["itemId"] === undefined) {
                        km_alert(km_getLStr("error.title"),
                                 km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["itemId"] = itemInfo["itemId"];
                    rec["income"] = parseFloat(rowArray[i][2]) || 0;
                    rec["expense"] = parseFloat(rowArray[i][3]) || 0;
        
                    newRecordArray.push(rec);
                }
        
            }
            this.mDb.cashTrns.import(newRecordArray, insertCallback.bind(this));
        }
        NetUtil.asyncFetch(csvFile, onFileOpen.bind(this));
    }
    this.loadImportConf(name, onLoadImportConf.bind(this))

};
