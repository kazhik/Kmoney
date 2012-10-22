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
KmCreditCardTrns.prototype.insert = function (newRecordArray, insertCallback) {
    var sqlArray = [];
    var sqlPayment;
    var sqlTransaction;
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
                          "'" + newRecordArray[i]["transactionDate"] + "', ",
                          newRecordArray[i]["itemId"] + ", ",
                          "\"" + newRecordArray[i]["detail"] + "\", ",
                          newRecordArray[i]["boughtAmount"] + ", ",
                          newRecordArray[i]["userId"] + ", ",
                          newRecordArray[i]["cardId"] + ", ",
                          newRecordArray[i]["internal"] + ", ",
                          newRecordArray[i]["source"] + ", ",
                          "datetime('now', 'localtime') ",
                          "where not exists (",
                          " select 1 from km_creditcard_trns ",
                          " where transaction_date = '" + newRecordArray[i]["transactionDate"] + "'",
                          " and item_id = " + newRecordArray[i]["itemId"],
                          " and expense = " + newRecordArray[i]["boughtAmount"],
                          " and card_id = " + newRecordArray[i]["cardId"],
                          " and user_id = " + newRecordArray[i]["userId"] + ")"].join(" ");
        km_log(sqlTransaction);
        sqlArray.push(sqlTransaction);
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
                          "'" + newRecordArray[i]["transactionDate"] + "', ",
                          newRecordArray[i]["boughtAmount"] + ", ",
                          newRecordArray[i]["payAmount"] + ", ",
                          "'" + newRecordArray[i]["payMonth"] + "', ",
                          newRecordArray[i]["remainingBalance"] + ", ",
                          "\"" + newRecordArray[i]["detail"] + "\", ",
                          newRecordArray[i]["userId"] + ", ",
                          newRecordArray[i]["cardId"] + ", ",
                          "(select max(id) from km_creditcard_trns ", // 同一内容のレコードが複数件
                          " where transaction_date = '" + newRecordArray[i]["transactionDate"] + "'",
                          " and expense = " + newRecordArray[i]["boughtAmount"],
                          " and card_id = " + newRecordArray[i]["cardId"],
                          " and user_id = " + newRecordArray[i]["userId"] + "), ",
                          "datetime('now', 'localtime') ",
                          "where not exists (",
                          " select 1 from km_creditcard_payment ",
                          " where transaction_date = '" + newRecordArray[i]["transactionDate"] + "'",
                          " and bought_amount = " + newRecordArray[i]["boughtAmount"],
                          " and card_id = " + newRecordArray[i]["cardId"],
                          " and user_id = " + newRecordArray[i]["userId"] + ")"].join(" ");
            km_log(sqlPayment);
            sqlArray.push(sqlPayment);
        }
    }
    this.mDb.executeTransaction(sqlArray);
    insertCallback(this.mDb.getLastInsertRowId());
};
KmCreditCardTrns.prototype.update = function(id, params, updateCallback) {
    var sqlArray = [["update km_creditcard_trns ",
               "set ",
               "transaction_date = " + "'" + params['transactionDate'] + "', ",
               "expense = " + params['boughtAmount'] + ", ",
               "item_id = " + params['itemId'] + ", ",
               "detail = \"" + params['detail'] + "\", ",
               "user_id = " + params['userId'] + ", ",
               "card_id = " + params['cardId'] + ", ",
               "last_update_date = datetime('now', 'localtime'), ",
               "source = 1 ",
               "where id = " + id].join(" ")];
    km_log(sqlArray[0]);
    if (parseInt(params['payMonth']) !== 0) {
        sqlArray.push(
            ["update km_creditcard_payment ",
             "set ",
             "transaction_date = '" + params['transactionDate'] + "', ",
             "detail = \"" + params['detail'] + "\", ",
             "bought_amount = " + params['boughtAmount'] + ", ",
             "pay_amount = " + params['payAmount'] + ", ",
             "pay_month = '" + params['payMonth'] + "', ",
             "user_id = " + params['userId'] + ", ",
             "card_id = " + params['cardId'] + ", ",
             "last_update_date = datetime('now', 'localtime') ",
             "where transaction_id = " + id].join(" ")
                      );
        km_log(sqlArray[1]);
    }
    this.mDb.executeTransaction(sqlArray);

    updateCallback();
};
KmCreditCardTrns.prototype.delete = function(id, deleteCallback) {
    var sql = ["delete from km_creditcard_trns where id = " + id,
               "delete from km_creditcard_payment where transaction_id = " + id];
    km_debug(sql);
    this.mDb.executeTransaction(sql);
    
    deleteCallback();
};
