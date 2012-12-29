function KantanKakeibo(db) {
    AbstractImport.call(this, db, "かんたん家計簿");
}
KantanKakeibo.prototype = Object.create(AbstractImport.prototype);

KantanKakeibo.prototype.importDb = function (name, kantanDbFile, userId, importCallback) {
    function onLoadImportConf(sourceType) {
        function loadCallback(records) {
            function insertCallback() {
                var importHistory = {
                    "user_id": userId,
                    "source_type": sourceType,
                    "source_name": name,
                    "source_url": kantanDbFile.path,
                    "period_from": newRecordArray[0]["transactionDate"],
                    "period_to": newRecordArray[newRecordArray.length - 1]["transactionDate"]
                };
                this.mDb.importHistory.insert(importHistory, importCallback.bind(this));
            }
            var newRecordArray = [];
            for (var i = 0; i < records.length; i++) {
                var rec = {
                    "transactionDate": records[i][0],
                    "income": 0,
                    "expense": 0,
                    "itemId": 0,
                    "detail": "",
                    "userId": userId,
                    "internal": 0,
                    "source": sourceType,
                };
        
                if (records[i][1] == 0) {
                    rec["income"] = 0;
                    rec["expense"] = records[i][4];
                } else {
                    rec["income"] = records[i][4];
                    rec["expense"] = 0;
                }
                rec["detail"] = records[i][3];
                var memo = records[i][5];
                if (rec["detail"] != null && rec["detail"] != "") {
                    if (memo != null && memo != "") {
                        rec["detail"] += "(" + memo + ")";
                    }
                } else {
                    rec["detail"] = memo;
                }
                var itemInfo = this.getItemInfo(records[i][2]);
                if (itemInfo["itemId"] === undefined) {
                    km_alert(km_getLStr("error.title"),
                             km_getLStr("error.import.noConf"));
                }
                rec["itemId"] = itemInfo["itemId"];
                rec["internal"] = itemInfo["internal"];
        
                newRecordArray.push(rec);
            }
            this.mDb.cashTrns.import(newRecordArray, insertCallback.bind(this));
        }
        var kantanDb = new KantanKakeiboDb();
        kantanDb.load(kantanDbFile, loadCallback.bind(this));
        
    }
    this.loadImportConf(userId, null, onLoadImportConf.bind(this))
    
};

