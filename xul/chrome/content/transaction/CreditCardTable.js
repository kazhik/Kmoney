function CreditCardTable() {
    Transaction.call(this, "km_tree_creditcard");
}

CreditCardTable.prototype = Object.create(Transaction.prototype);

CreditCardTable.prototype.initialize = function (db) {
    km_debug("CreditCardTable.initialize start");
    Transaction.prototype.initialize.call(this, db);
    this.loadCardList();
    this.initPayMonth();
    km_debug("CreditCardTable.initialize end");
};

CreditCardTable.prototype.load = function (sortParams) {
    km_debug("CreditCardTable.load start");
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        if (param['key'] === "creditcard") {
            param['value'] = $$('km_edit_query_list' + i).value;
        }
        queryParams.push(param);
    }
    
    this.mDb.creditCardTrns.load(sortParams, queryParams, this.loadCallback.bind(this));

    km_debug("CreditCardTable.load end");


};
CreditCardTable.prototype.loadDuplicate = function() {
    this.mDb.creditCardTrns.loadDuplicate(this.loadCallback.bind(this));
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
    } else {
        $$('km_edit_paymonthY').value = "";
        $$('km_edit_paymonthM').value = "";
    }

    // 選択行の収支を計算してステータスバーに表示
    this.showSumOfSelectedRows();

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
    $$('km_edit_paymonthY').value = thisMonth.getFullYear();
    $$('km_edit_paymonthM').value = thisMonth.getMonth();
    
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
    this.mDb.creditCardInsert([params], this.insertCallback.bind(this));
};
CreditCardTable.prototype.updateRecord = function (idList, params) {
    if (Object.keys(params).length > 1) {
        params['boughtAmount'] = params['amount'];
        params['cardId'] = $$('km_edit_creditcard').value;
        params['internal'] = $$('km_edit_internal').value;
        // 支払月が指定された場合は支払い情報も更新する
        var payMonthY = $$('km_edit_paymonthY').value;
        if (parseInt(payMonthY) !== 0) {
            params['payMonth'] = payMonthY + "-" + $$('km_edit_paymonthM').value;
            params['payAmount'] = params['boughtAmount']; // 分割払いは当面対応しない(Issue #10)
            params['remainingBalance'] = 0;
        }
    }
    
    this.mDb.creditCardUpdate(idList, params, this.updateCallback.bind(this));

};
CreditCardTable.prototype.deleteRecord = function (idList) {
    this.mDb.creditCardDelete(idList, this.deleteCallback.bind(this));

};
