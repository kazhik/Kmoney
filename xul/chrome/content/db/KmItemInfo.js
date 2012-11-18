function KmItemInfo(db) {
    this.mDb = db;
    this.mItemList = null;
}

KmItemInfo.prototype.loadItemList = function(loadCallback) {
    this.mDb.selectQuery("select id, name from km_item");
    this.mItemList = this.mDb.getRecords();
    loadCallback(this.mItemList);

};
KmItemInfo.prototype.loadMaster = function(loadCallback) {
    var sql = ["select id, name, sum_include,",
               "case",
               "when sum_include = 0 then '" + km_getLStr("sum_include.false") + "'",
               "when sum_include = 1 then '" + km_getLStr("sum_include.true") + "'",
               "end",
               "from km_item"].join(" ");
    this.mDb.selectQuery(sql);
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};

KmItemInfo.prototype.insert = function(name, sumInclude, insertCallback) {
    var sql = "insert into km_item ("
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
KmItemInfo.prototype.update = function(id, name, sumInclude, updateCallback) {
    var sql = "update km_item "
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
KmItemInfo.prototype.delete = function(itemId, newItemId, deleteCallback) {
    var params = {
        "item_id": itemId,
    };
    var stmtArray = [];
    // 削除する費目のトランザクションデータとインポート設定を変更
    if (newItemId !== null) {
        params["new_item_id"] = newItemId;
        var sqlArray = [
            "update km_realmoney_trns set item_id = :new_item_id where item_id = :item_id", 
            "update km_bank_trns set item_id = :new_item_id where item_id = :item_id", 
            "update km_creditcard_trns set item_id = :new_item_id where item_id = :item_id", 
            "update km_emoney_trns set item_id = :new_item_id where item_id = :item_id",
            "update km_import set item_id = :new_item_id where item_id = :item_id"
        ];
        for (var i = 0; i < sqlArray.length; i++) {
            km_log(sqlArray[i]);
            var updateStatement = this.mDb.createStatementWithParams(sqlArray[i], params);
            stmtArray.push(updateStatement);
        }
    }
    sql = "delete from km_item where id = :item_id";
    var deleteStatement = this.mDb.createStatementWithParams(sql, params);
    km_debug(sql);
    stmtArray.push(deleteStatement);
    
    this.mDb.execTransaction(stmtArray);

    deleteCallback();
};