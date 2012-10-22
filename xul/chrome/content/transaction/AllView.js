function AllView() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_all");
};

AllView.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
};
AllView.prototype.onSelect = function () {
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
AllView.prototype.load = function (sortParams) {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.ensureRowIsVisible('id', -1);
        this.mTree.showTable(true);
    }

    km_debug("AllView.load start");
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
    
    this.mDb.transactions.load(sortParams, queryParams, loadCallback.bind(this));

    km_debug("AllView.load end");

};