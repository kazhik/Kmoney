function CashTable() {
    Transaction.call(this, "km_tree_cash");
};
CashTable.prototype = Object.create(Transaction.prototype);

CashTable.prototype.load = function (sortParams) {
    km_debug("CashTable.load start");
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        queryParams.push(param);
    }
    
    this.mDb.cashTrns.load(sortParams, queryParams, this.loadCallback.bind(this));

    km_debug("CashTable.load end");

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
    this.showSumOfSelectedRows();

};
CashTable.prototype.addRecord = function (params) {
    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['internal'] = $$('km_edit_internal').value;
    
    this.mDb.cashTrns.insert([params], this.insertCallback.bind(this));
};
CashTable.prototype.updateRecord = function (id, params) {
    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['internal'] = $$('km_edit_internal').value;

    this.mDb.cashTrns.update(id, params, this.updateCallback.bind(this));

};

CashTable.prototype.deleteRecord = function (id) {
    this.mDb.cashTrns.delete(id, this.deleteCallback.bind(this));

};
