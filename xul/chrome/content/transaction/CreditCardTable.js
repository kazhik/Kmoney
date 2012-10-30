function CreditCardTable() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_creditcard");
}
CreditCardTable.prototype.initialize = function (db) {
    km_debug("CreditCardTable.initialize start");
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
    this.loadCardList();
    this.initPayMonth();
    km_debug("CreditCardTable.initialize end");
};

CreditCardTable.prototype.load = function (sortParams) {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.ensureRowIsVisible('id', -1);
        this.mTree.showTable(true);
    }

    km_debug("CreditCardTable.load start");
    if (sortParams === undefined) {
        if (this.mTree.mSortOrder != null) {
            sortParams = [
                {
                    "column": this.mTree.mSortCol,
                    "order": this.mTree.mSortOrder
                }
            ];
        }
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = {
            "key": $$('km_list_query_condition' + i).value,
            "operator": $$('km_list_query_operator' + i).value
        };
        if (param['key'] === "date") {
            param['value'] = $$('km_edit_query_date' + i).value;
        } else if (param['key'] === "item") {
            param['value'] = $$('km_edit_query_list' + i).value;
        } else if (param['key'] === "detail") {
            param['value'] = $$('km_edit_query_text' + i).value;
        } else if (param['key'] === "user") {
            param['value'] = $$('km_edit_query_list' + i).value;
        } else if (param['key'] === "creditcard") {
            param['value'] = $$('km_edit_query_list' + i).value;
        }
        if (i != 1) {
            param['andor'] = $$('km_list_query_andor').value;
        }
        queryParams.push(param);
    }
    
    this.mDb.creditCardTrns.load(sortParams, queryParams, loadCallback.bind(this));

    km_debug("CreditCardTable.load end");


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
    if (payMonth !== null && payMonth.length > 0) {
        var payMonthSplitted = payMonth.split('-');
        $$('km_edit_paymonthY').value = payMonthSplitted[0];
        $$('km_edit_paymonthM').value = payMonthSplitted[1];
    }

    // 選択行の収支を計算してステータスバーに表示
    var expenseArray = this.mTree.getSelectedRowValueList('expense');
    var sum = 0;
    var i = 0;
    km_debug("CreditCardTable.onSelect expenseArray.length = " + expenseArray.length);
    for (i = 0; i < expenseArray.length; i++) {
        sum = calcFloat(sum - parseFloat(expenseArray[i]));
    }
    $$('km_status_sum').label = km_getLStr("status.sum") + "=" + sum;

};
CreditCardTable.prototype.loadCardList = function () {
    km_debug("CreditCardTable.loadCardList start");
    function loadCallback(cardList) {
        this.onUserSelect();
    }
    this.mDb.creditCardInfo.load(loadCallback.bind(this));
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
    var cardList = this.mDb.creditCardInfo.getCardList($$('km_edit_user').value);
    
    $$("km_edit_creditcard").removeAllItems();
    for (var i = 0; i < cardList.length; i++) {
        $$("km_edit_creditcard").appendItem(cardList[i][1], cardList[i][0]);
    }
    $$("km_edit_creditcard").selectedIndex = 0;
};
CreditCardTable.prototype.addRecord = function (params) {
    function insertCallback(id) {
        this.load();
        this.mTree.ensureRowIsVisible('id', id);
    }

    params['boughtAmount'] = params['amount'];
    params['cardId'] = $$('km_edit_creditcard').value;
    params['internal'] = 0;

    // 支払月が指定された場合は支払い情報も更新する
    var payMonthY = $$('km_edit_paymonthY').value;
    if (parseInt(payMonthY) !== 0) {
        params['payMonth'] = payMonthY + "-" + $$('km_edit_paymonthM').value;
        params['payAmount'] = params['boughtAmount']; // 分割払いは当面対応しない
        params['remainingBalance'] = 0;
    }
    this.mDb.creditCardTrns.insert([params], insertCallback.bind(this));
};
CreditCardTable.prototype.updateRecord = function (id, params) {
    function updateCallback() {
        this.load();
        this.mTree.ensureRowIsVisible('id', id);
    }

    params['boughtAmount'] = params['amount'];
    params['cardId'] = $$('km_edit_creditcard').value;
    params['internal'] = $$('km_edit_internal').value;
    // 支払月が指定された場合は支払い情報も更新する
    var payMonthY = $$('km_edit_paymonthY').value;
    if (parseInt(payMonthY) !== 0) {
        params['payMonth'] = payMonthY + "-" + $$('km_edit_paymonthM').value;
        params['payAmount'] = params['boughtAmount']; // 分割払いは当面対応しない
        params['remainingBalance'] = 0;
    }
    
    this.mDb.creditCardTrns.update(id, params, updateCallback.bind(this));

};
CreditCardTable.prototype.deleteRecord = function (id) {
    function deleteCallback() {
        this.load();
        this.mTree.ensurePreviousRowIsVisible();
    }

    this.mDb.creditCardTrns.delete(id, deleteCallback.bind(this));

};
