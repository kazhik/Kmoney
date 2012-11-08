
function BankTable() {
    Transaction.call(this, "km_tree_bank");
}

BankTable.prototype = Object.create(Transaction.prototype);

BankTable.prototype.initialize = function (db) {
    Transaction.prototype.initialize.call(this, db);
    this.loadBankList();
};

BankTable.prototype.load = function (sortParams) {
    km_debug("BankTable.load start");
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        if (param['key'] === "bank") {
            param['value'] = $$('km_edit_query_list' + i).value;
        }
        queryParams.push(param);
    }
    this.mDb.bankTrns.load(sortParams, queryParams, this.loadCallback.bind(this));

    km_debug("BankTable.load end");
};
BankTable.prototype.onSelect = function () {
    $$('km_edit_transactionDate').value = this.mTree.getSelectedRowValue('transaction_date');
    $$('km_edit_item').value = this.mTree.getSelectedRowValue('item_id');
    $$('km_edit_detail').value = this.mTree.getSelectedRowValue('detail');
    var amount = this.mTree.getSelectedRowValue('income');
    if(Number(amount) == 0) {
        amount = this.mTree.getSelectedRowValue('expense');
        $$('income_expense').selectedItem = $$('km_edit_expense');
    } else {
        $$('income_expense').selectedItem = $$('km_edit_income');
    }
    $$('km_edit_amount').value = amount;
    $$('km_edit_bank').value = this.mTree.getSelectedRowValue('bank_id');
    $$('km_edit_user').value = this.mTree.getSelectedRowValue('user_id');
    $$('km_edit_internal').value = this.mTree.getSelectedRowValue('internal');

    // 選択行の収支を計算してステータスバーに表示
    this.showSumOfSelectedRows();
}
BankTable.prototype.loadBankList = function () {
    function onLoad(records) {
        this.onUserSelect();
    }
    km_debug("BankTable.loadBankList");
    this.mDb.bankInfo.load(onLoad.bind(this));

};
BankTable.prototype.onUserSelect = function () {
    var bankList = this.mDb.bankInfo.getBankList($$('km_edit_user').value);

    $$("km_edit_bank").removeAllItems();
    for(var i = 0; i < bankList.length; i++) {
        $$("km_edit_bank").appendItem(bankList[i][1], bankList[i][0]);
    }
    $$("km_edit_bank").selectedIndex = 0;

};

BankTable.prototype.addRecord = function (params) {
    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['bankId'] = $$('km_edit_bank').value;
    params['internal'] = $$('km_edit_internal').value;

    this.mDb.bankInsert([params], this.insertCallback.bind(this));    
    
};
BankTable.prototype.updateRecord = function (id, params) {
    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['bankId'] = $$('km_edit_bank').value;
    params['internal'] = $$('km_edit_internal').value;
    
    this.mDb.bankUpdate([id], params, this.updateCallback.bind(this));

};

BankTable.prototype.deleteRecord = function (idList) {
    this.mDb.bankDelete(idList, this.deleteCallback.bind(this));
};
