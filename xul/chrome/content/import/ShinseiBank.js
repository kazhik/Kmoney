Components.utils.import("resource://gre/modules/NetUtil.jsm");


function ShinseiBank(db) {
    AbstractImport.call(this, db, "新生銀行");
}
ShinseiBank.prototype = Object.create(AbstractImport.prototype);

ShinseiBank.prototype.importDb = function (name, csvFile, userId, importCallback) {
    var bankId;
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
                                                          {"charset": "UTF-16"}
                                                          );
        
            var rowArray = CSVToArray(strBuff, "\t");
        
            if (rowArray.length === 0) {
                return;
            }
            var payMonth = "";
            var newRecordArray = [];
            for (var i = rowArray.length - 1; i >= 0; --i) {
                if (rowArray[i].length === 0) {
                    continue;
                }
                if (rowArray[i][0].match(/\d{4}\/\d{2}\/\d{2}$/)) {
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
                    rec["transactionDate"] = rowArray[i][0].replace("/", "-", "g");
                    rec["expense"] = parseFloat(rowArray[i][3]) || 0;
                    rec["income"] = parseFloat(rowArray[i][4]) || 0;
                    rec["detail"] = rowArray[i][2];
                    var itemInfo = this.getItemInfo(rowArray[i][2]);
                    if (itemInfo["itemId"] === undefined) {
                        km_alert(km_getLStr("error.title"),
                                 km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["itemId"] = itemInfo["itemId"];
        
                    if (rec["detail"] === "振込手数料" && rec["income"] > 0) {
                        // キャッシュバック
                        newRecordArray.pop();
                    } else {
                        newRecordArray.push(rec);
                    }
                }
        
            }
            this.mDb.bankTrns.import(newRecordArray, insertCallback.bind(this));
        }
        NetUtil.asyncFetch(csvFile, onFileOpen.bind(this));
    }
    bankId = this.mDb.bankInfo.getBankId(name, userId);
    this.loadImportConf(name, onLoadImportConf.bind(this))

};