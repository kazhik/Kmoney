function BalanceView() {
    this.mDb = null;
    this.mGraph = null;
    this.listeners = [];
};
BalanceView.prototype.initialize = function (db) {
    this.mDb = db;

    this.listeners['km_list_summary_bank.command'] = this.onGraphItemChanged.bind(this);
    $$('km_list_summary_bank').addEventListener("command", this.listeners['km_list_summary_bank.command']);

};
BalanceView.prototype.terminate = function () {
    $$('km_list_summary_bank').removeEventListener("command",
                                              this.listeners['km_list_summary_bank.command']);

};
BalanceView.prototype.onGraphItemChanged = function () {
    this.drawGraph();
};
BalanceView.prototype.onUserSelect = function () {
    this.populateBankList();
    this.drawGraph();
};
BalanceView.prototype.populateBankList = function () {
    var userId = $$('km_list_summary_user').value;

    $$("km_list_summary_bank").removeAllItems();
    var bankList = this.mDb.bankInfo.mBankList;
    for(var i = 0; i < bankList.length; i++) {
        if(bankList[i][2] == userId) {
            $$("km_list_summary_bank").appendItem(bankList[i][1], bankList[i][0]);
        }
    }
    $$("km_list_summary_bank").selectedIndex = 0;
};
BalanceView.prototype.load = function() {
    this.populateBankList();
    this.drawGraph();
}
BalanceView.prototype.loadTable = function () {
    alert("Not implemented yet");
};
BalanceView.prototype.drawGraph = function () {
    function loadCallback(records) {
        function execDraw() {
            this.mGraph = new Ico.BarGraph(
            $$('km_box_balance_panel'), {
                balance: valueArray
            }, {
                colours: {
                    balance: '#8A2BE2'
                },
                show_vertical_labels: false,
                max_bar_size: 100,
                bar_labels: true,
                labels: labelArray
            });
            
        }
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
    
        KmGlobals.$empty($$('km_box_balance_panel'));
        
        // 起動時にグラフを表示しようとすると横幅が正しく表示されない。Issue #32
        setTimeout(execDraw.bind(this), 0);
        
    }

    var monthfromY = $$('km_list_summary_monthfromY').value;
    var monthfromM = $$('km_list_summary_monthfromM').value;
    var monthtoY = $$('km_list_summary_monthtoY').value;
    var monthtoM = $$('km_list_summary_monthtoM').value;

    var params = {
        "periodFrom": monthfromY + "/" + monthfromM,
        "periodTo": monthtoY + "/" + monthtoM,
        "bankId": strToInt($$('km_list_summary_bank').value),
        "userId": strToInt($$('km_list_summary_user').value)
    };
    this.mDb.bankTrns.loadSumPerMonth(params, loadCallback.bind(this));
};