function KantanKakeibo(db) {
    AbstractImport.call(this, db);
}
KantanKakeibo.prototype = Object.create(AbstractImport.prototype);

KantanKakeibo.prototype.importDb = function (kantanDbFile, userId, importCallback) {
    function onLoadImportConf(sourceType) {
        function loadCallback(records) {
            function insertCallback() {
                importCallback();
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
            this.mDb.cashTrns.insert(newRecordArray, insertCallback.bind(this));
        }
        var kantanDb = new KantanKakeiboDb();
        kantanDb.load(kantanDbFile, loadCallback.bind(this));
        
    }
    this.loadImportConf("かんたん家計簿", onLoadImportConf.bind(this))
    
};

