function CreditCardTable() {
    this.mDb = null;
    this.mCardList = null;
    this.mTree = new TreeViewController("km_tree_creditcard");
    this.queryParams = {};
}
CreditCardTable.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
    this.loadCardList();
};
CreditCardTable.prototype.query = function (queryParams) {
    this.load(queryParams);
};

CreditCardTable.prototype.sort = function (sortParams) {
    this.load(undefined, sortParams);
};

CreditCardTable.prototype.load = function (queryParams, sortParams) {
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
    this.mDb.selectWithParams(sql, params);
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
};
CreditCardTable.prototype.loadCardList = function () {
    this.mDb.selectQuery("select rowid, name, user_id from km_creditcard_info");
    this.mCardList = this.mDb.getRecords();
    this.onUserSelect();
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
    var recArray = [{
      "transactionDate": $$('km_edit_transactionDate').value,
      "boughtAmount": $$('km_edit_amount').value,
      "itemId": $$('km_edit_item').value,
      "detail": $$('km_edit_detail').value,
      "userId": $$('km_edit_user').value,
      "cardId": $$('km_edit_creditcard').value,
      "internal": 0,
      "source": 1
    }];
    this.executeInsert(recArray);
    
    this.load();
};
CreditCardTable.prototype.updateRecord = function () {
    var rowid = this.mTree.getSelectedRowValue('rowid');
    var sql = ["update km_creditcard_trns ",
               "set ",
               "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', ",
               "expense = " + $$('km_edit_amount').value + ", ",
               "item_id = " + $$('km_edit_item').value + ", ",
               "detail = " + "\"" + $$('km_edit_detail').value + "\", ",
               "user_id = " + $$('km_edit_user').value + ", ",
               "card_id = " + $$('km_edit_creditcard').value + ", ",
               "last_update_date = datetime('now', 'localtime'), ",
               "source = 1 ",
               "where rowid = " + rowid].join(" ");
    km_log(sql);
    this.mDb.executeTransaction([sql]);
    this.load();
    this.mTree.ensureRowIsVisible2('rowid', rowid);
};
CreditCardTable.prototype.deleteRecord = function () {
    var rowid = this.mTree.getSelectedRowValue('rowid');
    if (rowid === "") {
        return;
    }
    var sql = ["delete from km_creditcard_trns where rowid = " + rowid];
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
                          " and user_id = " + newRecordArray[i]["userId"] + ")"];
            km_log(sqlPayment);
            sqlArray.push(sqlPayment);
        }
    }
    this.mDb.executeTransaction(sqlArray);
};