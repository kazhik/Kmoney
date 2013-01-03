function KmSource(db) {
    this.mDb = db;
}

KmSource.prototype.loadSourceType = function (srcName, loadCallback) {
    this.mDb.selectQuery("select id from km_source where name = '" + srcName + "'");
    var records = this.mDb.getRecords();
    var sourceType;
    if (records.length === 1) {
        sourceType = records[0][0];
    } else {
        sourceType = 0;
    }
    loadCallback(sourceType);
};

KmSource.prototype.load = function(loadCallback) {
    this.mDb.selectQuery("select A.id, A.name, A.file_ext from km_source A " +
                         "where A.import = 1 and A.enabled = 1");
    loadCallback(this.mDb.getRecords());
};
KmSource.prototype.loadMaster = function(loadCallback) {
    var sql = ["select A.id, A.name, ",
               "A.enabled, ",
               "case",
               "when A.enabled = 1 then '" + km_getLStr("enabled.true") + "'",
               "when A.enabled = 0 then '" + km_getLStr("enabled.false") + "'",
               "end as enabledStr",
               "from km_source A",
               "where A.import = 1"].join(" ");
    this.mDb.selectQuery(sql);
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};

KmSource.prototype.insert = function(params, insertCallback) {
    var sql = "insert into km_source ("
      + "name, "
      + "import, "
      + "enabled, "
      + "file_ext "
      + ") values ( "
      + ":name, "
      + ":import, "
      + ":enabled, "
      + ":file_ext)";

    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    insertCallback(this.mDb.getLastInsertRowId());
};

KmSource.prototype.update = function(id, params, updateCallback) {
    var sql = "update km_source "
      + "set "
      + "enabled = :enabled "
      + "where id = :id";

    params["id"] = id;
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    updateCallback();
};