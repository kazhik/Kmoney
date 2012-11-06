function EMoneyTable() {
    Transaction.call(this, "km_tree_emoney");
}
EMoneyTable.prototype = Object.create(Transaction.prototype);

EMoneyTable.prototype.initialize = function (db) {
    km_debug("EMoneyTable.initialize start");
    Transaction.prototype.initialize.call(this, db);
    this.loadEMoneyList();
    km_debug("EMoneyTable.initialize end");
};

EMoneyTable.prototype.load = function (sortParams) {
    km_debug("EMoneyTable.load start");
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        if (param['key'] === "emoney") {
            param['value'] = $$('km_edit_query_list' + i).value;
        }
        queryParams.push(param);
    }
    
    this.mDb.emoneyTrns.load(sortParams, queryParams, this.loadCallback.bind(this));

    km_debug("EMoneyTable.load end");
};
EMoneyTable.prototype.onSelect = function () {
    $$('km_edit_transactionDate').value = this.mTree.getSelectedRowValue('transaction_date');
    $$('km_edit_item').value = this.mTree.getSelectedRowValue('item_id');
    $$('km_edit_detail').value = this.mTree.getSelectedRowValue('detail');
    var amount = this.mTree.getSelectedRowValue('income');
    if (Number(amount) == 0) {
        amount = this.mTree.getSelectedRowValue('expense');
        $$('income_expense').selectedItem = $$('km_edit_expense');
    } else {
        $$('income_expense').selectedItem = $$('km_edit_income');
    }
    $$('km_edit_amount').value = amount;
    $$('km_edit_emoney').value = this.mTree.getSelectedRowValue('money_id');
    $$('km_edit_user').value = this.mTree.getSelectedRowValue('user_id');
    $$('km_edit_internal').value = this.mTree.getSelectedRowValue('internal');

    // 選択行の収支を計算してステータスバーに表示
    this.showSumOfSelectedRows();

};
EMoneyTable.prototype.loadEMoneyList = function () {
    function loadCallback(emoneyList) {
        this.onUserSelect();
    }
    this.mDb.emoneyInfo.load(loadCallback.bind(this));

};

EMoneyTable.prototype.onUserSelect = function () {
    var moneyList = this.mDb.emoneyInfo.getMoneyList($$('km_edit_user').value);

    $$("km_edit_emoney").removeAllItems();
    for (var i = 0; i < moneyList.length; i++) {
        $$("km_edit_emoney").appendItem(moneyList[i][1], moneyList[i][0]);
    }
    $$("km_edit_emoney").selectedIndex = 0;

};


EMoneyTable.prototype.addRecord = function (params) {
    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['moneyId'] = $$('km_edit_emoney').value;
    params['internal'] = $$('km_edit_internal').value;

    this.mDb.emoneyInsert([params], this.insertCallback.bind(this));

};
EMoneyTable.prototype.updateRecord = function (id, params) {
    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['moneyId'] = $$('km_edit_emoney').value;
    params['internal'] = $$('km_edit_internal').value;
    
    this.mDb.emoneyUpdate(id, params, updateCallback.bind(this, id));
};

EMoneyTable.prototype.deleteRecord = function (idList) {
    this.mDb.emoneyDelete(idList, this.deleteCallback.bind(this));


};