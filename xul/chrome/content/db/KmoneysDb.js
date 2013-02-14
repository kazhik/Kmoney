function KmoneysDb() {
    
}

KmoneysDb.prototype.loadKmCashTrns = function(dbFile, loadCallback) {
    var kmoneysDb = new SQLiteHandler();
    try {
        kmoneysDb.openDatabase(dbFile, true);
    } catch (e) {
        Components.utils.reportError('in function load - ' + e);
        km_message("Connect to '" + dbFile.path + "' failed: " + e, 0x3);
        return false;
    }

    var sql = ["select",
               "A.transaction_date,",
               "B.name,",
               "A.detail,",
               "A.income,",
               "A.expense,",
               "A.image_uri,",
               "A.internal,",
               "C.name,",
               "A.source",
               "from km_cash_trns A",
               "inner join km_category B",
               "on A.category_id = B.id",
               "inner join km_user_info C",
               "on A.user_id = C.id"].join(" ");
    kmoneysDb.selectQuery(sql);
    loadCallback(kmoneysDb.getRecords());
    
    return true;
};
KmoneysDb.prototype.loadKmBankTrns = function(dbFile, loadCallback) {
    var kmoneysDb = new SQLiteHandler();
    try {
        kmoneysDb.openDatabase(dbFile, true);
    } catch (e) {
        Components.utils.reportError('in function load - ' + e);
        km_message("Connect to '" + dbFile.path + "' failed: " + e, 0x3);
        return false;
    }

    var sql = ["select",
               "A.transaction_date,",
               "B.name,",
               "A.detail,",
               "A.income,",
               "A.expense,",
               "D.name,",
               "A.image_uri,",
               "A.internal,",
               "C.name,",
               "A.source",
               "from km_bank_trns A",
               "inner join km_category B",
               "on A.category_id = B.id",
               "inner join km_user_info C",
               "on A.user_id = C.id",
               "inner join km_bank_info D",
               "on A.bank_id = D.id"].join(" ");
    kmoneysDb.selectQuery(sql);
    loadCallback(kmoneysDb.getRecords());
    
    return true;
};
KmoneysDb.prototype.loadKmCreditCardTrns = function(dbFile, loadCallback) {
    var kmoneysDb = new SQLiteHandler();
    try {
        kmoneysDb.openDatabase(dbFile, true);
    } catch (e) {
        Components.utils.reportError('in function load - ' + e);
        km_message("Connect to '" + dbFile.path + "' failed: " + e, 0x3);
        return false;
    }

    var sql = ["select",
               "A.transaction_date,",
               "B.name,",
               "A.detail,",
               "A.expense,",
               "D.name,",
               "A.image_uri,",
               "A.internal,",
               "C.name,",
               "A.source",
               "from km_creditcard_trns A",
               "inner join km_category B",
               "on A.category_id = B.id",
               "inner join km_user_info C",
               "on A.user_id = C.id",
               "inner join km_creditcard_info D",
               "on A.card_id = D.id"].join(" ");
    kmoneysDb.selectQuery(sql);
    loadCallback(kmoneysDb.getRecords());
    
    return true;
};
KmoneysDb.prototype.loadKmEMoneyTrns = function(dbFile, loadCallback) {
    var kmoneysDb = new SQLiteHandler();
    try {
        kmoneysDb.openDatabase(dbFile, true);
    } catch (e) {
        Components.utils.reportError('in function load - ' + e);
        km_message("Connect to '" + dbFile.path + "' failed: " + e, 0x3);
        return false;
    }

    var sql = ["select",
               "A.transaction_date,",
               "B.name,",
               "A.detail,",
               "A.income,",
               "A.expense,",
               "D.name,",
               "A.image_uri,",
               "A.internal,",
               "C.name,",
               "A.source",
               "from km_emoney_trns A",
               "inner join km_category B",
               "on A.category_id = B.id",
               "inner join km_user_info C",
               "on A.user_id = C.id",
               "inner join km_emoney_info D",
               "on A.money_id = D.id"].join(" ");
    kmoneysDb.selectQuery(sql);
    loadCallback(kmoneysDb.getRecords());
    
    return true;
};