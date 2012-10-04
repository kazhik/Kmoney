function CashTable() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_cash");
    this.queryParams = {};
};

CashTable.prototype.initialize = function (db) {
    this.mDb = db;

    this.mTree.init(this.sort.bind(this));
};

CashTable.prototype.query = function (queryParams) {
    this.load(queryParams);
};

CashTable.prototype.sort = function (sortParams) {
    this.load(undefined, sortParams);
};

CashTable.prototype.load = function (queryParams, sortParams) {
    var orderBy = "";
    if (sortParams !== undefined) {
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

    if (queryParams !== undefined) {
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
    if (key !== "none") {
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
        if (key !== "none") {
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
        "A.rowid ",
        "from km_realmoney_trns A ",
        "left join km_item B ",
        " on A.item_id = B.rowid ",
        "inner join km_user C ",
        " on A.user_id = C.id "
        ].join(" ");
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
    this.mTree.ensureRowIsVisible2('rowid', - 1);
    this.mTree.showTable(true);

};
CashTable.prototype.onSelect = function () {
    $$('km_edit_transactionDate').value = this.mTree.getSelectedRowValue('transaction_date');
    $$('km_edit_item').value = this.mTree.getSelectedRowValue('item_id');
    $$('km_edit_detail').value = this.mTree.getSelectedRowValue('detail');
    var amount = this.mTree.getSelectedRowValue('income');
    if (Number(amount) === 0) {
        amount = this.mTree.getSelectedRowValue('expense');
        $$('income_expense').selectedItem = $$('km_edit_expense');
    } else {
        $$('income_expense').selectedItem = $$('km_edit_income');
    }
    $$('km_edit_amount').value = amount;
    $$('km_edit_user').value = this.mTree.getSelectedRowValue('user_id');
    $$('km_edit_internal').value = this.mTree.getSelectedRowValue('internal');
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

    var recArray = [{
      "transactionDate": $$('km_edit_transactionDate').value,
      "income": incomeValue,
      "expense": expenseValue,
      "itemId": $$('km_edit_item').value,
      "detail": $$('km_edit_detail').value,
      "userId": $$('km_edit_user').value,
      "internal": $$('km_edit_internal').value,
      "source": 0
    }];
    this.executeInsert(recArray);

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

    var rowid = this.mTree.getSelectedRowValue('rowid');
    var sql = ["update km_realmoney_trns ",
               "set ",
               "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', ",
               "income = " + incomeValue + ", ",
               "expense = " + expenseValue + ", ",
               "item_id = " + $$('km_edit_item').value + ", ",
               "detail = " + "\"" + $$('km_edit_detail').value + "\", ",
               "user_id = " + $$('km_edit_user').value + ", ",
               "last_update_date = datetime('now', 'localtime'), ",
               "internal = " + $$('km_edit_internal').value + ", ",
               "source = 1 ",
               "where rowid = " + rowid].join(" ");
    km_log(sql);
    this.mDb.executeTransaction([sql]);
    this.load();
    this.mTree.ensureRowIsVisible2('rowid', rowid);
};

CashTable.prototype.deleteRecord = function () {
    var rowid = this.mTree.getSelectedRowValue('rowid');
    if (rowid === "") {
        return;
    }
    var sql = ["delete from km_realmoney_trns where rowid = " + rowid];
    this.mDb.executeTransaction(sql);

    this.load();
};

CashTable.prototype.executeInsert = function (newRecordArray) {
    var sqlStmt = [];
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
                        "'" + newRecordArray[i]["transactionDate"] + "',",
                        newRecordArray[i]["income"] + ",",
                        newRecordArray[i]["expense"] + ",",
                        newRecordArray[i]["itemId"] + ", ",
                        "'" + newRecordArray[i]["detail"] + "',",
                        newRecordArray[i]["userId"] + ",",
                        newRecordArray[i]["internal"] + ",",
                        "datetime('now', 'localtime'), ",
                        newRecordArray[i]["source"] + " ",
                        "where not exists (",
                        " select 1 from km_realmoney_trns ",
                        " where transaction_date = '" + newRecordArray[i]["transactionDate"] + "'",
                        " and income = " + newRecordArray[i]["income"],
                        " and expense = " + newRecordArray[i]["expense"],
                        " and user_id = " + newRecordArray[i]["userId"],
                        ")"].join(" ");
        km_log(sql);
        sqlStmt.push(sql);
    }
    this.mDb.executeTransaction(sqlStmt);
};