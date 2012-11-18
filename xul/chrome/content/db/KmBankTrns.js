function KmBankTrns(db) {
    this.mDb = db;
}

KmBankTrns.prototype.load = function(sortParams, queryParams, loadCallback) {
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
        } else if (key === "bank") {
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

    var sql = [
        "select ",
        "A.transaction_date, ",
        "A.item_id, ",
        "B.name as item_name, ",
        "A.detail, ",
        "A.income, ",
        "A.expense, ",
        "A.bank_id, ",
        "D.name as bank_name, ",
        "A.user_id, ",
        "C.name as user_name, ",
        "A.source, ",
        "A.internal, ",
        "A.id ",
        "from km_bank_trns A ",
        "left join km_item B ",
        " on A.item_id = B.id ",
        "inner join km_user C ",
        " on A.user_id = C.id ",
        "inner join km_bank_info D ",
        " on A.bank_id = D.id "
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
KmBankTrns.prototype.loadDuplicate = function(loadCallback) {
    var sql = [
        "select ",
        "A.transaction_date, ",
        "A.item_id, ",
        "B.name as item_name, ",
        "A.detail, ",
        "A.income, ",
        "A.expense, ",
        "A.bank_id, ",
        "D.name as bank_name, ",
        "A.user_id, ",
        "C.name as user_name, ",
        "A.source, ",
        "A.internal, ",
        "A.id ",
        "from km_bank_trns A ",
        "left join km_item B ",
        " on A.item_id = B.id ",
        "inner join km_user C ",
        " on A.user_id = C.id ",
        "inner join km_bank_info D ",
        " on A.bank_id = D.id "
    ].join(" ");
    sql += ["inner join",
               "(select G.transaction_date, G.expense",
               "from km_bank_trns G",
               "group by G.transaction_date, G.expense",
               "having count(G.transaction_date) > 1) F",
               "on A.transaction_date = F.transaction_date",
               "and A.expense = F.expense"].join(" ");
    sql += " order by A.transaction_date, A.expense";
    km_debug(sql);
    this.mDb.selectQuery(sql);
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};
KmBankTrns.prototype.import = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, true, insertCallback);
};
KmBankTrns.prototype.insert = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, false, insertCallback);
};

KmBankTrns.prototype.execInsert = function(newRecordArray, importFlag, insertCallback) {
    var sqlStmtArray = [];
    var sqlStatement;
    for(var i = 0; i < newRecordArray.length; i++) {
        var sql = ["insert into km_bank_trns (",
                   "transaction_date, ",
                   "item_id, ",
                   "detail, ",
                   "income, ",
                   "expense, ",
                   "user_id, ",
                   "bank_id, ",
                   "internal, ",
                   "source, ",
                   "last_update_date " + ") ",
                   "select ",
                   ":transactionDate, ",
                   ":itemId, ",
                   ":detail, ",
                   ":income, ",
                   ":expense, ",
                   ":userId, ",
                   ":bankId, ",
                   ":internal, ",
                   ":source, ",
                   "datetime('now', 'localtime') "].join(" ");
        // 同じ入力元から同一期間のインポートは不可
        if (importFlag) {
            sql += [" where not exists (",
                    "select 1 from km_import_history",
                    "where source_type = :source",
                    "and period_from <= :transactionDate",
                    "and period_to > :transactionDate",
                    ")"].join(" ");
        }
        km_debug(sql);
        sqlStatement = this.mDb.createStatementWithParams(sql, newRecordArray[i]);
        sqlStmtArray.push(sqlStatement);

    }
    this.mDb.execTransaction(sqlStmtArray);
    
    insertCallback(this.mDb.getLastInsertRowId());
};
KmBankTrns.prototype.update = function(idList, params, updateCallback) {
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
        sql = "update km_bank_trns ";
        sql += "set ";
        if (params["itemId"] !== undefined) {
            sql += "item_id = :itemId, ";
        } else if (params["detail"] !== undefined) {
            sql += "detail = :detail, ";
        } else if (params["userId"] !== undefined) {
            sql += "user_id = :userId, ";
        } else if (params["bankId"] !== undefined) {
            sql += "bank_id = :bankId, ";
        }
        sql += "last_update_date = datetime('now', 'localtime') "
        sql += "where id in (" + inClause + ")";
    } else {
        sql = ["update km_bank_trns ",
                   "set ",
                   "transaction_date = :transactionDate, ",
                   "income = :income, ",
                   "expense = :expense, ",
                   "item_id = :itemId, ",
                   "detail = :detail, ",
                   "user_id = :userId, ",
                   "bank_id = :bankId, ",
                   "last_update_date = datetime('now', 'localtime'), ",
                   "internal = :internal, ",
                   "source = :source ",
                   "where id in (" +inClause + ")"].join(" ");
    }
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    updateCallback(idList[0]);
};
KmBankTrns.prototype.delete = function(idList, deleteCallback) {
    var params = {};
    var keyList = [];
    for (var i = 0; i < idList.length; i++) {
        var key = "id_" + i;
        keyList.push(":" + key);
        params[key] = idList[i];
    }
    var inClause = keyList.join(",");
    var sql = "delete from km_bank_trns where id in (" + inClause + ")";
    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    deleteCallback();
};
KmBankTrns.prototype.loadSumPerMonth = function(params, loadCallback) {
    var sql = ["select",
                        "strftime('%Y/%m', transaction_date) as transaction_month,",
                        "sum(income - expense) as sumpermonth",
                        "from km_bank_trns",
                        "where transaction_month >= :periodFrom",
                        "and transaction_month <= :periodTo"].join(" ");
    if (params["userId"] !== 0) {
        sql += " and user_id = :userId";
    }
    if (params["bankId"] !== 0) {
        sql += " and bank_id = :bankId ";
    }
    sql += " group by transaction_month ";

    km_debug(sql);
    km_debug(JSON.stringify(params));
    this.mDb.selectWithParams(sql, params);
    loadCallback(this.mDb.getRecords());
};

