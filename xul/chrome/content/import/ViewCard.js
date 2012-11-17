Components.utils.import("resource://gre/modules/NetUtil.jsm");

function ViewCard(db) {
    AbstractImport.call(this, db, "ビューカード");
}
ViewCard.prototype = Object.create(AbstractImport.prototype);

ViewCard.prototype.importDb = function (name, htmlFile, userId, importCallback) {
    var cardId;
    function onLoadImportConf(sourceType) {
        function onFileOpen(inputStream, status) {
            function insertCallback() {
                var importHistory = {
                    "source_type": sourceType,
                    "source_url": htmlFile.path,
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
                                                      inputStream.available(),
                                                      {"charset": "Shift_JIS"}
                                                      );
        
            var parser = new DOMParser();
            var htmlDoc;
            htmlDoc = parser.parseFromString(strBuff, "text/html");
        
            var payMonth = htmlDoc.getElementById("LblPayDte").textContent;
            payMonth = payMonth.replace(/年/g, "-");
            payMonth = payMonth.replace(/月\d+日/g, "");
        
            var elemTable = htmlDoc.getElementsByClassName("listtable2");
            if (elemTable.length === 0) {
                return;
            }
        
            var rowData = elemTable[0].getElementsByTagName("tr");
            if (rowData.length === 0) {
                return;
            }
            var columnData;
            var columnData2;
            var dataNo = 0;
            var newRecordArray = [];
            for (var i = 0; i < rowData.length; ++i) {
                columnData = rowData[i].getElementsByTagName("td");
        
                // カラム9個なら一段目とみなす
                if (columnData.length === 9) {
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
        
                    dataNo++;
                    var dateElem = htmlDoc.getElementById("RtUseInfoList__ctl" + dataNo + "_LblUseDte");
                    rec["transactionDate"] = dateElem.textContent.replace(/\//g, "-");
                    rec["detail"] = columnData[2].textContent.trim();
                    var itemInfo = this.getItemInfo(rec["detail"]);
                    if (itemInfo["itemId"] === undefined) {
                        km_alert(km_getLStr("error.title"), km_getLStr("error.import.noConf"));
                        return;
                    }
                    rec["itemId"] = itemInfo["itemId"];
                    rec["internal"] = itemInfo["internal"];
                    columnData2 = rowData[i].getElementsByTagName("th");
                    rec["payAmount"] = columnData2[0].textContent.trim().replace(/,/g, "");
        
                    // 二段目にある請求額（合計値）も取り出す
                    columnData = rowData[i + 1].getElementsByTagName("td");
                    rec["boughtAmount"] = columnData[0].textContent.trim().replace(/,/g, "");
        
                    newRecordArray.push(rec);
                }
            }
            this.mDb.creditCardTrns.import(newRecordArray,
                                           insertCallback.bind(this));
        }
        NetUtil.asyncFetch(htmlFile, onFileOpen.bind(this));
    }
    cardId = this.mDb.creditCardInfo.getCardId(name, userId);
    this.loadImportConf(name, onLoadImportConf.bind(this));


};