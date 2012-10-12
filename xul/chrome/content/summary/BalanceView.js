function BalanceView() {
    this.mDb = null;
    this.mBankList = null;
    this.mGraph = null;
    this.listeners = [];
};
BalanceView.prototype.initialize = function (db, bankList) {
    this.mDb = db;
    this.mBankList = bankList;

    this.listeners['km_summary_bank.command'] = this.onGraphItemChanged.bind(this);
    $$('km_summary_bank').addEventListener("command", this.listeners['km_summary_bank.command']);

    this.listeners['km_summary_user.command'] = this.onUserSelect.bind(this);
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
};
BalanceView.prototype.terminate = function () {
};
BalanceView.prototype.onGraphItemChanged = function () {
    this.drawGraph();
};
BalanceView.prototype.onUserSelect = function () {
    $$("km_summary_bank").removeAllItems();
    var userId = $$('km_summary_user').value;

    for(var i = 0; i < this.mBankList.length; i++) {
        if(this.mBankList[i][2] == userId) {
            $$("km_summary_bank").appendItem(this.mBankList[i][1], this.mBankList[i][0]);
        }
    }
    $$("km_summary_bank").selectedIndex = 0;

    this.drawGraph();
};
BalanceView.prototype.drawGraph = function () {
    var monthfromY = $$('km_summary_monthfromY').value;
    var monthfromM = $$('km_summary_monthfromM').value;
    var monthtoY = $$('km_summary_monthtoY').value;
    var monthtoM = $$('km_summary_monthtoM').value;
 
    var bankid = parseInt($$('km_summary_bank').value);
    var userid = parseInt($$('km_summary_user').value);

    var params = {};
    params['periodFrom'] = monthfromY + "/" + monthfromM;
    params['periodTo'] = monthtoY + "/" + monthtoM;
    var sql = ["select",
                        "strftime('%Y/%m', transaction_date) as transaction_month,",
                        "sum(income - expense) as sumpermonth",
                        "from km_bank_trns",
                        "where transaction_month >= :periodFrom",
                        "and transaction_month <= :periodTo"].join(" ");
    if (userid !== 0) {
        sql += " and user_id = :user_id ";
        params['user_id'] = userid;
    }
    if (bankid !== 0) {
        sql += " and bank_id = :bank_id ";
        params['bank_id'] = userid;
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

    KmGlobals.$empty($$('km_balance'));
    this.mGraph = new Ico.LineGraph(
    $$('km_balance'), {
        balance: valueArray
    }, {
        markers: 'circle',
        show_vertical_labels: true,
        meanline: true,
        grid: true,
        labels: labelArray
    });

};