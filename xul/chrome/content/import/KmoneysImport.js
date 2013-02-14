function KmoneysImport(db) {
    AbstractImport.call(this, db, "Kmoney/mobile");
}
KmoneysImport.prototype = Object.create(AbstractImport.prototype);

KmoneysImport.prototype.importDb = function (name, kmoneysDbFile, userId, importCallback) {
    function onLoadImportConf(sourceType) {
        var periodFrom = null;
        var periodTo = null;
        function importHistoryCallback(id) {
            
        }
        function insertCallback(dateFrom, dateTo) {
            if (periodFrom === null) {
                periodFrom = dateFrom;
            } else if (periodFrom > dateFrom) {
                periodFrom = dateFrom;
            }
            if (periodTo === null) {
                periodTo = dateTo;
            } else if (periodTo < dateTo) {
                periodTo = dateTo;
            }
        }
        function insertImportHistory() {
            var importHistory = {
                "user_id": userId,
                "source_type": sourceType,
                "source_name": name,
                "source_url": kmoneysDbFile.path,
                "period_from": periodFrom,
                "period_to": periodTo
            };
            this.mDb.importHistory.insert(importHistory, importHistoryCallback.bind(this));
        }
        function loadKmCashTrnsCallback(records) {
            var newRecordArray = [];
            for (var i = 0; i < records.length; i++) {
                var rec = {
                    "transactionDate": records[i][0],
                    "income": records[i][3],
                    "expense": records[i][4],
                    "categoryId": 0,
                    "detail": records[i][2],
                    "userId": userId,
                    "internal": 0,
                    "source": sourceType,
                };
        
                var category = this.getItemInfo(records[i][1]);
                if (category["categoryId"] === undefined) {
                    km_alert(km_getLStr("error.title"),
                             km_getLStr("error.import.noConf"));
                }
                rec["categoryId"] = category["categoryId"];
                rec["internal"] = category["internal"];
        
                newRecordArray.push(rec);
            }
            if (newRecordArray.length > 0) {
                this.mDb.cashTrns.import(newRecordArray,
                    insertCallback.bind(this,
                        newRecordArray[0]["transactionDate"],
                        newRecordArray[newRecordArray.length - 1]["transactionDate"]));
            }
        }
        function loadKmBankTrnsCallback(records) {
            var newRecordArray = [];
            for (var i = 0; i < records.length; i++) {
                var rec = {
                    "transactionDate": records[i][0],
                    "income": records[i][3],
                    "expense": records[i][4],
                    "categoryId": 0,
                    "detail": records[i][2],
                    "userId": userId,
                    "internal": 0,
                    "source": sourceType,
                };
        
                var category = this.getItemInfo(records[i][1]);
                if (category["categoryId"] === undefined) {
                    km_alert(km_getLStr("error.title"),
                             km_getLStr("error.import.noConf"));
                }
                rec["categoryId"] = category["categoryId"];
                rec["bankId"] = this.mDb.bankInfo.getBankId(records[i][5], userId);
                rec["internal"] = category["internal"];
        
                newRecordArray.push(rec);
            }
            if (newRecordArray.length > 0) {
                this.mDb.bankTrns.import(newRecordArray,
                    insertCallback.bind(this,
                        newRecordArray[0]["transactionDate"],
                        newRecordArray[newRecordArray.length - 1]["transactionDate"]));
            }
        }
        function loadKmCreditCardTrnsCallback(records) {
            var newRecordArray = [];
            for (var i = 0; i < records.length; i++) {
                var rec = {
                    "transactionDate": records[i][0],
                    "boughtAmount": records[i][3],
                    "categoryId": 0,
                    "detail": records[i][2],
                    "userId": userId,
                    "cardId": 0,
                    "source": sourceType,
                    "internal": 0,
                    "remainingBalance": 0
                };

                var category = this.getItemInfo(records[i][1]);
                if (category["categoryId"] === undefined) {
                    km_alert(km_getLStr("error.title"),
                             km_getLStr("error.import.noConf"));
                }
                rec["categoryId"] = category["categoryId"];
                rec["cardId"] = this.mDb.creditCardInfo.getCardId(records[i][4], userId);
                rec["internal"] = category["internal"];
        
                newRecordArray.push(rec);
            }
            if (newRecordArray.length > 0) {
                this.mDb.creditCardTrns.import(newRecordArray,
                    insertCallback.bind(this,
                        newRecordArray[0]["transactionDate"],
                        newRecordArray[newRecordArray.length - 1]["transactionDate"]));
            }
        }
        function loadKmEMoneyTrnsCallback(records) {
            var newRecordArray = [];
            for (var i = 0; i < records.length; i++) {
                var rec = {
                    "transactionDate": records[i][0],
                    "income": records[i][3],
                    "expense": records[i][4],
                    "categoryId": 0,
                    "detail": records[i][2],
                    "userId": userId,
                    "moneyId": 0,
                    "internal": 0,
                    "source": sourceType,
                };
        
                var category = this.getItemInfo(records[i][1]);
                if (category["categoryId"] === undefined) {
                    km_alert(km_getLStr("error.title"),
                             km_getLStr("error.import.noConf"));
                }
                rec["categoryId"] = category["categoryId"];
                rec["moneyId"] = this.mDb.emoneyInfo.getMoneyId(records[i][5], userId);
                rec["internal"] = category["internal"];
        
                newRecordArray.push(rec);
            }
            if (newRecordArray.length > 0) {
                this.mDb.emoneyTrns.import(newRecordArray,
                    insertCallback.bind(this,
                        newRecordArray[0]["transactionDate"],
                        newRecordArray[newRecordArray.length - 1]["transactionDate"]));
            }
        }

        if (this.importItemArray.length === 0) {
            km_alert(km_getLStr("error.title"),
                     km_getLStr("error.import.noConf"));
            return;
        }

        var kmDb = new KmoneysDb();
        kmDb.loadKmCashTrns(kmoneysDbFile, loadKmCashTrnsCallback.bind(this));
        kmDb.loadKmBankTrns(kmoneysDbFile, loadKmBankTrnsCallback.bind(this));
        kmDb.loadKmCreditCardTrns(kmoneysDbFile, loadKmCreditCardTrnsCallback.bind(this));
        kmDb.loadKmEMoneyTrns(kmoneysDbFile, loadKmEMoneyTrnsCallback.bind(this));
        insertImportHistory.call(this);
    }
    this.loadImportConf(userId, null, onLoadImportConf.bind(this))
    
};

