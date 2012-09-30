function EMoneyTable() {
    this.mDb = null;
    this.mMoneyList = null;
    this.mTree = new TreeViewController("km_tree_emoney");
    this.queryParams = {};
};
EMoneyTable.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
    this.loadEMoneyList();
};

EMoneyTable.prototype.query = function (queryParams) {
    this.load(queryParams);
};

EMoneyTable.prototype.sort = function (sortParams) {
    this.load(undefined, sortParams);
};

EMoneyTable.prototype.load = function (queryParams, sortParams) {
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

    if (queryParams != undefined) {
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
               "A.rowid ",
               "from km_emoney_trns A ",
               "left join km_item B ",
               " on A.item_id = B.rowid ",
               "inner join km_user C ",
               " on A.user_id = C.id ",
               "inner join km_emoney_info D ",
               " on A.money_id = D.rowid "].join(" ");
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
    this.mTree.ensureRowIsVisible(12, -1);
    this.mTree.showTable(true);

    this.onUserSelect();

};
EMoneyTable.prototype.onSelect = function () {
    $$('km_edit_transactionDate').value = this.mTree.getColumnValue(0);
    $$('km_edit_item').value = this.mTree.getColumnValue(1);
    $$('km_edit_detail').value = this.mTree.getColumnValue(3);
    var amount = this.mTree.getColumnValue(4);
    if (Number(amount) == 0) {
        amount = this.mTree.getColumnValue(5);
        $$('income_expense').selectedItem = $$('km_edit_expense');
    } else {
        $$('income_expense').selectedItem = $$('km_edit_income');
    }
    $$('km_edit_amount').value = amount;
    $$('km_edit_emoney').value = this.mTree.getColumnValue(6);
    $$('km_edit_user').value = this.mTree.getColumnValue(8);
    $$('km_edit_internal').value = this.mTree.getColumnValue(11);
};
EMoneyTable.prototype.loadEMoneyList = function () {
    this.mDb.selectQuery("select rowid, name, user_id from km_emoney_info");
    this.mMoneyList = this.mDb.getRecords();

    this.onUserSelect();

};
EMoneyTable.prototype.getMoneyId = function (name, userId) {
    for (var i = 0; i < this.mMoneyList.length; i++) {
        if (this.mMoneyList[i][1] === name && this.mMoneyList[i][2] == userId) {
            return this.mMoneyList[i][0];
        }
    }
    return 0;

};
EMoneyTable.prototype.onUserSelect = function () {
    $$("km_edit_emoney").removeAllItems();
    var userId = $$('km_edit_user').value;

    for (var i = 0; i < this.mMoneyList.length; i++) {
        if (this.mMoneyList[i][2] == userId) {
            $$("km_edit_emoney").appendItem(this.mMoneyList[i][1], this.mMoneyList[i][0]);
        }
    }
    $$("km_edit_emoney").selectedIndex = 0;

};

EMoneyTable.prototype.executeInsert = function (newRecordArray) {
    var sqlArray = [];
    var sql;
    for (var i = 0; i < newRecordArray.length; i++) {
        sql = ["insert into km_emoney_trns ("
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
                  + newRecordArray[i]["source"] + " "
                  + "where not exists ("
                  + " select 1 from km_emoney_trns "
                  + " where transaction_date = '" + newRecordArray[i]["transactionDate"] + "'"
                  + " and income = " + newRecordArray[i]["income"]
                  + " and expense = " + newRecordArray[i]["expense"]
                  + " and user_id = " + newRecordArray[i]["userId"]
                  + ")"];
        km_log(sql);
        sqlArray.push(sql);
    }
    this.mDb.executeTransaction(sqlArray);
};

EMoneyTable.prototype.addRecord = function () {
    var rec = {
        "transactionDate": "",
        "income": 0,
        "expense": 0,
        "itemId": 0,
        "detail": "",
        "userId": 0,
        "moneyId": 0,
        "internal": 0,
        "source": 0,
    };
    rec["transactionDate"] = $$('km_edit_transactionDate').value;
    if ($$('km_edit_income').selected) {
        rec["income"] = $$('km_edit_amount').value;
        rec["expense"] = 0;
    } else {
        rec["income"] = 0;
        rec["expense"] = $$('km_edit_amount').value;
    }
    rec["internal"] = $$('km_edit_internal').value;
    rec["itemId"] = $$('km_edit_item').value;
    rec["detail"] = $$('km_edit_detail').value;
    rec["userId"] = $$('km_edit_user').value;
    rec["moneyId"] = $$('km_edit_emoney').value;
    rec["source"] = 1;

    var recArray = [];
    recArray.push(rec);
    this.executeInsert(recArray);

    this.load();
};
EMoneyTable.prototype.updateRecord = function () {
    var incomeValue;
    var expenseValue;
    if ($$('km_edit_income').selected) {
        incomeValue = $$('km_edit_amount').value;
        expenseValue = 0;
    } else {
        incomeValue = 0;
        expenseValue = $$('km_edit_amount').value;
    }
    var rowid = this.mTree.getColumnValue(12);
    var sql = ["update km_emoney_trns "
            + "set "
            + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', "
            + "income = " + incomeValue + ", "
            + "expense = " + expenseValue + ", "
            + "item_id = " + $$('km_edit_item').value + ", "
            + "detail = " + "\"" + $$('km_edit_detail').value + "\", "
            + "user_id = " + $$('km_edit_user').value + ", "
            + "money_id = " + $$('km_edit_emoney').value + ", "
            + "last_update_date = datetime('now', 'localtime'), "
            + "internal = " + $$('km_edit_internal').value + ", "
            + "source = 1 "
            + "where rowid = " + rowid];
    this.mDb.executeTransaction(sql);
    this.load();
    this.mTree.ensureRowIsVisible(12, rowid);
};

EMoneyTable.prototype.deleteRecord = function () {
    var rowid = this.mTree.getColumnValue(12);
    if (rowid === "") {
        return;
    }

    var sql = ["delete from km_emoney_trns where rowid = " + rowid];
    this.mDb.executeTransaction(sql);

    this.load();
};