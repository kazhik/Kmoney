
function EMoneyImport(db) {
  AbstractImport.call(this, db, km_getLStr("import.emoney"));
  
}
EMoneyImport.prototype = Object.create(AbstractImport.prototype);

EMoneyImport.prototype.importDb = function (name, csvFile, userId, importCallback) {
    var emoneyId;
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
            var newRecordArray = [];
            for (var i = 0; i < rowArray.length; ++i) {
        
                if (rowArray[i].length === 0) {
                    continue;
                }
        
                var matchResult = rowArray[i][0].match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
                if (matchResult !== null) {
                    var rec = {
                        "transactionDate": "",
                        "income": 0,
                        "expense": 0,
                        "itemId": 0,
                        "detail": "",
                        "userId": userId,
                        "moneyId": emoneyId,
                        "internal": 0,
                        "source": sourceType,
                    };
                    rec["transactionDate"] = toYYYYMMDD(matchResult[1], matchResult[2], matchResult[3],
                                                        "-"),
                    rec["detail"] = rowArray[i][1];
                    rec["income"] = parseFloat(rowArray[i][2]) || 0;
                    rec["expense"] = parseFloat(rowArray[i][3]) || 0;
                    var itemInfo = this.getItemInfo(rowArray[i][1]);
                    if (itemInfo["itemId"] === undefined) {
                        km_alert(km_getLStr("error.title"),
                                 km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["itemId"] = itemInfo["itemId"];
                    rec["internal"] = itemInfo["internal"];
        
                    newRecordArray.push(rec);
        
                }
        
            }
            this.mDb.emoneyTrns.import(newRecordArray, insertCallback.bind(this));
            
        }
        NetUtil.asyncFetch(csvFile, onFileOpen.bind(this));
    }
    emoneyId = this.mDb.emoneyInfo.getMoneyId(name, userId);
    this.loadImportConf(userId, name, onLoadImportConf.bind(this))
    
};
