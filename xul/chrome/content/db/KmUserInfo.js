function KmUserInfo(db) {
    this.mDb = db;
    this.mUserList = null;
}

KmUserInfo.prototype.load = function (loadCallback) {
    this.mDb.selectQuery("select id, name from km_user");
    this.mUserList = this.mDb.getRecords();
    loadCallback(this.mUserList, this.mDb.getColumns());
};
KmUserInfo.prototype.insert = function (name, insertCallback) {
    var sql = "insert into km_user ("
            + "name "
            + ") values ( "
            + ":name) ";
    var params = {
        "name": name
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    insertCallback(this.mDb.getLastInsertRowId());
};

KmUserInfo.prototype.update = function (id, name, updateCallback) {
    var sql = "update km_user "
            + "set "
            + "name = :name "
            + "where id = :id";
    var params = {
        "id": id,
        "name": name
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    updateCallback();
};
KmUserInfo.prototype.delete = function (id, deleteCallback) {
    var sql = "delete from km_user where id = :id";
    var params = {
        "id": id
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    deleteCallback();
};
