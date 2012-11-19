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
            keyCol = "D.name";
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

KmEMoneyTrns.prototype.loadDuplicate = function(loadCallback) {
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
    sql += ["inner join",
               "(select G.transaction_date, G.income, G.expense",
               "from km_emoney_trns G",
               "group by G.transaction_date, G.income, G.expense",
               "having count(G.transaction_date) > 1) F",
               "on A.transaction_date = F.transaction_date",
               "and A.income = F.income",
               "and A.expense = F.expense"].join(" ");
    sql += " order by A.transaction_date, A.income, A.expense";
    km_debug(sql);
    this.mDb.selectQuery(sql);
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};

KmEMoneyTrns.prototype.import = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, true, insertCallback);
};
KmEMoneyTrns.prototype.insert = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, false, insertCallback);
};

KmEMoneyTrns.prototype.execInsert = function (newRecordArray, importFlag, insertCallback) {
    var sqlStmtArray = [];
    var sqlStatement;
    for (var i = 0; i < newRecordArray.length; i++) {
        var sql = "insert into km_emoney_trns ("
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
                  + ":transactionDate, "
                  + ":income, "
                  + ":expense, "
                  + ":itemId, "
                  + ":detail, "
                  + ":userId, "
                  + ":moneyId, "
                  + "datetime('now', 'localtime'), "
                  + ":internal, "
                  + ":source";
        // 同じ入力元から同一期間のインポートは不可
        if (importFlag) {
            sql += [" where not exists (",
                    "select 1 from km_import_history",
                    "where source_type = :source",
                    "and period_from <= :transactionDate",
                    "and period_to > :transactionDate",
                    ")"].join(" ");
        }
        km_log(sql);
        sqlStatement = this.mDb.createStatementWithParams(sql, newRecordArray[i]);
        sqlStmtArray.push(sqlStatement);
    }
    this.mDb.execTransaction(sqlStmtArray);
    insertCallback(this.mDb.getLastInsertRowId());
};
KmEMoneyTrns.prototype.update = function(idList, params, updateCallback) {
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
        sql = "update km_emoney_trns ";
        sql += "set ";
        if (params["itemId"] !== undefined) {
            sql += "item_id = :itemId, ";
        } else if (params["detail"] !== undefined) {
            sql += "detail = :detail, ";
        } else if (params["userId"] !== undefined) {
            sql += "user_id = :userId, ";
        } else if (params["moneyId"] !== undefined) {
            sql += "money_id = :moneyId, ";
        }
        sql += "last_update_date = datetime('now', 'localtime') "
        sql += "where id in (" + inClause + ")";
    } else {
        sql = "update km_emoney_trns "
                + "set "
                + "transaction_date = :transactionDate, "
                + "income = :income, "
                + "expense = :expense, "
                + "item_id = :itemId, "
                + "detail = :detail, "
                + "user_id = :userId, "
                + "money_id = :moneyId, "
                + "last_update_date = datetime('now', 'localtime'), "
                + "internal = :internal, "
                + "source = :source "
                + "where id in (" + inClause + ") ";
    }
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    updateCallback(idList[0]);
    
};

KmEMoneyTrns.prototype.delete = function(idList, deleteCallback) {
    var params = {};
    var keyList = [];
    for (var i = 0; i < idList.length; i++) {
        var key = "id_" + i;
        keyList.push(":" + key);
        params[key] = idList[i];
    }
    var inClause = keyList.join(",");
    var sql = "delete from km_emoney_trns where id in (" + inClause + ")";
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    deleteCallback();
};
