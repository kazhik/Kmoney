function SummaryView() {
    this.mDb = null;
    this.mGraph = null;
    this.listeners = [];
};
SummaryView.prototype.initialize = function (db) {
    this.mDb = db;

    this.listeners['km_summary_item.command'] = this.onGraphItemChanged.bind(this);
    $$('km_summary_item').addEventListener("command", this.listeners['km_summary_item.command']);

    this.listeners['km_summary_user.command'] = this.onGraphItemChanged.bind(this);
    $$('km_summary_user').addEventListener("command", this.listeners['km_summary_user.command']);

    this.listeners['km_summary_monthfromY.command'] = this.onGraphItemChanged.bind(this);
    $$('km_summary_monthfromY').addEventListener("command",
                                                 this.listeners['km_summary_monthfromY.command']);
    this.listeners['km_summary_monthfromM.command'] = this.onGraphItemChanged.bind(this);
    $$('km_summary_monthfromM').addEventListener("command",
                                                 this.listeners['km_summary_monthfromM.command']);
    this.listeners['km_summary_monthtoY.command'] = this.onGraphItemChanged.bind(this);
    $$('km_summary_monthtoY').addEventListener("command",
                                                 this.listeners['km_summary_monthtoY.command']);
    this.listeners['km_summary_monthtoM.command'] = this.onGraphItemChanged.bind(this);
    $$('km_summary_monthtoM').addEventListener("command",
                                                 this.listeners['km_summary_monthtoM.command']);
    this.listeners['km_summary_viewmode.command'] = this.onViewModeChanged.bind(this);
    $$('km_summary_viewmode').addEventListener("command", this.listeners['km_summary_viewmode.command']);

                                                 
};
SummaryView.prototype.terminate = function () {
    $$('km_summary_item').removeEventListener("command", this.listeners['km_summary_item.command']);
};
SummaryView.prototype.onViewModeChanged = function () {
    if ($$('km_summary_table').selected) {
        km_debug("SummaryView: table");
    } else {
        km_debug("SummaryView: graph");
    }
};
SummaryView.prototype.onGraphItemChanged = function () {
    this.drawGraph();
};
SummaryView.prototype.loadTable = function () {
    var monthfromY = $$('km_summary_monthfromY').value;
    var monthfromM = $$('km_summary_monthfromM').value;
    var monthtoY = $$('km_summary_monthtoY').value;
    var monthtoM = $$('km_summary_monthtoM').value;
 
    var itemid = parseInt($$('km_summary_item').value);
    var userid = parseInt($$('km_summary_user').value);

    var params = {};
    params['periodFrom'] = monthfromY + "/" + monthfromM;
    params['periodTo'] = monthtoY + "/" + monthtoM;
    var sql = ["select",
                        "strftime('%Y/%m', A.transaction_date) as transaction_month,",
                        "sum(A.expense - A.income) as sumpermonth",
                        "from kmv_transactions A",
                        "where transaction_month >= :periodFrom",
                        "and transaction_month <= :periodTo"].join(" ");
    // ユーザが指定された場合、家計内フラグが「家族」のデータも集計に含める
    if (userid !== 0 && itemid !== 0) {
        sql += " and A.user_id = :user_id and A.internal <> 1 and A.item_id = :item_id ";
        params['user_id'] = userid;
        params['item_id'] = itemid;
    } else if (userid !== 0 && itemid === 0) {
        sql += " and A.user_id = :user_id and A.internal <> 1 ";
        sql += " and A.sum_include = 1 ";
        params['user_id'] = userid;
    } else if (userid === 0 && itemid !== 0) {
        sql += " and A.item_id = :item_id and A.internal = 0 ";
        params['item_id'] = itemid;
    } else {
        sql += " and A.internal = 0 ";
        sql += " and A.sum_include = 1 ";
    }
    sql += " group by transaction_month ";

    km_log(sql);
    this.mDb.selectWithParams(sql, params);
};

SummaryView.prototype.drawGraph = function () {
    var monthfromY = $$('km_summary_monthfromY').value;
    var monthfromM = $$('km_summary_monthfromM').value;
    var monthtoY = $$('km_summary_monthtoY').value;
    var monthtoM = $$('km_summary_monthtoM').value;
 
    var itemid = parseInt($$('km_summary_item').value);
    var userid = parseInt($$('km_summary_user').value);

    var params = {};
    params['periodFrom'] = monthfromY + "/" + monthfromM;
    params['periodTo'] = monthtoY + "/" + monthtoM;
    var sql = ["select",
                        "strftime('%Y/%m', A.transaction_date) as transaction_month,",
                        "sum(A.expense - A.income) as sumpermonth",
                        "from kmv_transactions A",
                        "where transaction_month >= :periodFrom",
                        "and transaction_month <= :periodTo"].join(" ");
    // ユーザが指定された場合、家計内フラグが「家族」のデータも集計に含める
    if (userid !== 0 && itemid !== 0) {
        sql += " and A.user_id = :user_id and A.internal <> 1 and A.item_id = :item_id ";
        params['user_id'] = userid;
        params['item_id'] = itemid;
    } else if (userid !== 0 && itemid === 0) {
        sql += " and A.user_id = :user_id and A.internal <> 1 ";
        sql += " and A.sum_include = 1 ";
        params['user_id'] = userid;
    } else if (userid === 0 && itemid !== 0) {
        sql += " and A.item_id = :item_id and A.internal = 0 ";
        params['item_id'] = itemid;
    } else {
        sql += " and A.internal = 0 ";
        sql += " and A.sum_include = 1 ";
    }
    sql += " group by transaction_month ";

    km_log(sql);
    this.mDb.selectWithParams(sql, params);
    var records = this.mDb.getRecords();
    var labelArray = [];
    var valueArray = [];

    var labelDate = new Date(parseInt(monthfromY), parseInt(monthfromM, 10) - 1, 1);
    var endDate = new Date(parseInt(monthtoY), parseInt(monthtoM, 10) - 1, 1);
    var idx = 0;
    while (labelDate <= endDate) {
        var dateStr = convDateToYYYYMM(labelDate, "/");
        labelArray.push(dateStr);

        if (records[idx] != undefined && records[idx][0] === dateStr) {
            valueArray.push(records[idx][1]);
            idx++;
        } else {
            valueArray.push(0);
        }
        labelDate.setMonth(labelDate.getMonth() + 1);
    }

    KmGlobals.$empty($$('km_summary'));
    this.mGraph = new Ico.BarGraph(
    $$('km_summary'), {
        expense: valueArray
    }, {
        colours: {
            expense: '#990000'
        },
        show_vertical_labels: false,
        labels: labelArray,
        max_bar_size: 20,
        bar_labels: true
    });
};