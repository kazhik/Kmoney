function KmvTransactions(db) {
    this.mDb = db;
}

KmvTransactions.prototype.checkItem = function(itemId, checkCallback) {
    var sql = "select count(*) from kmv_transactions where item_id = :item_id";
             
    var stmt = this.mDb.createStatement(sql);
    if (stmt === null) {
        checkCallback(0);
        return;
    }
    stmt.params["item_id"] = itemId;
    this.mDb.execSelect(stmt);
    var records = this.mDb.getRecords();
    checkCallback(parseInt(records[0][0]));
    
};

KmvTransactions.prototype.getOldestYear = function(getCallback) {
    var sql = "select strftime('%Y', min(transaction_date)) from kmv_transactions";
    this.mDb.selectQuery(sql);
    var records = this.mDb.getRecords();

    getCallback(parseInt(records[0][0]));
};
KmvTransactions.prototype.load = function(sortParams, queryParams, loadCallback) {
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

    var sql = ["select ",
               "A.transaction_date, ",
               "A.item_name, ",
               "A.detail, ",
               "A.income, ",
               "A.expense, ",
               "A.user_name, ",
               "case ",
               " when A.type = 'realmoney' then '" + km_getLStr("transaction_type.cash") + "'",
               " when A.type = 'bank' then '" + km_getLStr("transaction_type.bank") + "'",
               " when A.type = 'creditcard' then '" + km_getLStr("transaction_type.creditcard") + "'",
               " when A.type = 'emoney' then '" + km_getLStr("transaction_type.emoney") + "'",
               " end as type, ",
               "A.id ",
               "from kmv_transactions A "].join(" ");
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
KmvTransactions.prototype.loadSumPerMonth = function(params, loadCallback) {
    var sql = ["select",
                        "strftime('%Y/%m', A.transaction_date) as transaction_month,",
                        "A.item_id as item_id,",
                        "A.item_name as item_name,",
                        "sum(A.expense - A.income) as sumpermonth",
                        "from kmv_transactions A",
                        "where transaction_month >= :periodFrom",
                        "and transaction_month <= :periodTo",
                        "and A.item_id = :itemId"].join(" ");
    // ユーザが指定された場合、家計内フラグが「自己」のデータは集計に含めない
    if (params["userId"] !== 0) {
        sql += " and A.user_id = :userId and A.internal <> 1";
    } else {
        sql += " and A.internal = 0 ";
    }
    sql += " group by transaction_month, item_id ";

    km_debug(sql);
    this.mDb.selectWithParams(sql, params);
    loadCallback(this.mDb.getRecords());
};

KmvTransactions.prototype.loadAllSumPerMonth = function(params, loadCallback) {
    var sql = ["select",
                        "strftime('%Y/%m', A.transaction_date) as transaction_month,",
                        "A.item_id as item_id,",
                        "A.item_name as item_name,",
                        "sum(A.expense - A.income) as sumpermonth",
                        "from kmv_transactions A"].join(" ");
    
    // ユーザが指定された場合、家計内フラグが「自己」のデータは集計に含めない
    if (params["userId"] !== 0) {
        if (params["itemId"] !== 0) {
            sql += " where A.user_id = :userId and A.internal <> 1 and A.item_id = :itemId ";
        // 費目が指定されない場合、集計対象の費目だけを集計する
        } else {
            sql += " where A.user_id = :userId and A.internal <> 1 ";
            sql += " and A.sum_include = 1 ";
        }
    } else {
        if (params["itemId"] !== 0) {
            sql += " where A.item_id = :itemId and A.internal = 0 ";
        } else {
            sql += " where A.internal = 0 and A.sum_include = 1 ";
        }
    }
    sql += " group by transaction_month, item_id ";

    km_debug(sql);
    this.mDb.selectWithParams(sql, params);
    loadCallback(this.mDb.getRecords(), this.mDb.getColumns());
};