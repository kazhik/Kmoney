function Transaction(treeId) {
    this.mDb = null;
    this.mTree = new TreeViewController(treeId);
    this.mDup = false;
}
Transaction.prototype.setDuplicate = function (dup) {
    this.mDup = dup;
};
Transaction.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
};
Transaction.prototype.getCommonQueryParam = function (i) {
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
    return param;
};

Transaction.prototype.loadCallback = function (records, columns) {
    this.mTree.populateTableData(records, columns);
    this.mTree.ensureRowIsVisible('id', -1);
    this.mTree.showTable(true);
};

Transaction.prototype.insertCallback = function (id) {
    this.load();
    this.mTree.ensureRowIsVisible('id', id);
    $$('kmc-undo').setAttribute("disabled", false);
};
    
Transaction.prototype.updateCallback = function (id) {
    if (this.mDup) {
        this.loadDuplicate();
    } else {
        this.load();
    }
    this.mTree.ensureRowIsVisible('id', id);
    $$('kmc-undo').setAttribute("disabled", false);
};
Transaction.prototype.deleteCallback = function () {
    if (this.mDup) {
        this.loadDuplicate();
    } else {
        this.load();
    }
    this.mTree.ensurePreviousRowIsVisible();
    $$('kmc-undo').setAttribute("disabled", false);
};
Transaction.prototype.showSumOfSelectedRows = function (id) {
    var incomeArray = this.mTree.getSelectedRowValueList('income');
    var expenseArray = this.mTree.getSelectedRowValueList('expense');
    var sum = 0;
    var i = 0;
    for (i = 0; i < incomeArray.length; i++) {
        sum = calcFloat(sum + parseFloat(incomeArray[i]));
    }
    for (i = 0; i < expenseArray.length; i++) {
        sum = calcFloat(sum - parseFloat(expenseArray[i]));
    }
    $$('km_status_sum').label = km_getLStr("status.sum") + "=" + sum;
};




