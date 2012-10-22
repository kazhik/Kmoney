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
    var sql = ["insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ") values ( "
      + params["sourceType"] + ", "
      + "'" + params["detail"] + "', "
      + params["itemId"] + ", "
      + params["defaultId"] + ", "
      + "1, "
      + params["internal"] + ")"];
    km_debug(sql);
    this.mDb.executeTransaction(sql);
    insertCallback(this.mDb.getLastInsertRowId());

};
KmImport.prototype.update = function(id, params, updateCallback) {
    var sql = ["update km_import "
      + "set detail = '" + params["detail"] + "', "
      + "item_id = " + params["itemId"] + ", "
      + "default_id = " + params["defaultId"] + ", "
      + "internal = " + params["internal"] + " "
      + "where id = " + id];
    km_debug(sql);
    this.mDb.executeTransaction(sql);
    updateCallback();
};
KmImport.prototype.delete = function(id, deleteCallback) {
    var sql = ["delete from km_import where id = " + id];
    km_debug(sql);
    this.mDb.executeTransaction(sql);
    deleteCallback();
};
