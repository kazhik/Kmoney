function KmCategory(db) {
    this.mDb = db;
    this.mItemList = null;
}

KmCategory.prototype.loadItemList = function(loadCallback) {
    var sql = ["select A.id, A.name, count(B.id) as cnt",
               "from km_category A",
               "left join kmv_transactions B",
               "on A.id = B.category_id",
               "group by A.id",
               "order by cnt desc"].join(" ");
    this.mDb.selectQuery(sql);
    this.mItemList = this.mDb.getRecords();
    loadCallback(this.mItemList);

};
KmCategory.prototype.loadMaster = function(loadCallback) {
    var sql = ["select id, name, sum_include,",
               "case",
               "when sum_include = 0 then '" + km_getLStr("sum_include.false") + "'",
               "when sum_include = 1 then '" + km_getLStr("sum_include.true") + "'",
               "end",
               "from km_category"].join(" ");
    this.mDb.selectQuery(sql);
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};

KmCategory.prototype.insert = function(name, sumInclude, insertCallback) {
    var sql = "insert into km_category ("
      + "name, "
      + "sum_include "
      + ") values ( "
      + ":name, "
      + ":sumInclude)";
    
    var params = {
        "name": name,
        "sumInclude": sumInclude
    };
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    insertCallback(this.mDb.getLastInsertRowId());
};
KmCategory.prototype.update = function(id, name, sumInclude, updateCallback) {
    var sql = "update km_category "
          + "set "
          + "name = :name, "
          + "sum_include = :sumInclude "
          + "where id = :id";
    var params = {
        "id": id,
        "name": name,
        "sumInclude": sumInclude
    };
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    updateCallback();
};
KmCategory.prototype.delete = function(categoryId, newItemId, deleteCallback) {
    var params = {
        "category_id": categoryId,
    };
    var stmtArray = [];
    // 削除する費目のトランザクションデータとインポート設定を変更
    if (newItemId !== null) {
        params["new_category_id"] = newItemId;
        var sqlArray = [
            "update km_cash_trns set category_id = :new_category_id where category_id = :category_id", 
            "update km_bank_trns set category_id = :new_category_id where category_id = :category_id", 
            "update km_creditcard_trns set category_id = :new_category_id where category_id = :category_id", 
            "update km_emoney_trns set category_id = :new_category_id where category_id = :category_id",
            "update km_import set category_id = :new_category_id where category_id = :category_id"
        ];
        for (var i = 0; i < sqlArray.length; i++) {
            km_log(sqlArray[i]);
            var updateStatement = this.mDb.createStatementWithParams(sqlArray[i], params);
            stmtArray.push(updateStatement);
        }
    }
    sql = "delete from km_category where id = :category_id";
    var deleteStatement = this.mDb.createStatementWithParams(sql, params);
    km_debug(sql);
    stmtArray.push(deleteStatement);
    
    this.mDb.execTransaction(stmtArray);

    deleteCallback();
};