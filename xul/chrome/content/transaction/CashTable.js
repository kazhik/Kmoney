function CashTable() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_cash");
    this.newRecordArray = [];
    this.queryParams = {};
};

CashTable.prototype.initialize = function (db) {
    this.mDb = db;

    this.mTree.init(this.load.bind(this));
};

CashTable.prototype.query = function (queryParams) {
    this.load(queryParams, null);
};

CashTable.prototype.sort = function (sortParams) {
    this.load(null, sortParams);
};

CashTable.prototype.load = function (queryParams, sortParams) {
    var orderBy = "";
    if (!isEmpty(sortParams)) {
        for (var i = 0; i < sortParams.length; i++) {
            orderBy += sortParams[i]['column'];
            if (sortParams[i]['order'] != undefined) {
                orderBy += " " + sortParams[i]['order'];
            }
        }
    } else {
        if (this.mTree.mSortOrder != null) {
            orderBy += this.mTree.mSortCol;
            orderBy += " " + this.mTree.mSortOrder;
        } else {
            orderBy += "A.transaction_date asc";
            this.mTree.mSortCol = "A.transaction_date";
            this.mTree.mSortOrder = "asc";
        }
    }

    if (queryParams != null) {
        this.queryParams = queryParams;
    } else {
        queryParams = this.queryParams;
    }
    var params = {};
    var where = "";

    var cond1 = queryParams['cond1'];
    var cond2 = queryParams['cond2'];

    var key = cond1['key'];
    var keyCol;
    if (key != "none") {
        if (key === "date") {
            keyCol = "A.transaction_date";
        } else if (key === "item") {
            keyCol = "A.item_id";
        } else if (key === "detail") {
            keyCol = "A.detail";
        } else if (key === "user") {
            keyCol = "A.user_id";
        }
        where = " where ";
        where += keyCol;
        where += " ";
        where += cond1['operator'];
        where += " ";
        where += ":" + key + "_1";
        params[key + "_1"] = cond1['value'];

        key = cond2['key'];
        if (key != "none") {
            if (key === "date") {
                keyCol = "A.transaction_date";
            } else if (key === "item") {
                keyCol = "A.item_id";
            } else if (key === "detail") {
                keyCol = "A.detail";
            } else if (key === "user") {
                keyCol = "A.user_id";
            }
            if (queryParams['andor'] === 'AND') {
                where += " and ";
            } else if (queryParams['andor'] === 'OR') {
                where += " or ";
            }

            where += keyCol;
            where += " ";
            where += cond2['operator'];
            where += " ";
            where += ":" + key + "_2";
            params[key + "_2"] = cond2['value'];
        }
    }

    var sqlArray = [
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
        "A.rowid ",
        "from km_realmoney_trns A ",
        "left join km_item B ",
        " on A.item_id = B.rowid ",
        "inner join km_user C ",
        " on A.user_id = C.id "
        ];
    var sql = sqlArray.join(" ");
    if (where.length > 0) {
        sql += where;
    }
    sql += " order by " + orderBy;

    km_log(sql);
    this.mDb.selectWithParams(sql, params);
    var records = this.mDb.getRecords();
    var types = this.mDb.getRecordTypes();
    var columns = this.mDb.getColumns();

    this.mTree.populateTableData(records, columns, types);
    this.mTree.ensureRowIsVisible(9, - 1);
    this.mTree.showTable(true);

};
CashTable.prototype.onSelect = function () {
    $$('km_edit_transactionDate').value = this.mTree.getColumnValue(0);
    $$('km_edit_item').value = this.mTree.getColumnValue(1);
    $$('km_edit_detail').value = this.mTree.getColumnValue(3);
    var amount = this.mTree.getColumnValue(4);
    if (Number(amount) === 0) {
        amount = this.mTree.getColumnValue(5);
        $$('income_expense').selectedItem = $$('km_edit_expense');
    } else {
        $$('income_expense').selectedItem = $$('km_edit_income');
    }
    $$('km_edit_amount').value = amount;
    $$('km_edit_user').value = this.mTree.getColumnValue(6);
    $$('km_edit_internal').value = this.mTree.getColumnValue(8);
};
CashTable.prototype.addRecord = function () {
    var incomeValue;
    var expenseValue;
    if ($$('km_edit_income').selected) {
        incomeValue = $$('km_edit_amount').value;
        expenseValue = 0;
    } else {
        incomeValue = 0;
        expenseValue = $$('km_edit_amount').value;
    }

    var sqlArray = ["insert into km_realmoney_trns (",
                            "transaction_date, ",
                            "income, ",
                            "expense, ",
                            "item_id, ",
                            "detail, ",
                            "user_id, ",
                            "internal, ",
                            "last_update_date, ",
                            "source ",
                            ") values ( ",
                            "'" + $$('km_edit_transactionDate').value + "', ",
                            incomeValue + ", ",
                            expenseValue + ", ",
                            $$('km_edit_item').value + ", ",
                            "\"", $$('km_edit_detail').value, "\", ",
                            $$('km_edit_user').value + ", ",
                            $$('km_edit_internal').value + ", ",
                            "datetime('now', 'localtime') + ",
                            "1)"];
    var sql = sqlArray.join(" ");
    this.mDb.executeTransaction(sql);

    this.load();
};
CashTable.prototype.updateRecord = function () {
    var incomeValue;
    var expenseValue;
    if ($$('km_edit_income').selected) {
        incomeValue = $$('km_edit_amount').value;
        expenseValue = 0;
    } else {
        incomeValue = 0;
        expenseValue = $$('km_edit_amount').value;
    }

    var rowid = this.mTree.getColumnValue(9);
    var sql = ["update km_realmoney_trns " + "set " + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', " + "income = " + incomeValue + ", " + "expense = " + expenseValue + ", " + "item_id = " + $$('km_edit_item').value + ", " + "detail = " + "\"" + $$('km_edit_detail').value + "\", " + "user_id = " + $$('km_edit_user').value + ", " + "last_update_date = datetime('now', 'localtime'), " + "internal = " + $$('km_edit_internal').value + ", " + "source = 1 " + "where rowid = " + rowid];
    km_log(sql);
    this.mDb.executeTransaction(sql);
    this.load();
    this.mTree.ensureRowIsVisible(9, rowid);
};

CashTable.prototype.deleteRecord = function () {
    var rowid = this.mTree.getColumnValue(9);
    if (rowid === "") {
        return;
    }
    var sql = ["delete from km_realmoney_trns where rowid = " + rowid];
    this.mDb.executeTransaction(sql);

    this.load();
};


CashTable.prototype.importRecord = function (transactionDate, income, expense, itemName,
detail, userId, internal, source) {

    var sql = ["insert into km_realmoney_trns (" + "transaction_date, " + "income, " + "expense, " + "item_id, " + "detail, " + "user_id, " + "internal, " + "last_update_date, " + "source " + ") " + "select " + "'" + transactionDate + "'," + income + "," + expense + "," + "(select rowid from km_item where name = '" + itemName + "')," + "'" + detail + "'," + userId + "," + internal + "," + "datetime('now', 'localtime'), " + source + " " + "where not exists (" + " select 1 from km_realmoney_trns " + " where transaction_date = '" + transactionDate + "'" + " and income = " + income + " and expense = " + expense + " and source = " + source + " and user_id = " + userId + ")"];
    km_log(sql);
    this.mDb.executeTransaction(sql);

};
CashTable.prototype.addNewRecord = function (rec) {
    this.newRecordArray.push(rec);
};
CashTable.prototype.executeInsert = function () {
    var sqlArray = [];
    var sql;
    for (var i = 0; i < this.newRecordArray.length; i++) {
        var sql = ["insert into km_realmoney_trns (" + "transaction_date, " + "income, " + "expense, " + "item_id, " + "detail, " + "user_id, " + "internal, " + "last_update_date, " + "source " + ") " + "select " + "'" + this.newRecordArray[i]["transactionDate"] + "'," + this.newRecordArray[i]["income"] + "," + this.newRecordArray[i]["expense"] + "," + this.newRecordArray[i]["itemId"] + ", " + "'" + this.newRecordArray[i]["detail"] + "'," + this.newRecordArray[i]["userId"] + "," + this.newRecordArray[i]["internal"] + "," + "datetime('now', 'localtime'), " + this.newRecordArray[i]["source"] + " " + "where not exists (" + " select 1 from km_realmoney_trns " + " where transaction_date = '" + this.newRecordArray[i]["transactionDate"] + "'" + " and income = " + this.newRecordArray[i]["income"] + " and expense = " + this.newRecordArray[i]["expense"] + " and user_id = " + this.newRecordArray[i]["userId"] + ")"];
        km_log(sql);
        sqlArray.push(sql);
    }
    this.mDb.executeTransaction(sqlArray);
    this.newRecordArray.length = 0;
};