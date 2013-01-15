function KmImport(db) {
    this.mDb = db;
}

KmImport.prototype.load = function(userId, sourceType, sourceName, loadCallback) {
    var sql = ["select detail, category_id, default_id, internal ",
               "from km_import ",
               "where user_id = :userId",
               " and source_type = :sourceType"].join(" ");
    if (sourceName !== null) {
        sql += " and source_name = :sourceName";
    }
    var param = {
        "userId": parseInt(userId),
        "sourceType": parseInt(sourceType),
        "sourceName": sourceName
    };
    
    var sqlStatement = this.mDb.createStatementWithParams(sql, param);
    this.mDb.execSelect(sqlStatement);

    loadCallback(this.mDb.getRecords());
};
KmImport.prototype.loadConf = function(userId, sourceType, sourceName, loadCallback) {
    km_debug("KmImport.loadConf start");
    var sql = ["select A.id, A.source_type, A.detail, A.category_id,",
               "B.name, A.default_id, A.internal, A.permission ",
               "from km_import A ",
               "inner join km_category B ",
               "on A.category_id = B.id ",
               "where user_id = :userId",
               " and source_type = :sourceType"].join(" ");
    if (sourceName !== "") {
        sql += " and source_name = :sourceName";
    }
    var param = {
        "userId": parseInt(userId),
        "sourceType": parseInt(sourceType),
        "sourceName": sourceName
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, param);
    this.mDb.execSelect(sqlStatement);

    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};
KmImport.prototype.getDefaultConfId = function(userId, sourceType, sourceName) {
    var sql = ["select id from km_import ",
               "where default_id = 1 ",
               " and user_id = :userId",
               " and source_type = :sourceType"].join(" ");
    if (sourceName !== "") {
        sql += " and source_name = :sourceName";
    }
    var param = {
        "userId": parseInt(userId),
        "sourceType": parseInt(sourceType),
        "sourceName": sourceName
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, param);
    this.mDb.execSelect(sqlStatement);

    var records = this.mDb.getRecords();
    if (records.length === 0) {
        return 0;
    }
    return records[0][0];
}

KmImport.prototype.insert = function(params, insertCallback) {
    var sql = "insert into km_import ("
      + "user_id, "
      + "source_type, "
      + "source_name, "
      + "detail, "
      + "category_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ") values ( "
      + ":userId, "
      + ":sourceType, "
      + ":sourceName, "
      + ":detail, "
      + ":categoryId, "
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
      + "category_id = :categoryId, "
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
KmImport.prototype.deleteItem = function(categoryId, deleteCallback) {
    var sql = "delete from km_import where category_id = :category_id";
    var params = {
        "category_id": categoryId
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    deleteCallback();
    
};