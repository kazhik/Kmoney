function CashTransaction() {
    Transaction.call(this, "km_tree_cash");
    this.listeners = [];
};
CashTransaction.prototype = Object.create(Transaction.prototype);

CashTransaction.prototype.initialize = function (db) {
    Transaction.prototype.initialize.call(this, db);

    this.listeners['km_tree_cash.select'] = this.onSelect.bind(this);
    $$('km_tree_cash').addEventListener("select", this.listeners['km_tree_cash.select']);
    
};
CashTransaction.prototype.terminate = function () {
    $$('km_tree_cash').removeEventListener("select", this.listeners['km_tree_cash.select']);
    
};

CashTransaction.prototype.load = function (sortParams) {
    km_debug("CashTransaction.load start");
    this.setDuplicate(false);
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        queryParams.push(param);
    }
    
    this.mDb.cashTrns.load(sortParams, queryParams, this.loadCallback.bind(this));

    km_debug("CashTransaction.load end");

};
CashTransaction.prototype.loadDuplicate = function() {
    this.setDuplicate(true);
    this.mDb.cashTrns.loadDuplicate(this.loadCallback.bind(this));
};

CashTransaction.prototype.openEdit = function (id) {
    this.mTree.ensureRowIsVisible('id', id);
};

CashTransaction.prototype.onSelect = function () {
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
CashTransaction.prototype.addRecord = function (params) {
    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['internal'] = $$('km_edit_internal').value;

    this.mDb.cashInsert([params], this.insertCallback.bind(this));    
};
CashTransaction.prototype.updateRecord = function (idList, params) {
    if (Object.keys(params).length > 1) {
        if ($$('km_edit_income').selected) {
            params['income'] = params['amount'];
        } else {
            params['expense'] = params['amount'];
        }
        params['internal'] = $$('km_edit_internal').value;
    }

    this.mDb.cashUpdate(idList, params, this.updateCallback.bind(this));
};

CashTransaction.prototype.deleteRecord = function (idList) {
    this.mDb.cashDelete(idList, this.deleteCallback.bind(this));

};
