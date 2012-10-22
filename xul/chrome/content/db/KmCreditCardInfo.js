function KmCreditCardInfo(db) {
    this.mDb = db;
    this.mCardList = null;
}
KmCreditCardInfo.prototype.load = function(loadCallback) {
    this.mDb.selectQuery("select id, name, user_id from km_creditcard_info");
    this.mCardList = this.mDb.getRecords();
    loadCallback(this.mCardList);
};

KmCreditCardInfo.prototype.loadMaster = function(loadCallback) {
    this.mDb.selectQuery("select A.id, A.name, A.user_id, B.name, A.bank_id, C.name " +
                         "from km_creditcard_info A " +
                         "inner join km_user B " +
                         "on A.user_id = B.id " +
                         "inner join km_bank_info C " +
                         "on A.bank_id = C.id");

    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());    
    
};

KmCreditCardInfo.prototype.insert = function(params, insertCallback) {
    var sql = ["insert into km_creditcard_info ("
            + "name, "
            + "user_id, "
            + "bank_id "
            + ") values ( "
            + "'" + params['name'] + "', "
            + params['userId'] + ", "
            + params['bankId'] + ")"];

    this.mDb.executeTransaction(sql);
    
    insertCallback(this.mDb.getLastInsertRowId());
};
KmCreditCardInfo.prototype.update = function(id, params, updateCallback) {
    var sql = ["update km_creditcard_info "
            + "set "
            + "name = '" + params['name'] + "', "
            + "user_id = " + params['userId'] + ", "
            + "bank_id = " + params['bankId'] + " "
            + "where id = " + id];

    this.mDb.executeTransaction(sql);
    
    updateCallback();
};
KmCreditCardInfo.prototype.delete = function(id, deleteCallback) {
    var sql = ["delete from km_creditcard_info where id = " + id];
    this.mDb.executeTransaction(sql);
    deleteCallback();
};
KmCreditCardInfo.prototype.getCardId = function (name, userId) {
    for (var i = 0; i < this.mCardList.length; i++) {
        if (this.mCardList[i][1] === name && this.mCardList[i][2] == userId) {
            return this.mCardList[i][0];
        }
    }
    return 0;
};
KmCreditCardInfo.prototype.getCardList = function (userId) {
    var cardList = [];
    for (var i = 0; i < this.mCardList.length; i++) {
        if (this.mCardList[i][2] == userId) {
            cardList.push(this.mCardList[i]);
        }
    }
    return cardList;
};
