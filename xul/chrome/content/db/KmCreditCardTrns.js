function KmCreditCardTrns(db) {
    this.mDb = db;
}
KmCreditCardTrns.prototype.load = function(sortParams, queryParams, loadCallback) {
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
        } else if (key === "creditcard") {
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
               "A.expense, ",
               "A.card_id, ",
               "D.name as card_name, ",
               "A.user_id, ",
               "C.name as user_name, ",
               "(select max(E.pay_month) from km_creditcard_payment E ",
               " where A.id = E.transaction_id) as pay_month, ",
               "E.name, ",
               "case",
               "when A.internal = 0 then '" + km_getLStr("internal.none") + "'",
               "when A.internal = 1 then '" + km_getLStr("internal.self") + "'",
               "when A.internal = 2 then '" + km_getLStr("internal.family") + "'",
               "end as type, ",
               "A.internal, ",
               "A.id ",
               "from km_creditcard_trns A ",
               "left join km_item B ",
               " on A.item_id = B.id ",
               "inner join km_user C ",
               " on A.user_id = C.id ",
               "inner join km_creditcard_info D ",
               " on A.card_id = D.id ",
               "inner join km_source E",
               " on A.source = E.id"
               ].join(" ");
    if (where.length > 0) {
        sql += where;
    }

    var orderBy = "";
    if (sortParams !== undefined) {
        for (var i = 0; i < sortParams.length; i++) {
            if (sortParams[i]['order'] !== undefined && sortParams[i]['order'] !== "") {
                orderBy += sortParams[i]['column'] + " " + sortParams[i]['order'] + " ";
            }
        }
    }
    if (orderBy !== "") {
        sql += " order by " + orderBy;
    }
    
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
KmCreditCardTrns.prototype.loadDuplicate = function(loadCallback) {
    var sql = ["select ",
               "A.transaction_date, ",
               "A.item_id, ",
               "B.name as item_name, ",
               "A.detail, ",
               "A.expense, ",
               "A.card_id, ",
               "D.name as card_name, ",
               "A.user_id, ",
               "C.name as user_name, ",
               "(select max(E.pay_month) from km_creditcard_payment E ",
               " where A.id = E.transaction_id) as pay_month, ",
               "E.name, ",
               "case",
               "when A.internal = 0 then '" + km_getLStr("internal.none") + "'",
               "when A.internal = 1 then '" + km_getLStr("internal.self") + "'",
               "when A.internal = 2 then '" + km_getLStr("internal.family") + "'",
               "end as type, ",
               "A.internal, ",
               "A.id ",
               "from km_creditcard_trns A ",
               "left join km_item B ",
               " on A.item_id = B.id ",
               "inner join km_user C ",
               " on A.user_id = C.id ",
               "inner join km_creditcard_info D ",
               " on A.card_id = D.id ",
               "inner join km_source E",
               " on A.source = E.id "].join(" ");
    sql += ["inner join",
               "(select G.transaction_date, G.expense",
               "from km_creditcard_trns G",
               "group by G.transaction_date, G.expense",
               "having count(G.transaction_date) > 1) F",
               "on A.transaction_date = F.transaction_date",
               "and A.expense = F.expense"].join(" ");
    sql += " order by A.transaction_date, A.expense";
    km_debug(sql);
    this.mDb.selectQuery(sql);
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};

KmCreditCardTrns.prototype.import = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, true, insertCallback);
};
KmCreditCardTrns.prototype.insert = function(newRecordArray, insertCallback) {
    this.execInsert(newRecordArray, false, insertCallback);
};

KmCreditCardTrns.prototype.execInsert = function (newRecordArray, importFlag, insertCallback) {
    var sqlStatement;
    var sqlStmtArray = [];
    var sqlPayment;
    var sqlTransaction;
    var lastRowId = 0;
    for (var i = 0; i < newRecordArray.length; i++) {
        sqlTransaction = ["insert into km_creditcard_trns (",
                          "transaction_date, ",
                          "item_id, ",
                          "detail, ",
                          "expense, ",
                          "user_id, ",
                          "card_id, ",
                          "internal, ",
                          "source, ",
                          "last_update_date ",
                          ") ",
                          "select ",
                          ":transactionDate, ",
                          ":itemId, ",
                          ":detail, ",
                          ":boughtAmount, ",
                          ":userId, ",
                          ":cardId, ",
                          ":internal, ",
                          ":source, ",
                          "datetime('now', 'localtime') "].join(" ");
        // 同じ入力元から同一期間のインポートは不可
        if (importFlag) {
            sqlTransaction += [" where not exists (",
                    "select 1 from km_import_history",
                    "where source_type = :source",
                    "and period_from <= :transactionDate",
                    "and period_to > :transactionDate",
                    ")"].join(" ");
        }
        km_log(sqlTransaction);
        sqlStatement = this.mDb.createStatementWithParams(sqlTransaction, newRecordArray[i]);
        sqlStmtArray.push(sqlStatement);
        if (newRecordArray[i]['payAmount'] !== undefined) {
            sqlPayment = ["insert into km_creditcard_payment (",
                          "transaction_date, ",
                          "bought_amount, ",
                          "pay_amount, ",
                          "pay_month, ",
                          "remaining_balance, ",
                          "detail, ",
                          "user_id, ",
                          "card_id, ",
                          "transaction_id, ",
                          "last_update_date " + ") ",
                          "select ",
                          ":transactionDate, ",
                          ":boughtAmount, ",
                          ":payAmount, ",
                          ":payMonth, ",
                          ":remainingBalance, ",
                          ":detail, ",
                          ":userId, ",
                          ":cardId, ",
                          "last_insert_rowid(), ",
                          "datetime('now', 'localtime') "].join(" ");
            if (importFlag) {
                sqlPayment += [" where not exists (",
                        "select 1 from km_import_history",
                        "where source_type = :source",
                        "and period_from <= :transactionDate",
                        "and period_to > :transactionDate",
                        ")"].join(" ");
            }
            km_log(sqlPayment);
            sqlStatement = this.mDb.createStatementWithParams(sqlPayment, newRecordArray[i]);
            sqlStmtArray.push(sqlStatement);
        }
    }
    this.mDb.execTransaction(sqlStmtArray);
    insertCallback(this.mDb.getLastInsertRowId("km_creditcard_trns"));
};
KmCreditCardTrns.prototype.update = function(idList, params, updateCallback) {
    if (Object.keys(params).length === 1) {
        this.updateOneColumn(idList, params, updateCallback);
    } else {
        // idListは必ず1件になる
        params["id"] = idList[0];
        this.updateMultiColumn(params, updateCallback);
    }
};

KmCreditCardTrns.prototype.updateOneColumn = function(idList, params, updateCallback) {
    var keyList = [];
    for (var i = 0; i < idList.length; i++) {
        var key = "id_" + i;
        keyList.push(":" + key);
        params[key] = idList[i];
    }
    var idArray = keyList.join(",");
    var sql;
    var sqlStatement;
    var sqlStmtArray = [];
    sql = "update km_creditcard_trns ";
    sql += "set ";
    if (params["itemId"] !== undefined) {
        sql += "item_id = :itemId, ";
    } else if (params["detail"] !== undefined) {
        sql += "detail = :detail, ";
    } else if (params["userId"] !== undefined) {
        sql += "user_id = :userId, ";
    } else if (params["cardId"] !== undefined) {
        sql += "card_id = :cardId, ";
    }
    sql += "last_update_date = datetime('now', 'localtime') "
    sql += "where id in (" + idArray + ")";
    km_log(sql);
    sqlStatement = this.mDb.createStatementWithParams(sql, params);
    sqlStmtArray.push(sqlStatement);
    
    sql = "update km_creditcard_payment ";
    sql += "set ";
    if (params["detail"] !== undefined) {
        sql += "detail = :detail, ";
    } else if (params["userId"] !== undefined) {
        sql += "user_id = :userId, ";
    } else if (params["cardId"] !== undefined) {
        sql += "card_id = :cardId, ";
    }
    sql += "last_update_date = datetime('now', 'localtime') "
    sql += "where transaction_id in (" + idArray + ")";
    km_log(sql);
    sqlStatement = this.mDb.createStatementWithParams(sql, params);
    sqlStmtArray.push(sqlStatement);
    this.mDb.execTransaction(sqlStmtArray);
    updateCallback(idList[0]);
};

KmCreditCardTrns.prototype.updateMultiColumn = function(params, updateCallback) {
    var sql;
    var sqlStatement;
    var sqlStmtArray = [];
    sql = ["update km_creditcard_trns ",
               "set ",
               "transaction_date = :transactionDate, ",
               "expense = :boughtAmount, ",
               "item_id = :itemId, ",
               "detail = :detail, ",
               "user_id = :userId, ",
               "card_id = :cardId, ",
               "last_update_date = datetime('now', 'localtime'), ",
               "source = :source",
               "where id = :id"].join(" ");
    km_log(sql);
    sqlStatement = this.mDb.createStatementWithParams(sql, params);
    sqlStmtArray.push(sqlStatement);
    
    if (params['payMonth'] !== undefined) {
        // 支払月が更新時に追加された場合
        // transaction_idが同一のレコードがkm_creditcard_paymentになければinsert
        sql = ["insert into km_creditcard_payment (",
                      "transaction_date, ",
                      "bought_amount, ",
                      "pay_amount, ",
                      "pay_month, ",
                      "remaining_balance, ",
                      "detail, ",
                      "user_id, ",
                      "card_id, ",
                      "transaction_id, ",
                      "last_update_date " + ") ",
                      "select ",
                      ":transactionDate, ",
                      ":boughtAmount, ",
                      ":payAmount, ",
                      ":payMonth, ",
                      ":remainingBalance, ",
                      ":detail, ",
                      ":userId, ",
                      ":cardId, ",
                      ":id, ",
                      "datetime('now', 'localtime') ",
                      "where not exists (",
                      "select 1 from km_creditcard_payment",
                      "where transaction_id = :id)"
                      ].join(" ");        
        km_log(sql);
        sqlStatement = this.mDb.createStatementWithParams(sql, params);
        sqlStmtArray.push(sqlStatement);
        sql = ["update km_creditcard_payment ",
             "set ",
             "transaction_date = :transactionDate, ",
             "detail = :detail, ",
             "bought_amount = :boughtAmount, ",
             "pay_amount = :payAmount, ",
             "pay_month = :payMonth, ",
             "user_id = :userId, ",
             "card_id = :cardId, ",
             "last_update_date = datetime('now', 'localtime') ",
             "where transaction_id = :id"].join(" ");
        km_log(sql);
        sqlStatement = this.mDb.createStatementWithParams(sql, params);
        sqlStmtArray.push(sqlStatement);
    }
    this.mDb.execTransaction(sqlStmtArray);
    updateCallback(params["id"]);
};

KmCreditCardTrns.prototype.delete = function(idList, deleteCallback) {
    var params = {};
    var keyList = [];
    for (var i = 0; i < idList.length; i++) {
        var key = "id_" + i;
        keyList.push(":" + key);
        params[key] = idList[i];
    }
    var inClause = keyList.join(",");
    var sqlArray = ["delete from km_creditcard_trns where id in (" + inClause + ")",
               "delete from km_creditcard_payment where transaction_id in (" + inClause + ")"];
    var sqlStmtArray = [];
    for (var i = 0; i < sqlArray.length; i++) {
        km_log(sqlArray[i]);
        var sqlStatement = this.mDb.createStatementWithParams(sqlArray[i], params);
        sqlStmtArray.push(sqlStatement);
    }
    this.mDb.execTransaction(sqlStmtArray);
    
    deleteCallback();
};
