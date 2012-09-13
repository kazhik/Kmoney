function BankTable() {
    this.mDb = null;
    this.mBankList = null;
    this.mTree = new TreeViewController("km_tree_bank");
    this.queryParams = {};
};
BankTable.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
    this.loadBankList();
};

BankTable.prototype.query = function (queryParams) {
    this.load(queryParams, null);
};

BankTable.prototype.sort = function (sortParams) {
    this.load(null, sortParams);
};

BankTable.prototype.load = function (queryParams, sortParams) {
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
        "A.bank_id, ",
        "D.name as bank_name, ",
        "A.user_id, ",
        "C.name as user_name, ",
        "A.source, ",
        "A.internal, ",
        "A.rowid ",
        "from km_bank_trns A ",
        "left join km_item B ",
        " on A.item_id = B.rowid ",
        "inner join km_user C ",
        " on A.user_id = C.id ",
        "inner join km_bank_info D ",
        " on A.bank_id = D.rowid "
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
    this.mTree.ensureRowIsVisible(12, -1);
    this.mTree.showTable(true);

    this.onUserSelect();


};
BankTable.prototype.onSelect = function () {
    $$('km_edit_transactionDate').value = this.mTree.getColumnValue(0);
    $$('km_edit_item').value = this.mTree.getColumnValue(1);
    $$('km_edit_detail').value = this.mTree.getColumnValue(3);
    var amount = this.mTree.getColumnValue(4);
    if(Number(amount) == 0) {
        amount = this.mTree.getColumnValue(5);
        $$('income_expense').selectedItem = $$('km_edit_expense');
    } else {
        $$('income_expense').selectedItem = $$('km_edit_income');
    }
    $$('km_edit_amount').value = amount;
    $$('km_edit_bank').value = this.mTree.getColumnValue(6);
    $$('km_edit_user').value = this.mTree.getColumnValue(8);
    $$('km_edit_internal').value = this.mTree.getColumnValue(11);

}
BankTable.prototype.loadBankList = function () {
    this.mDb.selectQuery("select rowid, name, user_id from km_bank_info");
    this.mBankList = this.mDb.getRecords();

    this.onUserSelect();
};
BankTable.prototype.onUserSelect = function () {
    $$("km_edit_bank").removeAllItems();
    var userId = $$('km_edit_user').value;

    for(var i = 0; i < this.mBankList.length; i++) {
        if(this.mBankList[i][2] == userId) {
            $$("km_edit_bank").appendItem(this.mBankList[i][1], this.mBankList[i][0]);
        }
    }
    $$("km_edit_bank").selectedIndex = 0;

};

BankTable.prototype.addRecord = function () {
    var incomeValue;
    var expenseValue;
    if($$('km_edit_income').selected) {
        incomeValue = $$('km_edit_amount').value;
        expenseValue = 0;
    } else {
        incomeValue = 0;
        expenseValue = $$('km_edit_amount').value;
    }
    var sql = ["insert into km_bank_trns (" + "transaction_date, " + "income, " + "expense, " + "item_id, " + "detail, " + "user_id, " + "bank_id, " + "last_update_date, " + "internal, " + "source " + ") values ( " + "\"" + $$('km_edit_transactionDate').value + "\", " + incomeValue + ", " + expenseValue + ", " + $$('km_edit_item').value + ", " + "\"" + $$('km_edit_detail').value + "\", " + $$('km_edit_user').value + ", " + $$('km_edit_bank').value + ", " + "datetime('now', 'localtime'), " + $$('km_edit_internal').value + ", " + "1)"];
    this.mDb.executeTransaction(sql);
    this.load();
};
BankTable.prototype.updateRecord = function () {
    var incomeValue;
    var expenseValue;
    if($$('km_edit_income').selected) {
        incomeValue = $$('km_edit_amount').value;
        expenseValue = 0;
    } else {
        incomeValue = 0;
        expenseValue = $$('km_edit_amount').value;
    }
    var rowid = this.mTree.getColumnValue(12);
    if(rowid === "") {
        km_alert(km_getLStr("no_selectedrow"));
    }
    var sql = ["update km_bank_trns " + "set " + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', " + "income = " + incomeValue + ", " + "expense = " + expenseValue + ", " + "item_id = " + $$('km_edit_item').value + ", " + "detail = " + "\"" + $$('km_edit_detail').value + "\", " + "user_id = " + $$('km_edit_user').value + ", " + "bank_id = " + $$('km_edit_bank').value + ", " + "last_update_date = datetime('now', 'localtime'), " + "internal = " + $$('km_edit_internal').value + ", " + "source = 1 " + "where rowid = " + rowid];
    this.mDb.executeTransaction(sql);
    this.load();
    this.mTree.ensureRowIsVisible(12, rowid);
};

BankTable.prototype.deleteRecord = function () {
    var rowid = this.mTree.getColumnValue(12);
    if(rowid === "") {
        return;
    }
    var sql = ["delete from km_bank_trns where rowid = " + rowid];
    km_log(sql);
    this.mDb.executeTransaction(sql);

    this.load();
};

BankTable.prototype.executeInsert = function (newRecordArray) {
    var sqlArray = [];
    var sql;
    for(var i = 0; i < newRecordArray.length; i++) {

        var sql = ["insert into km_bank_trns (" + "transaction_date, " + "item_id, " + "detail, " + "income, " + "expense, " + "user_id, " + "bank_id, " + "internal, " + "source, " + "last_update_date " + ") " + "select " + "'" + newRecordArray[i]["transactionDate"] + "', " + newRecordArray[i]["itemId"] + ", " + "\"" + newRecordArray[i]["detail"] + "\", " + newRecordArray[i]["income"] + ", " + newRecordArray[i]["expense"] + ", " + newRecordArray[i]["userId"] + ", " + newRecordArray[i]["bankId"] + ", " + newRecordArray[i]["internal"] + ", " + newRecordArray[i]["source"] + ", " + "datetime('now', 'localtime') " + "where not exists (" + " select 1 from km_bank_trns " + " where transaction_date = '" + newRecordArray[i]["transactionDate"] + "'" + " and income = " + newRecordArray[i]["income"] + " and expense = " + newRecordArray[i]["expense"] + " and bank_id = " + newRecordArray[i]["bankId"] + " and user_id = " + newRecordArray[i]["userId"] + ")"];
        km_log(sql);
        sqlArray.push(sql);

    }
    this.mDb.executeTransaction(sqlArray);
};
BankTable.prototype.getBankId = function (name, userId) {
    for(var i = 0; i < this.mBankList.length; i++) {
        if(this.mBankList[i][1] === name && this.mBankList[i][2] == userId) {
            return this.mBankList[i][0];
        }
    }
    return 0;

};