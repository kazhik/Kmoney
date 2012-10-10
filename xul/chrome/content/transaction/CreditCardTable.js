function CreditCardTable() {
    this.mDb = null;
    this.mCardList = null;
    this.mTree = new TreeViewController("km_tree_creditcard");
}
CreditCardTable.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
    this.loadCardList();
    this.initPayMonth();
};

CreditCardTable.prototype.load = function (sortParams) {
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
        } else if (key1 === "creditcard") {
            keyCol = "A.card_id";
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
            } else if (key2 === "creditcard") {
                keyCol = "A.card_id";
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
               "A.item_id, ",
               "B.name as item_name, ",
               "A.detail, ",
               "A.expense, ",
               "A.card_id, ",
               "D.name as card_name, ",
               "A.user_id, ",
               "C.name as user_name, ",
               "(select max(E.pay_month) from km_creditcard_payment E ",
               " where A.rowid = E.transaction_id) as pay_month, ",
               "A.rowid ",
               "from km_creditcard_trns A ",
               "left join km_item B ",
               " on A.item_id = B.rowid ",
               "inner join km_user C ",
               " on A.user_id = C.id ",
               "inner join km_creditcard_info D ",
               " on A.card_id = D.rowid "].join(" ");
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
    this.mTree.ensureRowIsVisible2('rowid', -1);
    this.mTree.showTable(true);
    this.onUserSelect();
};
CreditCardTable.prototype.onSelect = function () {
    $$('km_edit_transactionDate').value = this.mTree.getSelectedRowValue('transaction_date');
    $$('km_edit_item').value = this.mTree.getSelectedRowValue('item_id');
    $$('km_edit_detail').value = this.mTree.getSelectedRowValue('detail');
    $$('km_edit_amount').value = this.mTree.getSelectedRowValue('expense');
    $$('income_expense').selectedItem = $$('km_edit_expense');
    $$('km_edit_user').value = this.mTree.getSelectedRowValue('user_id');
    $$('km_edit_creditcard').value = this.mTree.getSelectedRowValue('card_id');
    var payMonth = this.mTree.getSelectedRowValue('pay_month');
    if (payMonth.length > 0) {
        var payMonthSplitted = payMonth.split('-');
        $$('km_edit_paymonthY').value = payMonthSplitted[0];
        $$('km_edit_paymonthM').value = payMonthSplitted[1];
    }

    // 選択行の収支を計算してステータスバーに表示
    var expenseArray = this.mTree.getSelectedRowValueList('expense');
    var sum = 0;
    var i = 0;
    for (i = 0; i < expenseArray.length; i++) {
        sum -= parseInt(expenseArray[i]);
    }
    $$('km_status_sum').label = km_getLStr("status.sum") + "=" + sum;

};
CreditCardTable.prototype.loadCardList = function () {
    this.mDb.selectQuery("select rowid, name, user_id from km_creditcard_info");
    this.mCardList = this.mDb.getRecords();
    this.onUserSelect();
};
CreditCardTable.prototype.initPayMonth = function () {
    var thisMonth = new Date();
    var year = thisMonth.getFullYear();
    $$('km_edit_paymonthY').removeAllItems();
    $$('km_edit_paymonthY').appendItem("-", 0);
    $$('km_edit_paymonthY').appendItem(year, year);
    $$('km_edit_paymonthY').appendItem(year + 1, year + 1);
    $$('km_edit_paymonthY').selectedIndex = 0;
    
    $$('km_edit_paymonthM').removeAllItems();
    $$('km_edit_paymonthM').appendItem("-", 0);
    for (var i = 0; i < 12; i++) {
        var monthValue = i + 1;
        if (monthValue < 10) {
            monthValue = "0" + monthValue;
        }
        
        $$('km_edit_paymonthM').appendItem(i + 1, monthValue);
    }
    $$('km_edit_paymonthM').selectedIndex = 0;
    
};

CreditCardTable.prototype.onUserSelect = function () {
    $$("km_edit_creditcard").removeAllItems();
    var userId = $$('km_edit_user').value;
    for (var i = 0; i < this.mCardList.length; i++) {
        if (this.mCardList[i][2] == userId) {
            $$("km_edit_creditcard").appendItem(this.mCardList[i][1], this.mCardList[i][0]);
        }
    }
    $$("km_edit_creditcard").selectedIndex = 0;
};
CreditCardTable.prototype.addRecord = function () {
    var rec = {
      "transactionDate": $$('km_edit_transactionDate').value,
      "boughtAmount": $$('km_edit_amount').value,
      "itemId": $$('km_edit_item').value,
      "detail": $$('km_edit_detail').value,
      "userId": $$('km_edit_user').value,
      "cardId": $$('km_edit_creditcard').value,
      "internal": 0,
      "source": 1
    };
    // 支払月が指定された場合は支払い情報も更新する
    var payMonthY = $$('km_edit_paymonthY').value;
    if (parseInt(payMonthY) !== 0) {
        rec['payMonth'] = payMonthY + "-" + $$('km_edit_paymonthM').value;
        rec['payAmount'] = rec['boughtAmount']; // 分割払いは当面対応しない
        rec['remainingBalance'] = 0;
    }
    this.executeInsert([rec]);
    
    this.load();
};
CreditCardTable.prototype.updateRecord = function () {
    var rowid = this.mTree.getSelectedRowValue('rowid');

    var transactionDate = $$('km_edit_transactionDate').value;
    var boughtAmount = $$('km_edit_amount').value;
    var itemId = $$('km_edit_item').value;
    var detail = $$('km_edit_detail').value;
    var userId = $$('km_edit_user').value;
    var cardId = $$('km_edit_creditcard').value;
    var payMonth = $$('km_edit_paymonthY').value;
    if (payMonth !== 0) {
        payMonth += "-" + $$('km_edit_paymonthM').value;
    }

    var sqlArray = [["update km_creditcard_trns ",
               "set ",
               "transaction_date = " + "'" + transactionDate + "', ",
               "expense = " + boughtAmount + ", ",
               "item_id = " + itemId + ", ",
               "detail = \"" + detail + "\", ",
               "user_id = " + userId + ", ",
               "card_id = " + cardId + ", ",
               "last_update_date = datetime('now', 'localtime'), ",
               "source = 1 ",
               "where rowid = " + rowid].join(" ")];
    km_log(sqlArray[0]);
    if (parseInt(payMonthY) !== 0) {
        sqlArray.push(
            ["update km_creditcard_payment ",
             "set ",
             "transaction_date = '" + transactionDate + "', ",
             "detail = \"" + detail + "\", ",
             "bought_amount = " + boughtAmount + ", ",
             "pay_amount = " + boughtAmount + ", ",
             "pay_month = '" + payMonth + "', ",
             "user_id = " + userId + ", ",
             "card_id = " + cardId + ", ",
             "last_update_date = datetime('now', 'localtime') ",
             "where transaction_id = " + rowid].join(" ")
                      );
        km_log(sqlArray[1]);
    }
    this.mDb.executeTransaction(sqlArray);
    this.load();
    this.mTree.ensureRowIsVisible2('rowid', rowid);
};
CreditCardTable.prototype.deleteRecord = function () {
    var rowid = this.mTree.getSelectedRowValue('rowid');
    if (rowid === "") {
        return;
    }
    var sql = ["delete from km_creditcard_trns where rowid = " + rowid,
               "delete from km_creditcard_payment where transaction_id = " + rowid];
    km_log(sql);
    this.mDb.executeTransaction(sql);
    this.load();
    this.mTree.ensurePreviousRowIsVisible();
};
CreditCardTable.prototype.getCardId = function (name, userId) {
    for (var i = 0; i < this.mCardList.length; i++) {
        if (this.mCardList[i][1] === name && this.mCardList[i][2] == userId) {
            return this.mCardList[i][0];
        }
    }
    return 0;
};
CreditCardTable.prototype.executeInsert = function (newRecordArray) {
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
                          "(select max(rowid) from km_creditcard_trns ", // 同一内容のレコードが複数件
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
};