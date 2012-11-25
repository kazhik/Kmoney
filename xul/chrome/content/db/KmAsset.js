function KmAsset(db) {
    this.mDb = db;
}
KmAsset.prototype.load = function(loadCallback) {
    var sql = ["select",
               "A.id, A.name, A.amount, A.user_id, B.name, A.asset_type,",
               "case",
               "when A.asset_type = 1 then '" + km_getLStr("asset_type.personal") + "'",
               "when A.asset_type = 2 then '" + km_getLStr("asset_type.family") + "'",
               "end",
               "from km_asset A",
               "inner join km_user B",
               "on A.user_id = B.id"].join(" ");
    this.mDb.selectQuery(sql);
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};

KmAsset.prototype.insert = function(params, insertCallback) {
    var sql;
    var stmtArray = [];
    
    sql = ["insert into km_asset (",
               "name, amount, user_id, asset_type",
               ") values (",
               ":name, :amount, :userId, :assetType)"].join(" ");

    stmtArray.push(this.mDb.createStatementWithParams(sql, params));
    
    sql = ["insert into km_asset_history (",
           "asset_id, transaction_type, transaction_id",
           ") values (",
           "last_insert_rowid(), :transactionType, :transactionId)"].join(" ");
           
    stmtArray.push(this.mDb.createStatementWithParams(sql, params));
    
    this.mDb.execTransaction(stmtArray);
    
    insertCallback(this.mDb.getLastInsertRowId());
};
KmAsset.prototype.update = function(id, params, updateCallback) {
    var sql;
    var stmtArray = [];
    sql = ["update km_asset",
           "set",
           "name = :name,",
           "amount = amount + :amount,",
           "user_id = :userId,",
           "asset_type = :assetType",
           "where id = :id"].join(" ");

    params["id"] = id;
    stmtArray.push(this.mDb.createStatementWithParams(sql, params));
    
    sql = ["insert into km_asset_history (",
           "asset_id, transaction_type, transaction_id",
           ") values (",
           ":id, :transactionType, :transactionId)"].join(" ");
           
    stmtArray.push(this.mDb.createStatementWithParams(sql, params));
    
    this.mDb.execTransaction(stmtArray);
    
    updateCallback();
};
KmAsset.prototype.delete = function(id, deleteCallback) {
    var sql = "delete from km_asset where id = :id";
    var params = {
        "id": id
    };
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    deleteCallback();
};

