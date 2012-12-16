function KmImport(db) {
    this.mDb = db;
}

KmImport.prototype.load = function(sourceType, loadCallback) {
    this.mDb.selectQuery("select detail, item_id, default_id, internal " +
                         "from km_import " + "where source_type = " + sourceType);

    
    loadCallback(this.mDb.getRecords());
};
KmImport.prototype.loadConf = function(sourceType, loadCallback) {
    km_debug("KmImport.loadConf start");
    this.mDb.selectQuery("select A.id, A.source_type, A.detail, A.item_id,"
                         + "B.name, A.default_id, A.internal, A.permission "
                         + "from km_import A "
                         + "inner join km_item B "
                         + "on A.item_id = B.id "
                         + "where A.source_type = " + sourceType);

    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};
KmImport.prototype.insert = function(params, insertCallback) {
    var sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ") values ( "
      + ":sourceType, "
      + ":detail, "
      + ":itemId, "
      + ":defaultId, "
      + "1, "
      + ":internal)";
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    insertCallback(this.mDb.getLastInsertRowId());

};
KmImport.prototype.update = function(id, params, updateCallback) {
    var sql = "update km_import "
      + "set detail = :detail, "
      + "item_id = :itemId, "
      + "default_id = :defaultId, "
      + "internal = :internal "
      + "where id = :id";

    km_log(sql);
    params["id"] = id;
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    updateCallback();
};
KmImport.prototype.delete = function(id, deleteCallback) {
    var sql = "delete from km_import where id = :id";
    var params = {
        "id": id
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    deleteCallback();
};
KmImport.prototype.checkItem = function(itemId, checkCallback) {
    var sql = "select count(*) from km_import where item_id = :item_id";
             
    var stmt = this.mDb.createStatement(sql);
    if (stmt === null) {
        checkCallback(0);
        return;
    }
    stmt.params["item_id"] = itemId;
    this.mDb.execSelect(stmt);
    var records = this.mDb.getRecords();
    checkCallback(parseInt(records[0][0]));
    
};