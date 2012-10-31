function KmEMoneyTrns(db) {
    this.mDb = db;
}
KmEMoneyTrns.prototype.load = function(sortParams, queryParams, loadCallback) {
    var orderBy = "";
    if (sortParams !== undefined) {
        for (var i = 0; i < sortParams.length; i++) {
            orderBy += sortParams[i]['column'];
            if (sortParams[i]['order'] != undefined) {
                orderBy += " " + sortParams[i]['order'];
            }
        }
    } else {
        orderBy += "A.transaction_date asc";
    }
    
    var where = "";
    var operator = "";
    var keyCol;
    
    for (var i = 0; i < 2; i++) {
        var key = queryParams[i]['key'];
        if (key === "none") {
            break;
        }
        if (key === "date") {
            keyCol = "A.transaction_date";
            operator = queryParams[i]['operator'];
        } else if (key === "item") {
            keyCol = "A.item_id";
            operator = "=";
        } else if (key === "detail") {
            keyCol = "A.detail";
            operator = queryParams[i]['operator'];
        } else if (key === "user") {
            keyCol = "A.user_id";
            operator = "=";
        } else if (key === "emoney") {
            keyCol = "A.money_id";
            operator = "=";
        }
        if (i === 0) {
            where = " where ";
        } else {
            where += " " + queryParams[1]['andor'] + " ";
        }
        where += keyCol;
        where += " ";
        where += operator;
        where += " ";
        where += ":" + key + "_" + String(i + 1);
        if (operator === 'like') {
            where += " escape '/'";
        }
    }

    var sql = ["select ",
               "A.transaction_date, ",
               "A.item_id, ",
               "B.name as item_name, ",
               "A.detail, ",
               "A.income, ",
               "A.expense, ",
               "A.money_id, ",
               "D.name as money_name, ",
               "A.user_id, ",
               "C.name as user_name, ",
               "A.source, ",
               "A.internal, ",
               "A.id ",
               "from km_emoney_trns A ",
               "left join km_item B ",
               " on A.item_id = B.id ",
               "inner join km_user C ",
               " on A.user_id = C.id ",
               "inner join km_emoney_info D ",
               " on A.money_id = D.id "].join(" ");
    if (where.length > 0) {
        sql += where;
    }
    sql += " order by " + orderBy;
    
    km_debug(sql);
    
    var stmt = this.mDb.createStatement(sql);
    if (stmt === null) {
        return;
    }
    for (var i = 0; i < 2; i++) {
        var key = queryParams[i]['key'];
        if (key === "none") {
            break;
        }
        if (queryParams[i]['operator'] === "like") {
            stmt.params[key + "_" + String(i + 1)] =
                "%" + stmt.escapeStringForLIKE(queryParams[i]['value'], "/") + "%";    
        } else {
            stmt.params[key + "_" + String(i + 1)] = queryParams[i]['value'];    
        }
    }

    this.mDb.execSelect(stmt);
    
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};
KmEMoneyTrns.prototype.import = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, true, insertCallback);
};
KmEMoneyTrns.prototype.insert = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, false, insertCallback);
};

KmEMoneyTrns.prototype.execInsert = function (newRecordArray, importFlag, insertCallback) {
    var sqlArray = [];
    for (var i = 0; i < newRecordArray.length; i++) {
        var sql = ["insert into km_emoney_trns ("
                  + "transaction_date, "
                  + "income, "
                  + "expense, "
                  + "item_id, "
                  + "detail, "
                  + "user_id, "
                  + "money_id, "
                  + "last_update_date, "
                  + "internal, "
                  + "source "
                  + ") "
                  + "select "
                  + "'" + newRecordArray[i]["transactionDate"] + "', "
                  + newRecordArray[i]["income"] + ", "
                  + newRecordArray[i]["expense"] + ", "
                  + newRecordArray[i]["itemId"] + ", "
                  + "\"" + newRecordArray[i]["detail"] + "\", "
                  + newRecordArray[i]["userId"] + ", "
                  + newRecordArray[i]["moneyId"] + ", "
                  + "datetime('now', 'localtime'), "
                  + newRecordArray[i]["internal"] + ", "
                  + newRecordArray[i]["source"] ];
        // 同じ入力元から同一期間のインポートは不可
        if (importFlag) {
            sql += [" where not exists (",
                    "select 1 from km_import_history",
                    "where source_type =" + newRecordArray[i]["source"],
                    "and period_from <= '" + newRecordArray[i]["transactionDate"] + "'",
                    "and period_to > '" + newRecordArray[i]["transactionDate"] + "'",
                    ")"].join(" ");
        }
        km_debug(sql);
        sqlArray.push(sql);
    }
    this.mDb.executeTransaction(sqlArray);
    insertCallback(this.mDb.getLastInsertRowId());
};
KmEMoneyTrns.prototype.update = function(id, params, updateCallback) {
    var sql = ["update km_emoney_trns "
            + "set "
            + "transaction_date = " + "'" + params['transactionDate'] + "', "
            + "income = " + params['income'] + ", "
            + "expense = " + params['expense'] + ", "
            + "item_id = " + params['itemId'] + ", "
            + "detail = " + "\"" + params['detail'] + "\", "
            + "user_id = " + params['userId'] + ", "
            + "money_id = " + params['moneyId'] + ", "
            + "last_update_date = datetime('now', 'localtime'), "
            + "internal = " + params['internal'] + ", "
            + "source = " + params['source']
            + "where id = " + id];
    km_debug(sql);
    this.mDb.executeTransaction([sql]);
    updateCallback(id);
};

KmEMoneyTrns.prototype.delete = function(id, deleteCallback) {
    var sql = ["delete from km_emoney_trns where id = " + id];
    km_debug(sql);
    this.mDb.executeTransaction(sql);
    
    deleteCallback();
};
