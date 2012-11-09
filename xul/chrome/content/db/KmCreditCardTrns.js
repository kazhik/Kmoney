function KmCreditCardTrns(db) {
    this.mDb = db;
}
KmCreditCardTrns.prototype.load = function(sortParams, queryParams, loadCallback) {
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
        } else if (key === "creditcard") {
            keyCol = "A.card_id";
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
               "A.id ",
               "from km_creditcard_trns A ",
               "left join km_item B ",
               " on A.item_id = B.id ",
               "inner join km_user C ",
               " on A.user_id = C.id ",
               "inner join km_creditcard_info D ",
               " on A.card_id = D.id "].join(" ");
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
    var keyList = [];
    for (var i = 0; i < idList.length; i++) {
        var key = "id_" + i;
        keyList.push(":" + key);
        params[key] = idList[i];
    }
    var inClause = keyList.join(",");
    var sql;
    var sqlStatement;
    var sqlStmtArray = [];
    if (idList.length > 1) {
        sql = ["update km_creditcard_trns ",
                   "set ",
                   "transaction_date = :transactionDate, ",
                   "item_id = :itemId, ",
                   "detail = :detail, ",
                   "user_id = :userId, ",
                   "card_id = :cardId, ",
                   "last_update_date = datetime('now', 'localtime'), ",
                   "source = :source",
                   "where id in (" + inClause + ")"].join(" ");
    } else {
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
                   "where id in (" + inClause + ")"].join(" ");
    }
    km_log(sql);
    sqlStatement = this.mDb.createStatementWithParams(sql, params);
    sqlStmtArray.push(sqlStatement);
    
    if (params['payMonth'] !== undefined) {
        if (idList.length > 1) {
            sql = ["update km_creditcard_payment ",
                 "set ",
                 "transaction_date = :transactionDate, ",
                 "detail = :detail, ",
                 "pay_month = :payMonth, ",
                 "user_id = :userId, ",
                 "card_id = :cardId, ",
                 "last_update_date = datetime('now', 'localtime') ",
                 "where transaction_id in (" + inClause +")"].join(" ");
        } else {
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
                 "where transaction_id in (" + inClause + ")"].join(" ");
        }
        km_log(sql);
        sqlStatement = this.mDb.createStatementWithParams(sql, params);
        sqlStmtArray.push(sqlStatement);
    }
    this.mDb.execTransaction(sqlStmtArray);
    updateCallback(idList[0]);
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
