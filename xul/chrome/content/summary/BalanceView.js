function BalanceView() {
    this.mDb = null;
    this.mBankList = null;
    this.mGraph = null;
    this.listeners = [];
};
BalanceView.prototype.initialize = function (db) {
    this.mDb = db;

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

    this.loadBankList();
};
BalanceView.prototype.loadBankList = function () {
    function onLoad(records) {
        this.mBankList = records;
    }
    km_debug("BalanceView.loadBankList");
    this.mDb.bankInfo.load(onLoad.bind(this));

};

BalanceView.prototype.terminate = function () {
    $$('km_summary_bank').removeEventListener("command", this.listeners['km_summary_bank.command']);

    $$('km_summary_user').removeEventListener("command", this.listeners['km_summary_user.command']);

    $$('km_summary_monthfromY').removeEventListener("command",
                                                 this.listeners['km_summary_monthfromY.command']);
    $$('km_summary_monthfromM').removeEventListener("command",
                                                 this.listeners['km_summary_monthfromM.command']);
    $$('km_summary_monthtoY').removeEventListener("command",
                                                 this.listeners['km_summary_monthtoY.command']);
    $$('km_summary_monthtoM').removeEventListener("command",
                                                 this.listeners['km_summary_monthtoM.command']);
};
BalanceView.prototype.onGraphItemChanged = function () {
    this.drawGraph();
};
BalanceView.prototype.onUserSelect = function () {
    var userId = $$('km_summary_user').value;

    $$("km_summary_bank").removeAllItems();
    for(var i = 0; i < this.mBankList.length; i++) {
        if(this.mBankList[i][2] == userId) {
            $$("km_summary_bank").appendItem(this.mBankList[i][1], this.mBankList[i][0]);
        }
    }
    $$("km_summary_bank").selectedIndex = 0;

    this.drawGraph();
};
BalanceView.prototype.drawGraph = function () {
    function loadCallback(records) {
        var labelArray = [];
        var valueArray = [];
    
        var labelDate = new Date(parseInt(monthfromY), parseInt(monthfromM, 10) - 1, 1);
        var endDate = new Date(parseInt(monthtoY), parseInt(monthtoM, 10) - 1, 1);
        var idx = 0;
        var accumulated = 0;
        while (labelDate <= endDate) {
            var dateStr = convDateToYYYYMM(labelDate, "/");
            labelArray.push(dateStr);
    
            if (records[idx] != undefined && records[idx][0] === dateStr) {
                accumulated = calcFloat(accumulated + parseFloat(records[idx][1]));
                idx++;
            }
            valueArray.push(accumulated);
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
        
    }

    var monthfromY = $$('km_summary_monthfromY').value;
    var monthfromM = $$('km_summary_monthfromM').value;
    var monthtoY = $$('km_summary_monthtoY').value;
    var monthtoM = $$('km_summary_monthtoM').value;

    var params = {
        "periodFrom": monthfromY + "/" + monthfromM,
        "periodTo": monthtoY + "/" + monthtoM,
        "bankId": strToInt($$('km_summary_bank').value),
        "userId": strToInt($$('km_summary_user').value)
    };
    this.mDb.bankTrns.loadSumPerMonth(params, loadCallback.bind(this));
};