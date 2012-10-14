function AllView() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_all");
};

AllView.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
};
AllView.prototype.onSelect = function () {
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
AllView.prototype.load = function (sortParams) {
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
    this.mTree.showTable(true);
};