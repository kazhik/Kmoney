function KmCashTrns(db) {
    this.mDb = db;
}

KmCashTrns.prototype.load = function(sortParams, queryParams, loadCallback) {
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

    var sql = [
        "select ",
        "A.transaction_date, ",
        "A.item_id, ",
        "B.name as item_name, ",
        "A.detail, ",
        "A.income, ",
        "A.expense, ",
        "A.user_id, ",
        "C.name as user_name, ",
        "A.internal, ",
        "A.id ",
        "from km_realmoney_trns A ",
        "left join km_item B ",
        " on A.item_id = B.id ",
        "inner join km_user C ",
        " on A.user_id = C.id "
        ].join(" ");
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

KmCashTrns.prototype.import = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, true, insertCallback);
};
KmCashTrns.prototype.insert = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, false, insertCallback);
};

KmCashTrns.prototype.execInsert = function (newRecordArray, importFlag, insertCallback) {
    var sqlStmtArray = [];
    for (var i = 0; i < newRecordArray.length; i++) {
        var sql = ["insert into km_realmoney_trns (",
                        "transaction_date, ",
                        "income, ",
                        "expense, ",
                        "item_id, ",
                        "detail, ",
                        "user_id, ",
                        "internal, ",
                        "last_update_date, ",
                        "source ",
                        ") ",
                        "select ",
                        ":transactionDate,",
                        ":income,",
                        ":expense,",
                        ":itemId,",
                        ":detail,",
                        ":userId,",
                        ":internal,",
                        "datetime('now', 'localtime'), ",
                        ":source"].join(" ");
        // 同じ入力元から同一期間のインポートは不可
        if (importFlag) {
            sql += [" where not exists (",
                    "select 1 from km_import_history",
                    "where source_type =:source",
                    "and period_from <= :transactionDate",
                    "and period_to > :transactionDate",
                    ")"].join(" ");
        }
        km_log(sql);
        var sqlStatement = this.mDb.createStatementWithParams(sql, newRecordArray[i]);
        sqlStmtArray.push(sqlStatement);

    }
    this.mDb.execTransaction(sqlStmtArray);

    insertCallback(this.mDb.getLastInsertRowId());
};
KmCashTrns.prototype.update = function(idList, params, updateCallback) {
    var oneColumn = (Object.keys(params).length === 1)? true: false;
    var keyList = [];
    for (var i = 0; i < idList.length; i++) {
        var key = "id_" + i;
        keyList.push(":" + key);
        params[key] = idList[i];
    }
    var inClause = keyList.join(",");
    var sql;
    if (oneColumn) {
        sql = "update km_realmoney_trns ";
        sql += "set ";
        if (params["itemId"] !== undefined) {
            sql += "item_id = :itemId, ";
        } else if (params["detail"] !== undefined) {
            sql += "detail = :detail, ";
        } else if (params["userId"] !== undefined) {
            sql += "user_id = :userId, ";
        }
        sql += "last_update_date = datetime('now', 'localtime') "
        sql += "where id in (" + inClause + ")";

    } else {
        sql = ["update km_realmoney_trns ",
                   "set ",
                   "transaction_date = :transactionDate, ",
                   "income = :income, ",
                   "expense = :expense, ",
                   "item_id = :itemId, ",
                   "detail = :detail, ",
                   "user_id = :userId, ",
                   "last_update_date = datetime('now', 'localtime'), ",
                   "internal = :internal, ",
                   "source = :source ",
                   "where id in (" + inClause + ")"].join(" ");
    }
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    updateCallback(idList[0]);
};
KmCashTrns.prototype.delete = function(idList, deleteCallback) {
    var params = {};
    var keyList = [];
    for (var i = 0; i < idList.length; i++) {
        var key = "id_" + i;
        keyList.push(":" + key);
        params[key] = idList[i];
    }
    var inClause = keyList.join(",");
    var sql = "delete from km_realmoney_trns where id in (" + inClause + ")";
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    deleteCallback();
};

