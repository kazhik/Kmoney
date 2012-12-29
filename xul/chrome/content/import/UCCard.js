Components.utils.import("resource://gre/modules/NetUtil.jsm");

function UCCard(db) {
    AbstractImport.call(this, db, "UCカード");
}
UCCard.prototype = Object.create(AbstractImport.prototype);


UCCard.prototype.importDb = function (name, csvFile, userId, importCallback) {
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
                                                          {"charset": "Shift_JIS"}
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
        
                if (rowArray[i].length > 1 && rowArray[i][1].match(/\d{4}\/\d{2}\/\d{2}$/)) {
                    var rec = {
                        "transactionDate": "",
                        "payAmount": 0,
                        "payMonth": payMonth,
                        "boughtAmount": 0,
                        "itemId": 0,
                        "detail": "",
                        "userId": userId,
                        "cardId": cardId,
                        "source": sourceType,
                        "internal": 0,
                        "remainingBalance": 0
                    };
                    rec["transactionDate"] = rowArray[i][1].replace("/", "-", "g");
                    rec["boughtAmount"] = parseFloat(rowArray[i][6]);
                    rec["payAmount"] = parseFloat(rowArray[i][7]);
                    rec["detail"] = rowArray[i][3];
                    var itemInfo = this.getItemInfo(rowArray[i][3]);
                    if (itemInfo["itemId"] === undefined) {
                        km_alert(km_getLStr("error.title"),
                                 km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["itemId"] = itemInfo["itemId"];
        
                    if (rowArray[i][0] != "１回払い") {
                        // TODO: 一回払いでないときはどんなデータになる？
                    }
                    newRecordArray.push(rec);
        
                } else if (rowArray[i][0] === "お支払日") {
                    matched = rowArray[i][1].match(/(\d{4})年(\d{2})月/);
                    payMonth = matched[1] + "-" + matched[2];
                }
        
            }
            this.mDb.creditCardTrns.import(newRecordArray,
                                           insertCallback.bind(this));
        
        }
        NetUtil.asyncFetch(csvFile, onFileOpen.bind(this));
    }
    cardId = this.mDb.creditCardInfo.getCardId(this.type, userId);
    this.loadImportConf(userId, null, onLoadImportConf.bind(this));

};