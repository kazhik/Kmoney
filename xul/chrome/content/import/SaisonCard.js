Components.utils.import("resource://gre/modules/NetUtil.jsm");

function SaisonCard(db) {
    AbstractImport.call(this, db, "セゾンカード");
}
SaisonCard.prototype = Object.create(AbstractImport.prototype);

SaisonCard.prototype.importDb = function (name, csvFile, userId, importCallback) {
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

            var strBuff = "";

            strBuff = NetUtil.readInputStreamToString(inputStream,
            inputStream.available(), {
                "charset": "Shift_JIS"
            });

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

                if (rowArray[i][0].match(/\d{4}\/\d{2}\/\d{2}$/)) {
                    var rec = {
                        "transactionDate": "",
                        "payAmount": 0,
                        "payMonth": payMonth,
                        "boughtAmount": 0,
                        "categoryId": 0,
                        "detail": "",
                        "userId": userId,
                        "cardId": cardId,
                        "source": sourceType,
                        "internal": 0,
                        "remainingBalance": 0
                    };
                    rec["transactionDate"] = rowArray[i][0].replace("/", "-", "g");
                    rec["boughtAmount"] = parseFloat(rowArray[i][5]);
                    strBuff = rowArray[i][6];
                    if (strBuff !== undefined) {
                        strBuff = convertZen2han(strBuff);
                        strBuff = strBuff.replace("，", "");
                        strBuff = strBuff.replace("円", "");
                        strBuff = strBuff.replace("割引対象優待後金額：", "");
                        rec["payAmount"] = parseFloat(strBuff);
                    } else {
                        rec["payAmount"] = rec["boughtAmount"];
                    }
                    rec["detail"] = rowArray[i][1];
                    var category = this.getItemInfo(rowArray[i][1]);
                    if (category["categoryId"] === undefined) {
                        km_alert(km_getLStr("error.title"),
                        km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["categoryId"] = category["categoryId"];

                    if (rowArray[i][3] != "１回") {
                        // TODO: 一回払いでないときはどんなデータになる？
                    }
                    newRecordArray.push(rec);

                } else if (rowArray[i].length > 6 &&
                           rowArray[i][6].match(/割引除外金額　　　：[０-９]+円/) != null) {

                    matched = rowArray[i][6].match(/割引除外金額　　　：([０-９]+)円/);

                    newRecordArray[newRecordArray.length - 1]["payAmount"] +=
                        parseFloat(convertZen2han(matched[1]));
                } else if (rowArray[i][0] === "お支払日") {
                    matched = rowArray[i][1].match(/(\d{4})\/(\d{2})\/\d{2}$/);
                    payMonth = matched[1] + "-" + matched[2];
                }

            }
            this.mDb.creditCardTrns.import(newRecordArray,
                insertCallback.bind(this));
        }
        if (this.importItemArray.length === 0) {
            km_alert(km_getLStr("error.title"),
                     km_getLStr("error.import.noConf"));
            return;
        }
        NetUtil.asyncFetch(csvFile, onFileOpen.bind(this));
    }

    cardId = this.mDb.creditCardInfo.getCardId(this.type, userId);
    this.loadImportConf(userId, null, onLoadImportConf.bind(this));

};