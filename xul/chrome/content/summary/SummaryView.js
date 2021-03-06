function SummaryView() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_summary");
    this.mGraph = null;
    this.listeners = [];
};

SummaryView.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.loadTable.bind(this));

    this.listeners['km_list_summ_category.command'] = this.onConditionChanged.bind(this);
    $$('km_list_summ_category').addEventListener("command", this.listeners['km_list_summ_category.command']);

    this.listeners['km_radgroup_viewmode.command'] = this.onViewModeChanged.bind(this);
    $$('km_radgroup_viewmode').addEventListener("command",
                                               this.listeners['km_radgroup_viewmode.command']);

                                                 
};
SummaryView.prototype.terminate = function () {
    $$('km_list_summ_category').removeEventListener("command",
                                              this.listeners['km_list_summ_category.command']);

    $$('km_radgroup_viewmode').removeEventListener("command",
                                                  this.listeners['km_radgroup_viewmode.command']);
};
SummaryView.prototype.onViewModeChanged = function () {
    this.load();
};
SummaryView.prototype.changeSummaryItemList = function () {
    if ($$('km_radio_table').selected) {
        if ($$('km_list_summ_category').getItemAtIndex(0).value != 0) {
            $$('km_list_summ_category').insertItemAt(0, km_getLStr('query_condition.none'), 0);
        }
    } else {
        if ($$('km_list_summ_category').getItemAtIndex(0).value == 0) {
            $$('km_list_summ_category').removeItemAt(0);
        }
    }
    $$('km_list_summ_category').selectedIndex = 0;
}

SummaryView.prototype.onConditionChanged = function () {
    this.load();
};
SummaryView.prototype.load = function() {
    if ($$('km_radio_table').selected) {
        this.loadTable();
    } else {
        this.drawGraph();
    }
    
}
SummaryView.prototype.loadTable = function (sortParams) {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    $$('km_box_summary_panel').hidden = true;
    $$('km_tree_summary').hidden = false;
    $$('km_box_summary_condition_period').hidden = true;

    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    var queryParams = {
        "categoryId": strToInt($$('km_list_summ_category').value),
        "userId": strToInt($$('km_list_summary_user').value)
    };
    
    this.mDb.transactions.loadAllSumPerMonth(sortParams, queryParams, loadCallback.bind(this));

};
SummaryView.prototype.drawGraph = function () {
    function loadCallback(records) {
        var monthFrom = new Date(parseInt(monthfromY), parseInt(monthfromM, 10) - 1, 1);
        var monthTo = new Date(parseInt(monthtoY), parseInt(monthtoM, 10) - 1, 1);
        
        var labelArray = [];
        var valueArray = [];
    
        var labelDate = monthFrom;
        var idx = 0;
        while (labelDate <= monthTo) {
            var dateStr = convDateToYYYYMM(labelDate, "/");
            labelArray.push(dateStr);
    
            if (records[idx] != undefined && records[idx][0] === dateStr) {
                valueArray.push(records[idx][3]);
                idx++;
            } else {
                valueArray.push(0);
            }
            labelDate.setMonth(labelDate.getMonth() + 1);
        }
    
        KmGlobals.$empty($$('km_box_summary_panel'));
        this.mGraph = new Ico.BarGraph(
        $$('km_box_summary_panel'), {
            expense: valueArray
        }, {
            colours: {
                expense: '#990000'
            },
            show_vertical_labels: false,
            max_bar_size: 100,
            labels: labelArray,
            bar_labels: true
        });
    }
    
    var monthfromY = $$('km_list_summary_monthfromY').value;
    var monthfromM = $$('km_list_summary_monthfromM').value;
    var monthtoY = $$('km_list_summary_monthtoY').value;
    var monthtoM = $$('km_list_summary_monthtoM').value;
    
    if (monthfromY == 0 || monthfromM == 0 || monthtoY == 0 || monthtoM == 0) {
        KmGlobals.$empty($$('km_box_summary_panel'));
        return;
    }
    
    $$('km_box_summary_panel').hidden = false;
    $$('km_tree_summary').hidden = true;
    $$('km_box_summary_condition_period').hidden = false;
    
    var params = {
        "periodFrom": monthfromY + "/" + monthfromM,
        "periodTo": monthtoY + "/" + monthtoM,
        "categoryId": strToInt($$('km_list_summ_category').value),
        "userId": strToInt($$('km_list_summary_user').value)
    };
    
    this.mDb.transactions.loadSumPerMonth(params, loadCallback.bind(this));
    
};
