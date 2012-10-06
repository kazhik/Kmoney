function CashTable() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_cash");
};

CashTable.prototype.initialize = function (db) {
    this.mDb = db;

    this.mTree.init(this.load.bind(this));
};

CashTable.prototype.load = function (sortParams) {
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

    var where = "";
    var key1 = $$('km_list_query_condition1').value;
    var operator1 = "";
    var value1 = "";
    var key2 = $$('km_list_query_condition2').value;
    var operator2 = "";
    var value2 = "";
    var keyCol;
    if (key1 !== "none") {
        if (key1 === "date") {
            keyCol = "A.transaction_date";
            operator1 = $$('km_list_query_operator1').value;
            value1 = $$('km_edit_query_date1').value;
        } else if (key1 === "item") {
            keyCol = "A.item_id";
            operator1 = "=";
            value1 = $$('km_edit_query_list1').value;
        } else if (key1 === "detail") {
            keyCol = "A.detail";
            operator1 = $$('km_list_query_operator1').value;
            value1 = $$('km_edit_query_text1').value;
        } else if (key1 === "user") {
            keyCol = "A.user_id";
            operator1 = "=";
            value1 = $$('km_edit_query_list1').value;
        }
        where = " where ";
        where += keyCol;
        where += " ";
        where += operator1;
        where += " ";
        where += ":" + key1 + "_1";
        if (operator1 === 'like') {
            where += " escape '/'";
        }

        if ($$('km_list_query_andor').value !== "none") {
            where += " " + $$('km_list_query_andor').value + " ";

            if (key2 === "date") {
                keyCol = "A.transaction_date";
                operator2 = $$('km_list_query_operator2').value;
                value2 = $$('km_edit_query_date2').value;
            } else if (key2 === "item") {
                keyCol = "A.item_id";
                operator2 = "=";
                value2 = $$('km_edit_query_list2').value;
            } else if (key2 === "detail") {
                keyCol = "A.detail";
                operator2 = "=";
                value2 = $$('km_edit_query_text2').value;
            } else if (key2 === "user") {
                keyCol = "A.user_id";
                operator2 = "=";
                value2 = $$('km_edit_query_list2').value;
            }
            
            where += keyCol;
            where += " ";
            where += operator2;
            where += " ";
            where += ":" + key2 + "_2";
            if (operator2 === 'like') {
                where += " escape '/'";
            }
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

    var stmt = this.mDb.createStatement(sql);
    if (stmt === null) {
        return;
    }
    if (key1 !== "none") {
        if (operator1 === "like") {
            stmt.params[key1 + "_1"] = "%" + stmt.escapeStringForLIKE(value1, "/") + "%";    
        } else {
            stmt.params[key1 + "_1"] = value1;    
        }
    }
    if (key2 !== "none") {
        if (operator2 === "like") {
            stmt.params[key2 + "_2"] = "%" + stmt.escapeStringForLIKE(value2, "/") + "%";    
        } else {
            stmt.params[key2 + "_2"] = value2;    
        }
    }

    this.mDb.execSelect(stmt);
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

    // 選択行の収支を計算してステータスバーに表示
    var incomeArray = this.mTree.getSelectedRowValueList('income');
    var expenseArray = this.mTree.getSelectedRowValueList('expense');
    var sum = 0;
    var i = 0;
    for (i = 0; i < incomeArray.length; i++) {
        sum += parseInt(incomeArray[i]);
    }
    for (i = 0; i < expenseArray.length; i++) {
        sum -= parseInt(expenseArray[i]);
    }
    $$('km_status_sum').label = km_getLStr("status.sum") + "=" + sum;

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