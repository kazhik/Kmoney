function KmEMoneyInfo(db) {
    this.mDb = db;
    this.mMoneyList = null;
}
KmEMoneyInfo.prototype.getMoneyId = function (name, userId) {
    for (var i = 0; i < this.mMoneyList.length; i++) {
        if (this.mMoneyList[i][1] === name && this.mMoneyList[i][2] == userId) {
            return this.mMoneyList[i][0];
        }
    }
    return 0;

};
KmEMoneyInfo.prototype.getMoneyList = function (userId) {
    var moneyList = [];
    for (var i = 0; i < this.mMoneyList.length; i++) {
        if (this.mMoneyList[i][2] == userId) {
            moneyList.push(this.mMoneyList[i]);
        }
    }
    return moneyList;
};
KmEMoneyInfo.prototype.load = function(loadCallback) {
    this.mDb.selectQuery("select id, name, user_id from km_emoney_info");
    this.mMoneyList = this.mDb.getRecords();
    loadCallback(this.mMoneyList);
};

KmEMoneyInfo.prototype.loadMaster = function(loadCallback) {
    this.mDb.selectQuery("select A.id, A.name, A.user_id, B.name "
                       + "from km_emoney_info A "
                       + "inner join km_user B "
                       + "on A.user_id = B.id ");

    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());    
    
};

KmEMoneyInfo.prototype.insert = function(params, insertCallback) {
    var sql = ["insert into km_emoney_info ("
      + "name, "
      + "user_id "
      + ") values ( "
      + "'" + params['name'] + "', "
      + params['userId'] + ")"];

    this.mDb.executeTransaction(sql);
    
    insertCallback(this.mDb.getLastInsertRowId());
};

KmEMoneyInfo.prototype.update = function(id, params, updateCallback) {
    var sql = ["update km_emoney_info "
      + "set "
      + "name = '" + params['name'] + "', "
      + "user_id = " + params['userId'] + " "
      + "where id = " + id];

    this.mDb.executeTransaction(sql);
    
    updateCallback();
};
KmEMoneyInfo.prototype.delete = function(id, deleteCallback) {
    var sql = ["delete from km_emoney_info where id = " + id];
    this.mDb.executeTransaction(sql);
    deleteCallback();
};
