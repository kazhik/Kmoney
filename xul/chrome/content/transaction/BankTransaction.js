
function BankTransaction() {
    Transaction.call(this, "km_tree_bank");
    this.listeners = [];
}

BankTransaction.prototype = Object.create(Transaction.prototype);

BankTransaction.prototype.initialize = function (db) {
    Transaction.prototype.initialize.call(this, db);

    this.listeners['km_tree_bank.select'] = this.onSelect.bind(this);
    $$('km_tree_bank').addEventListener("select", this.listeners['km_tree_bank.select']);
    
};
BankTransaction.prototype.terminate = function () {
    $$('km_tree_bank').removeEventListener("select", this.listeners['km_tree_bank.select']);
    
};

BankTransaction.prototype.load = function (sortParams) {
    km_debug("BankTransaction.load start");
    this.setDuplicate(false);
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        if (param['key'] === "bank") {
            param['value'] = $$('km_list_qcond_value' + i).value;
        }
        queryParams.push(param);
    }
    this.mDb.bankTrns.load(sortParams, queryParams, this.loadCallback.bind(this));

    this.onUserSelect();
    km_debug("BankTransaction.load end");
};
BankTransaction.prototype.loadDuplicate = function() {
    this.setDuplicate(true);
    this.mDb.bankTrns.loadDuplicate(this.loadCallback.bind(this));
    this.onUserSelect();
};
BankTransaction.prototype.openEdit = function (id) {
    this.mTree.ensureRowIsVisible('id', id);
};
BankTransaction.prototype.onSelect = function () {
    $$('km_date_transdate').value = this.mTree.getSelectedRowValue('transaction_date');
    $$('km_list_category').value = this.mTree.getSelectedRowValue('category_id');
    $$('km_textbox_detail').value = this.mTree.getSelectedRowValue('detail');
    var amount = this.mTree.getSelectedRowValue('income');
    if(Number(amount) == 0) {
        amount = this.mTree.getSelectedRowValue('expense');
        $$('km_radgroup_income-expense').selectedItem = $$('km_radio_expense');
    } else {
        $$('km_radgroup_income-expense').selectedItem = $$('km_radio_income');
    }
    $$('km_textbox_amount').value = amount;
    $$('km_list_bank').value = this.mTree.getSelectedRowValue('bank_id');
    $$('km_list_user').value = this.mTree.getSelectedRowValue('user_id');
    $$('km_list_internal').value = this.mTree.getSelectedRowValue('internal');

    // 選択行の収支を計算してステータスバーに表示
    this.showSumOfSelectedRows();
}

BankTransaction.prototype.onUserSelect = function () {
    var bankList = this.mDb.bankInfo.getBankList($$('km_list_user').value);

    $$("km_list_bank").removeAllItems();
    for(var i = 0; i < bankList.length; i++) {
        $$("km_list_bank").appendItem(bankList[i][1], bankList[i][0]);
    }
    $$("km_list_bank").selectedIndex = 0;

};

BankTransaction.prototype.addRecord = function (params) {
    if ($$('km_radio_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['bankId'] = $$('km_list_bank').value;
    params['internal'] = $$('km_list_internal').value;

    this.mDb.bankInsert([params], this.insertCallback.bind(this));    
    
};
BankTransaction.prototype.updateRecord = function (idList, params) {
    if (Object.keys(params).length > 1) {
        if ($$('km_radio_income').selected) {
            params['income'] = params['amount'];
        } else {
            params['expense'] = params['amount'];
        }
        params['bankId'] = $$('km_list_bank').value;
        params['internal'] = $$('km_list_internal').value;
    }
    
    this.mDb.bankUpdate(idList, params, this.updateCallback.bind(this));

};

BankTransaction.prototype.deleteRecord = function (idList) {
    this.mDb.bankDelete(idList, this.deleteCallback.bind(this));
};
