function CreditCardTransaction() {
    Transaction.call(this, "km_tree_creditcard");
    this.listeners = [];
}

CreditCardTransaction.prototype = Object.create(Transaction.prototype);

CreditCardTransaction.prototype.initialize = function (db) {
    Transaction.prototype.initialize.call(this, db);

    this.listeners['km_tree_creditcard.select'] = this.onSelect.bind(this);
    $$('km_tree_creditcard').addEventListener("select", this.listeners['km_tree_creditcard.select']);
    
};
CreditCardTransaction.prototype.terminate = function () {
    $$('km_tree_creditcard').removeEventListener("select", this.listeners['km_tree_creditcard.select']);
    
};


CreditCardTransaction.prototype.load = function (sortParams) {
    km_debug("CreditCardTransaction.load start");
    this.setDuplicate(false);
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        if (param['key'] === "creditcard") {
            param['value'] = $$('km_list_qcond_value' + i).value;
        }
        queryParams.push(param);
    }
    
    this.mDb.creditCardTrns.load(sortParams, queryParams, this.loadCallback.bind(this));
    this.onUserSelect();
//    this.initPayMonth();

    km_debug("CreditCardTransaction.load end");

};
CreditCardTransaction.prototype.loadDuplicate = function() {
    this.setDuplicate(true);
    this.mDb.creditCardTrns.loadDuplicate(this.loadCallback.bind(this));
    this.onUserSelect();
//    this.initPayMonth();
};
CreditCardTransaction.prototype.openEdit = function (id) {
    this.mTree.ensureRowIsVisible('id', id);
};
CreditCardTransaction.prototype.onSelect = function () {
    $$('km_date_transdate').value = this.mTree.getSelectedRowValue('transaction_date');
    $$('km_list_item').value = this.mTree.getSelectedRowValue('item_id');
    $$('km_textbox_detail').value = this.mTree.getSelectedRowValue('detail');
    $$('km_textbox_amount').value = this.mTree.getSelectedRowValue('expense');
    $$('km_radgroup_income-expense').selectedItem = $$('km_radio_expense');
    $$('km_list_user').value = this.mTree.getSelectedRowValue('user_id');
    $$('km_list_creditcard').value = this.mTree.getSelectedRowValue('card_id');
    var payMonth = this.mTree.getSelectedRowValue('pay_month');
    if (payMonth !== null && payMonth.length > 0) {
        var payMonthSplitted = payMonth.split('-');
        $$('km_textbox_paymonthY').value = payMonthSplitted[0];
        $$('km_textbox_paymonthM').value = payMonthSplitted[1];
    } else {
        $$('km_textbox_paymonthY').value = "";
        $$('km_textbox_paymonthM').value = "";
    }
    $$('km_list_internal').value = this.mTree.getSelectedRowValue('internal');

    // 選択行の収支を計算してステータスバーに表示
    this.showSumOfSelectedRows();

};

CreditCardTransaction.prototype.initPayMonth = function () {
    var thisMonth = new Date();
    $$('km_textbox_paymonthY').value = thisMonth.getFullYear();
    $$('km_textbox_paymonthM').value = thisMonth.getMonth();
    
};

CreditCardTransaction.prototype.onUserSelect = function () {
    var cardList = this.mDb.creditCardInfo.getCardList($$('km_list_user').value);
    
    $$("km_list_creditcard").removeAllItems();
    for (var i = 0; i < cardList.length; i++) {
        $$("km_list_creditcard").appendItem(cardList[i][1], cardList[i][0]);
    }
    $$("km_list_creditcard").selectedIndex = 0;
};
CreditCardTransaction.prototype.addRecord = function (params) {
    params['boughtAmount'] = params['amount'];
    params['cardId'] = $$('km_list_creditcard').value;
    params['internal'] = 0;

    // 支払月が指定された場合は支払い情報も更新する
    var payMonthY = $$('km_textbox_paymonthY').value;
    if (isNumber(payMonthY)) {
        params['payMonth'] = payMonthY + "-" + $$('km_textbox_paymonthM').value;
        params['payAmount'] = params['boughtAmount']; // 分割払いは当面対応しない
        params['remainingBalance'] = 0;
    }
    this.mDb.creditCardInsert([params], this.insertCallback.bind(this));
};
CreditCardTransaction.prototype.updateRecord = function (idList, params) {
    if (Object.keys(params).length > 1) {
        params['boughtAmount'] = params['amount'];
        params['cardId'] = $$('km_list_creditcard').value;
        params['internal'] = $$('km_list_internal').value;
        // 支払月が指定された場合は支払い情報も更新する
        var payMonthY = $$('km_textbox_paymonthY').value;
        if (isNumber(payMonthY)) {
            params['payMonth'] = payMonthY + "-" + $$('km_textbox_paymonthM').value;
            params['payAmount'] = params['boughtAmount']; // 分割払いは当面対応しない(Issue #10)
            params['remainingBalance'] = 0;
        }
    }
    
    this.mDb.creditCardUpdate(idList, params, this.updateCallback.bind(this));

};
CreditCardTransaction.prototype.deleteRecord = function (idList) {
    this.mDb.creditCardDelete(idList, this.deleteCallback.bind(this));

};
