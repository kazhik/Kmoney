function EMoneyTransaction() {
    Transaction.call(this, "km_tree_emoney");
    this.listeners = [];
}
EMoneyTransaction.prototype = Object.create(Transaction.prototype);

EMoneyTransaction.prototype.initialize = function (db) {
    Transaction.prototype.initialize.call(this, db);

    this.listeners['km_tree_emoney.select'] = this.onSelect.bind(this);
    $$('km_tree_emoney').addEventListener("select", this.listeners['km_tree_emoney.select']);
};
EMoneyTransaction.prototype.terminate = function () {
    $$('km_tree_emoney').removeEventListener("select", this.listeners['km_tree_emoney.select']);
};

EMoneyTransaction.prototype.load = function (sortParams) {
    km_debug("EMoneyTransaction.load start");
    this.setDuplicate(false);
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        if (param['key'] === "emoney") {
            param['value'] = $$('km_list_qcond_value' + i).value;
        }
        queryParams.push(param);
    }
    
    this.mDb.emoneyTrns.load(sortParams, queryParams, this.loadCallback.bind(this));
    this.onUserSelect();

    km_debug("EMoneyTransaction.load end");
};

EMoneyTransaction.prototype.loadDuplicate = function() {
    this.setDuplicate(true);
    this.mDb.emoneyTrns.loadDuplicate(this.loadCallback.bind(this));
    this.onUserSelect();
};
EMoneyTransaction.prototype.openEdit = function (id) {
    this.mTree.ensureRowIsVisible('id', id);
};

EMoneyTransaction.prototype.onSelect = function () {
    $$('km_date_transdate').value = this.mTree.getSelectedRowValue('transaction_date');
    $$('km_list_item').value = this.mTree.getSelectedRowValue('item_id');
    $$('km_textbox_detail').value = this.mTree.getSelectedRowValue('detail');
    var amount = this.mTree.getSelectedRowValue('income');
    if (Number(amount) == 0) {
        amount = this.mTree.getSelectedRowValue('expense');
        $$('km_radgroup_income-expense').selectedItem = $$('km_radio_expense');
    } else {
        $$('km_radgroup_income-expense').selectedItem = $$('km_radio_income');
    }
    $$('km_textbox_amount').value = amount;
    $$('km_list_emoney').value = this.mTree.getSelectedRowValue('money_id');
    $$('km_list_user').value = this.mTree.getSelectedRowValue('user_id');
    $$('km_list_internal').value = this.mTree.getSelectedRowValue('internal');

    // 選択行の収支を計算してステータスバーに表示
    this.showSumOfSelectedRows();

};

EMoneyTransaction.prototype.onUserSelect = function () {
    var moneyList = this.mDb.emoneyInfo.getMoneyList($$('km_list_user').value);

    $$("km_list_emoney").removeAllItems();
    for (var i = 0; i < moneyList.length; i++) {
        $$("km_list_emoney").appendItem(moneyList[i][1], moneyList[i][0]);
    }
    $$("km_list_emoney").selectedIndex = 0;

};


EMoneyTransaction.prototype.addRecord = function (params) {
    if ($$('km_radio_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['moneyId'] = $$('km_list_emoney').value;
    params['internal'] = $$('km_list_internal').value;

    this.mDb.emoneyInsert([params], this.insertCallback.bind(this));

};
EMoneyTransaction.prototype.updateRecord = function (idList, params) {
    if (Object.keys(params).length > 1) {
        if ($$('km_radio_income').selected) {
            params['income'] = params['amount'];
        } else {
            params['expense'] = params['amount'];
        }
        params['moneyId'] = $$('km_list_emoney').value;
        params['internal'] = $$('km_list_internal').value;
    }
    
    this.mDb.emoneyUpdate(idList, params, this.updateCallback.bind(this));
};

EMoneyTransaction.prototype.deleteRecord = function (idList) {
    this.mDb.emoneyDelete(idList, this.deleteCallback.bind(this));


};