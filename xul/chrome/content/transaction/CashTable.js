function CashTable() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_cash");
};

CashTable.prototype.initialize = function (db) {
    this.mDb = db;

    this.mTree.init(this.load.bind(this));
};

CashTable.prototype.load = function (sortParams) {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.ensureRowIsVisible('id', -1);
        this.mTree.showTable(true);
    }

    km_debug("CashTable.load start");
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
        }
        if (i != 1) {
            param['andor'] = $$('km_list_query_andor').value;
        }
        queryParams.push(param);
    }
    
    this.mDb.cashTrns.load(sortParams, queryParams, loadCallback.bind(this));

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
    var incomeArray = this.mTree.getSelectedRowValueList('income');
    var expenseArray = this.mTree.getSelectedRowValueList('expense');
    var sum = 0;
    var i = 0;
    for (i = 0; i < incomeArray.length; i++) {
        sum += parseInt(incomeArray[i]);
    }
    for (i = 0; i < expenseArray.length; i++) {
        sum -= parseInt(expenseArray[i]);
    }
    $$('km_status_sum').label = km_getLStr("status.sum") + "=" + sum;

};
CashTable.prototype.addRecord = function (params) {
    function insertCallback(id) {
        this.load();
        this.mTree.ensureRowIsVisible('id', id);
    }

    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['internal'] = $$('km_edit_internal').value;
    
    this.mDb.cashTrns.insert([params], insertCallback.bind(this));
};
CashTable.prototype.updateRecord = function (id, params) {
    function updateCallback() {
        this.load();
        this.mTree.ensureRowIsVisible('id', id);
    }

    if ($$('km_edit_income').selected) {
        params['income'] = params['amount'];
    } else {
        params['expense'] = params['amount'];
    }
    params['internal'] = $$('km_edit_internal').value;

    this.mDb.cashTrns.update(id, params, updateCallback.bind(this));

};

CashTable.prototype.deleteRecord = function (id) {
    function deleteCallback() {
        this.load();
        this.mTree.ensurePreviousRowIsVisible();
    }

    this.mDb.cashTrns.delete(id, deleteCallback.bind(this));

};
