"use strict";
Components.utils.import("chrome://kmoney/content/appInfo.js");


KmGlobals.disableChrome();

var kmoney;

function Kmoney() {
    this.mDb = null;
    this.cashTree = null;
    this.creditcardTree = null;
    this.bankTree = null;
    this.emoneyTree = null;
    this.allView = null;
    this.listeners = [];
    this.summary = null;
    this.balance = null;
    this.itemMap = {};
    this.importTypeList = {};
    this.importers = {};
    this.users = {};
    
}

function Startup() {
    kmoney = new Kmoney();
    kmoney.Startup();
}

function Shutdown() {
    kmoney.Shutdown();
}

Kmoney.prototype.Startup = function () {
    km_debug("Kmoney.Startup start");
    this.cashTree = new CashTable();
    this.creditcardTree = new CreditCardTable();
    this.emoneyTree = new EMoneyTable();
    this.bankTree = new BankTable();
    this.summary = new SummaryView();
    this.balance = new BalanceView();
    this.allView = new AllView();
    
    this.mDb = new KmDatabase();
    
    this.addEventListeners();

    this.mDb.openLastDb();
    this.loadData();
    km_debug("Kmoney.Startup end");
};
Kmoney.prototype.loadData = function() {
    km_debug("Kmoney.loadData start");
    this.populateItemList();
    this.populateUserList();
    this.populateInternalList();
    this.populateSummaryPeriodList();
    
    this.cashTree.initialize(this.mDb);
    this.creditcardTree.initialize(this.mDb);
    this.emoneyTree.initialize(this.mDb);
    this.bankTree.initialize(this.mDb);
    this.summary.initialize(this.mDb);
    this.balance.initialize(this.mDb);
    this.allView.initialize(this.mDb);

    this.initImport();
    
    this.loadTable($$('km_tabbox').selectedTab.id);
    km_debug("Kmoney.loadData end");
};
Kmoney.prototype.initImport = function () {
    this.importTypeList["bank"] =
        {"label": km_getLStr("import.bank"), "ext": "*.csv"};
    this.importTypeList["mizuho"] =
        {"label": km_getLStr("import.mizuho"), "ext": "*.ofx"};
    this.importTypeList["shinsei"] =
        {"label": km_getLStr("import.shinsei"), "ext": "*.csv"};
    this.importTypeList["creditcard"] =
        {"label": km_getLStr("import.creditcard"), "ext": "*.csv"};
    this.importTypeList["saison"] =
        {"label": km_getLStr("import.saison"), "ext": "*.csv"};
    this.importTypeList["uc"] =
        {"label": km_getLStr("import.uc"), "ext": "*.csv"};
    this.importTypeList["view"] =
        {"label": km_getLStr("import.view"), "ext": "*.html"};
    this.importTypeList["emoney"] =
        {"label": km_getLStr("import.emoney"), "ext": "*.csv"};
    this.importTypeList["suica"] =
        {"label": km_getLStr("import.suica"), "ext": "*.html"};
    this.importTypeList["kantan"] =
        {"label": km_getLStr("import.kantan"), "ext": "*.db"};

    this.importers["view"] = new ViewCard(this.mDb, this.creditcardTree);
    this.importers["saison"] = new SaisonCard(this.mDb, this.creditcardTree);
    this.importers["uc"] = new UCCard(this.mDb);
    this.importers["shinsei"] = new ShinseiBank(this.mDb);
    this.importers["mizuho"] = new MizuhoBank(this.mDb);
    this.importers["suica"] = new Suica(this.mDb);
    this.importers["kantan"] = new KantanKakeibo(this.mDb);
};

Kmoney.prototype.Shutdown = function () {
    this.summary.terminate();
    this.removeEventListeners();
    this.mDb.closeDatabase(false);
};

Kmoney.prototype.addEventListeners = function () {
    this.listeners['kmc-openDb.command'] = this.openDatabase.bind(this);
    $$('kmc-openDb').addEventListener("command", this.listeners['kmc-openDb.command']);

    this.listeners['kmc-newDb.command'] = this.newDatabase.bind(this);
    $$('kmc-newDb').addEventListener("command", this.listeners['kmc-newDb.command']);

    this.listeners['kmc-import.command'] = this.importFile.bind(this);
    $$('kmc-import').addEventListener("command", this.listeners['kmc-import.command']);
    
    this.listeners['km_tabs.select'] = this.onTabSelected.bind(this);
    $$('km_tabs').addEventListener("select", this.listeners['km_tabs.select']);

    this.listeners['km_button_add.command'] = this.addRecord.bind(this);
    $$('km_button_add').addEventListener("command", this.listeners['km_button_add.command']);

    this.listeners['km_button_update.command'] = this.updateRecord.bind(this);
    $$('km_button_update').addEventListener("command", this.listeners['km_button_update.command']);

    this.listeners['km_button_delete.command'] = this.deleteRecord.bind(this);
    $$('km_button_delete').addEventListener("command", this.listeners['km_button_delete.command']);

    this.listeners['km_button_reset.command'] = this.reset.bind(this);
    $$('km_button_reset').addEventListener("command", this.listeners['km_button_reset.command']);

    this.listeners['km_tree_all.select'] = this.onAllViewSelect.bind(this);
    $$('km_tree_all').addEventListener("select", this.listeners['km_tree_all.select']);

    this.listeners['km_tree_cash.select'] = this.onCashSelect.bind(this);
    $$('km_tree_cash').addEventListener("select", this.listeners['km_tree_cash.select']);

    this.listeners['km_tree_creditcard.select'] = this.onCreditcardSelect.bind(this);
    $$('km_tree_creditcard').addEventListener("select", this.listeners['km_tree_creditcard.select']);

    this.listeners['km_tree_emoney.select'] = this.onEMoneySelect.bind(this);
    $$('km_tree_emoney').addEventListener("select", this.listeners['km_tree_emoney.select']);

    this.listeners['km_tree_bank.select'] = this.onBankSelect.bind(this);
    $$('km_tree_bank').addEventListener("select", this.listeners['km_tree_bank.select']);

    this.listeners['kmc-delete'] = this.deleteRecord.bind(this);
    $$('kmc-delete').addEventListener("command", this.listeners['kmc-delete']);

    this.listeners['km_list_query_condition1.command'] = this.onQueryCondition1Select.bind(this);
    $$('km_list_query_condition1').addEventListener(
        "command", this.listeners['km_list_query_condition1.command']);

    this.listeners['km_list_query_condition2.command'] = this.onQueryCondition2Select.bind(this);
    $$('km_list_query_condition2').addEventListener(
        "command", this.listeners['km_list_query_condition2.command']);

    this.listeners['km_list_query_andor.command'] = this.onQueryConditionChanged.bind(this);
    $$('km_list_query_andor').addEventListener(
        "command", this.listeners['km_list_query_andor.command']);

    this.listeners['km_list_query_operator1.command'] = this.onQueryConditionChanged.bind(this);
    $$('km_list_query_operator1').addEventListener(
        "command", this.listeners['km_list_query_operator1.command']);

    this.listeners['km_list_query_operator2.command'] = this.onQueryConditionChanged.bind(this);
    $$('km_list_query_operator2').addEventListener(
        "command", this.listeners['km_list_query_operator2.command']);
        
    this.listeners['km_edit_query_date1.change'] = this.onQueryConditionChanged.bind(this);
    $$('km_edit_query_date1').addEventListener(
        "change", this.listeners['km_edit_query_date1.change']);

    this.listeners['km_edit_query_date2.change'] = this.onQueryConditionChanged.bind(this);
    $$('km_edit_query_date2').addEventListener(
        "change", this.listeners['km_edit_query_date2.change']);

    this.listeners['km_edit_query_text1.change'] = this.onQueryConditionChanged.bind(this);
    $$('km_edit_query_text1').addEventListener(
        "change", this.listeners['km_edit_query_text1.change']);

    this.listeners['km_edit_query_text2.change'] = this.onQueryConditionChanged.bind(this);
    $$('km_edit_query_text2').addEventListener(
        "change", this.listeners['km_edit_query_text2.change']);
    
    this.listeners['km_edit_query_list1.command'] = this.onQueryConditionChanged.bind(this);
    $$('km_edit_query_list1').addEventListener(
        "command", this.listeners['km_edit_query_list1.command']);

    this.listeners['km_edit_query_list2.command'] = this.onQueryConditionChanged.bind(this);
    $$('km_edit_query_list2').addEventListener(
        "command", this.listeners['km_edit_query_list2.command']);

    this.listeners['km_edit_user.select'] = this.onUserSelect.bind(this);
    $$('km_edit_user').addEventListener("select", this.listeners['km_edit_user.select']);

    this.listeners['kmc-setmaster.command'] = this.openSetMaster.bind(this);
    $$('kmc-setmaster').addEventListener("command", this.listeners['kmc-setmaster.command']);

    this.listeners['kmc-setprefs.command'] = this.openSetPrefs.bind(this);
    $$('kmc-setprefs').addEventListener("command", this.listeners['kmc-setprefs.command']);

    this.listeners['kmc-importconf.command'] = this.openImportConf.bind(this);
    $$('kmc-importconf').addEventListener("command", this.listeners['kmc-importconf.command']);

};

Kmoney.prototype.removeEventListeners = function () {
    $$('kmc-openDb').removeEventListener("command", this.listeners['kmc-openDb.command']);
    $$('kmc-import').removeEventListener("command", this.listeners['kmc-import.command']);
    $$('km_tabs').removeEventListener("select", this.listeners['km_tabs.select']);
    $$('km_button_add').removeEventListener("command", this.listeners['km_button_add.command']);
    $$('km_button_update').removeEventListener("command", this.listeners['km_button_update.command']);
    $$('km_button_reset').removeEventListener("command", this.listeners['km_button_reset.command']);

    $$('km_tree_cash').removeEventListener("select", this.listeners['km_tree_cash.select']);
    $$('km_tree_creditcard').removeEventListener("select", this.listeners['km_tree_creditcard.select']);
    $$('km_tree_emoney').removeEventListener("select", this.listeners['km_tree_emoney.select']);
    $$('km_tree_bank').removeEventListener("select", this.listeners['km_tree_bank.select']);
    $$('kmc-delete').removeEventListener("command", this.listeners['kmc-delete']);
    $$('km_edit_user').removeEventListener("select", this.listeners['km_edit_user.select']);

    $$('kmc-setmaster').removeEventListener("command", this.listeners['kmc-setmaster.command']);
    $$('kmc-setprefs').removeEventListener("command", this.listeners['kmc-setprefs.command']);
};
Kmoney.prototype.openSetMaster = function () {
    if (!this.mDb.isConnected()) {
        return;
    }

    window.openDialog("chrome://kmoney/content/master/MasterData.xul", "MasterData",
        "chrome, resizable, centerscreen, modal, dialog", this.mDb);

};
Kmoney.prototype.openImportConf = function () {
    if (!this.mDb.isConnected()) {
        return;
    }

    window.openDialog("chrome://kmoney/content/import/ImportConf.xul", "ImportConf",
        "chrome, resizable, centerscreen, modal, dialog", this.mDb, this.itemMap);

};
Kmoney.prototype.openSetPrefs = function () {
    var features = "chrome,titlebar,toolbar,centerscreen,modal";
    openDialog(KmGlobals.chromes.preferences, 'preferences', features);
};

Kmoney.prototype.onAllViewSelect = function () {
    this.allView.onSelect();
};
Kmoney.prototype.onCashSelect = function () {
    this.cashTree.onSelect();
};
Kmoney.prototype.onBankSelect = function () {
    this.bankTree.onSelect();
};
Kmoney.prototype.onCreditcardSelect = function () {
    this.creditcardTree.onSelect();
};
Kmoney.prototype.onEMoneySelect = function () {
    this.emoneyTree.onSelect();
};
Kmoney.prototype.loadTable = function (tabId) {
    var panelType;
    var panelContent;
    switch (tabId) {
    case 'km_tab_cash':
        panelContent = this.cashTree;
        panelType = "table";
        $$('bankbox').hidden = true;
        $$('creditcardbox').hidden = true;
        $$('emoneybox').hidden = true;
        $$('km_edit1').hidden = false;
        $$('km_edit2').hidden = false;
        $$('km_edit_buttons').hidden = false;
        $$('km_summary_condition').hidden = true;
        $$('km_query1').hidden = false;
        $$('km_query2').hidden = false;
        this.initQueryCondition('km_list_query_condition1');
        this.initQueryCondition('km_list_query_condition2');
        break;
    case 'km_tab_bank':
        panelContent = this.bankTree;
        panelType = "table";
        $$('bankbox').hidden = false;
        $$('creditcardbox').hidden = true;
        $$('emoneybox').hidden = true;
        $$('km_edit1').hidden = false;
        $$('km_edit2').hidden = false;
        $$('km_edit_buttons').hidden = false;
        $$('km_summary_condition').hidden = true;
        $$('km_query1').hidden = false;
        $$('km_query2').hidden = false;
        this.initQueryCondition('km_list_query_condition1');
        this.initQueryCondition('km_list_query_condition2');
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.bank"), "bank");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.bank"), "bank");
        break;
    case 'km_tab_creditcard':
        panelContent = this.creditcardTree;
        panelType = "table";
        $$('bankbox').hidden = true;
        $$('creditcardbox').hidden = false;
        $$('emoneybox').hidden = true;
        $$('km_edit1').hidden = false;
        $$('km_edit2').hidden = false;
        $$('km_edit_buttons').hidden = false;
        $$('km_summary_condition').hidden = true;
        $$('km_query1').hidden = false;
        $$('km_query2').hidden = false;
        this.initQueryCondition('km_list_query_condition1');
        this.initQueryCondition('km_list_query_condition2');
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        break;
    case 'km_tab_emoney':
        panelContent = this.emoneyTree;
        panelType = "table";
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.emoney"), "emoney");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.emoney"), "emoney");
        $$('bankbox').hidden = true;
        $$('creditcardbox').hidden = true;
        $$('emoneybox').hidden = false;
        $$('km_edit1').hidden = false;
        $$('km_edit2').hidden = false;
        $$('km_edit_buttons').hidden = false;
        $$('km_summary_condition').hidden = true;
        $$('km_query1').hidden = false;
        $$('km_query2').hidden = false;
        this.initQueryCondition('km_list_query_condition1');
        this.initQueryCondition('km_list_query_condition2');
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        break;
    case 'km_tab_all':
        panelContent = this.allView;
        panelType = "table";
        $$('bankbox').hidden = true;
        $$('creditcardbox').hidden = true;
        $$('emoneybox').hidden = true;
        $$('km_edit1').hidden = true;
        $$('km_edit2').hidden = true;
        $$('km_edit_buttons').hidden = true;
        $$('km_summary_condition').hidden = true;
        $$('km_query1').hidden = false;
        $$('km_query2').hidden = false;
        this.initQueryCondition('km_list_query_condition1');
        this.initQueryCondition('km_list_query_condition2');
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.bank"), "bank");
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.emoney"), "emoney");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.bank"), "bank");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.emoney"), "emoney");
        break;
    case 'km_tab_summary':
        panelContent = this.summary;
        panelType = "graph";
        $$('km_edit1').hidden = true;
        $$('km_edit2').hidden = true;
        $$('km_edit_buttons').hidden = true;
        $$('km_summary_condition').hidden = false;
        $$('km_summary_bankbox').hidden = true;
        $$('km_summary_itembox').hidden = false;
        $$('km_query1').hidden = true;
        $$('km_query2').hidden = true;
        break;
    case 'km_tab_balance':
        panelContent = this.balance;
        panelType = "graph";
        $$('km_edit1').hidden = true;
        $$('km_edit2').hidden = true;
        $$('km_edit_buttons').hidden = true;
        $$('km_summary_condition').hidden = false;
        $$('km_summary_bankbox').hidden = false;
        $$('km_summary_itembox').hidden = true;
        $$('km_query1').hidden = true;
        $$('km_query2').hidden = true;
        break;
    }

    if (panelType === "table") {
        $$('km_list_query_condition1').selectedIndex = 1;
        $$('km_list_query_andor').selectedIndex = 0;
        $$('km_list_query_condition2').selectedIndex = 0;
        this.onQueryCondition1Select();
        this.onQueryCondition2Select();

        panelContent.load();
    } else if (panelType === "graph") {
        // デフォルトは前月までの6ヶ月間
        var monthToDefault = new Date();
        var monthValue;
        monthToDefault.setMonth(monthToDefault.getMonth() - 1);
        var monthFromDefault = new Date(monthToDefault.getFullYear(),
                                        monthToDefault.getMonth() - 5,
                                        1);
        $$('km_summary_monthfromY').value = monthFromDefault.getFullYear();
        monthValue = monthFromDefault.getMonth() + 1;
        if (monthValue < 10) {
            monthValue = "0" + monthValue;
        }
        $$('km_summary_monthfromM').value = monthValue;
        $$('km_summary_monthtoY').value = monthToDefault.getFullYear();
        monthValue = monthToDefault.getMonth() + 1;
        if (monthValue < 10) {
            monthValue = "0" + monthValue;
        }
        $$('km_summary_monthtoM').value = monthValue;
        panelContent.drawGraph();
    }

};
Kmoney.prototype.onTabSelected = function (e) {
    $$('km_status_sum').label = "";
    this.loadTable($$('km_tabbox').selectedTab.id);
};
Kmoney.prototype.importFile = function () {
    function importCallback() {
        
    }
    var retVals = { file: null, importtype: null, user: null };
    
    window.openDialog("chrome://kmoney/content/import/ImportDialog.xul", "ImportDialog",
        "chrome, resizable, centerscreen, modal, dialog",
        this.mDb, this.importTypeList, this.users, retVals);
    
    if (retVals['importtype'] != null) {
        var importer = this.importers[retVals["importtype"]];
        if (importer === undefined) {
            km_alert("Error", "Not implemented yet");
            return false;
        }
        importer.importDb(retVals['file'], retVals["user"], importCallback.bind(this));
    }
    return true;
};
Kmoney.prototype.newDatabase = function () {
    this.mDb.newDatabase();
    this.loadData();
};
Kmoney.prototype.openDatabase = function () {
    this.mDb.openDatabase();
    this.loadData();
};

Kmoney.prototype.populateItemList = function () {
    function loadCallback(records) {
        $$('km_edit_item').removeAllItems();
        $$('km_summary_item').removeAllItems();
        $$('km_summary_item').appendItem(km_getLStr("query_condition.none"), 0);
        for (var i = 0; i < records.length; i++) {
            $$('km_edit_item').appendItem(records[i][1], records[i][0]);
            $$('km_summary_item').appendItem(records[i][1], records[i][0]);
            this.itemMap[records[i][1]] = records[i][0];
        }
        $$('km_edit_item').selectedIndex = 0;
        $$('km_summary_item').selectedIndex = 0;
    }
    this.mDb.itemInfo.loadItemList(loadCallback.bind(this));


};
Kmoney.prototype.populateUserList = function () {
    function loadCallback(records) {
        $$('km_edit_user').removeAllItems();
        $$('km_summary_user').removeAllItems();
        $$('km_summary_user').appendItem(km_getLStr('query_condition.none'), 0);
        for (var i = 0; i < records.length; i++) {
            $$('km_edit_user').appendItem(records[i][1], records[i][0]);
            $$('km_summary_user').appendItem(records[i][1], records[i][0]);
            this.users[records[i][0]] = records[i][1];
        }
    
        $$('km_edit_user').selectedIndex = 0;
        $$('km_summary_user').selectedIndex = 0;
        
    }
    this.mDb.userInfo.load(loadCallback.bind(this));
};
Kmoney.prototype.populateInternalList = function () {
    $$('km_edit_internal').removeAllItems();
    $$('km_edit_internal').appendItem(km_getLStr("internal.none"), 0);
    $$('km_edit_internal').appendItem(km_getLStr("internal.self"), 1);
    $$('km_edit_internal').appendItem(km_getLStr("internal.family"), 2);
    $$('km_edit_internal').selectedIndex = 0;
};
Kmoney.prototype.populateSummaryPeriodList = function () {
    // レコードが存在する最も古い年から今年までをリストに入れる

    function getCallback(oldestYear) {
        var thisYear = (new Date()).getFullYear();
        if (isNaN(oldestYear)) {
            // レコード0件の場合は今年
            oldestYear = thisYear;
        }
    
        $$('km_summary_monthfromY').removeAllItems();
        $$('km_summary_monthtoY').removeAllItems();
    
        $$('km_summary_monthfromY').appendItem("-", 0);
        $$('km_summary_monthtoY').appendItem("-", 0);
        for (var year = oldestYear; year <= thisYear; year++) {
            $$('km_summary_monthfromY').appendItem(year, year);
            $$('km_summary_monthtoY').appendItem(year, year);
        }
        $$('km_summary_monthfromY').selectedIndex = 0;
        $$('km_summary_monthtoY').selectedIndex = 0;
        
        $$('km_summary_monthfromM').removeAllItems();
        $$('km_summary_monthfromM').appendItem("-", 0);
        $$('km_summary_monthtoM').removeAllItems();
        $$('km_summary_monthtoM').appendItem("-", 0);
        for (var i = 0; i < 12; i++) {
            var monthValue = i + 1;
            if (monthValue < 10) {
                monthValue = "0" + monthValue;
            }
            $$('km_summary_monthfromM').appendItem(i + 1, monthValue);
            $$('km_summary_monthtoM').appendItem(i + 1, monthValue);
        }
        $$('km_summary_monthfromM').selectedIndex = 0;    
        $$('km_summary_monthtoM').selectedIndex = 0;    
        
    }
    this.mDb.transactions.getOldestYear(getCallback.bind(this));

};
Kmoney.prototype.reset = function () {
    $$('km_edit_transactionDate').value = convDateToYYYYMMDD(new Date(), "-");
    $$('km_edit_detail').value = "";
    $$('km_edit_amount').value = "";
};
Kmoney.prototype.addRecord = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.addRecord !== 'function') {
        return;
    }

    var amount = $$('km_edit_amount').value;
    if (!isNumber(amount)) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.amount.invalid"));
        return;
    }

    var params = {
        "transactionDate": $$('km_edit_transactionDate').value,
        "itemId": $$('km_edit_item').value,
        "detail": $$('km_edit_detail').value,
        "income": 0,
        "expense": 0,
        "amount": amount,
        "userId": $$('km_edit_user').value
    };

    tree.addRecord(params);
    
};
Kmoney.prototype.updateRecord = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.updateRecord != 'function') {
        return;
    }
    var selectedCnt = tree.mTree.getSelectedRowCount();
    if (selectedCnt === 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
        return;
    } else if (selectedCnt > 1) {
        //TODO: 将来的には複数削除もできるようにする
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.multipleSelected"));
        return;
    }

    var id = tree.mTree.getSelectedRowValue('id');
    if (id === "") {
        km_alert(km_getLStr("no_selectedrow"));
    }

    var amount = $$('km_edit_amount').value;
    if (!isNumber(amount)) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.amount.invalid"));
        return;
    }

    var params = {
        "transactionDate": $$('km_edit_transactionDate').value,
        "itemId": $$('km_edit_item').value,
        "detail": $$('km_edit_detail').value,
        "amount": amount,
        "userId": $$('km_edit_user').value
    };
    tree.updateRecord(id, params);
};
Kmoney.prototype.deleteRecord = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.deleteRecord != 'function') {
        return;
    }
    var selectedCnt = tree.mTree.getSelectedRowCount();
    if (selectedCnt === 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.delete.notSelected"));
        return;
    } else if (selectedCnt > 1) {
        //TODO: 将来的には複数削除もできるようにする
        km_alert(km_getLStr("error.title"), km_getLStr("error.delete.multipleSelected"));
        return;
    }
    var bConfirm = km_confirm(km_getLStr("confirm.title"), km_getLStr("confirm.deleteRow"));
    if (!bConfirm) {
        return;
    }
    var id = tree.mTree.getSelectedRowValue('id');
    tree.deleteRecord(id);
};
Kmoney.prototype.onUserSelect = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.onUserSelect === 'function') {
        tree.onUserSelect();
    }
};
Kmoney.prototype.query = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.load != 'function') {
        return;
    }
    tree.load();
};
Kmoney.prototype.initQueryCondition = function (elementId) {
    $$(elementId).removeAllItems();
    $$(elementId).appendItem(km_getLStr("query_condition.none"), "none");
    $$(elementId).appendItem(km_getLStr("query_condition.date"), "date");
    $$(elementId).appendItem(km_getLStr("query_condition.item"), "item");
    $$(elementId).appendItem(km_getLStr("query_condition.detail"), "detail");
    $$(elementId).appendItem(km_getLStr("query_condition.user"), "user");

};

Kmoney.prototype.onQueryConditionSelect = function(elementNo) {
    var key = $$('km_list_query_condition' + elementNo).value;
    
    var mapKey;
    
    if (key === "none") {
        $$('km_edit_query_date' + elementNo).hidden = true;
        $$('km_edit_query_text' + elementNo).hidden = true;
        $$('km_edit_query_list' + elementNo).hidden = true;
        $$('km_list_query_operator' + elementNo).hidden = true;

        $$('km_list_query_operator' + elementNo).removeAllItems();
    } else if (key === "date") {
        $$('km_edit_query_date' + elementNo).hidden = false;
        $$('km_edit_query_text' + elementNo).hidden = true;
        $$('km_edit_query_list' + elementNo).hidden = true;
        
        $$('km_list_query_operator' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).removeAllItems();
        $$('km_list_query_operator' + elementNo).appendItem(km_getLStr("query_operator.ge"), ">=");
        $$('km_list_query_operator' + elementNo).appendItem(km_getLStr("query_operator.le"), "<=");

        $$('km_list_query_operator' + elementNo).selectedIndex = 0;
        var now = new Date();
        now.setMonth(now.getMonth() - 2);
        now.setDate(1);
        $$('km_edit_query_date' + elementNo).value = convDateToYYYYMMDD(now, "-");
    } else if (key === "item") {
        $$('km_edit_query_date' + elementNo).hidden = true;
        $$('km_edit_query_text' + elementNo).hidden = true;
        $$('km_edit_query_list' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_edit_query_list' + elementNo).removeAllItems();
        for (mapKey in this.itemMap) {
            $$('km_edit_query_list' + elementNo).appendItem(mapKey, this.itemMap[mapKey]);
        }
        $$('km_edit_query_list' + elementNo).selectedIndex = 0;
    } else if (key === "detail") {
        $$('km_edit_query_date' + elementNo).hidden = true;
        $$('km_edit_query_text' + elementNo).hidden = false;
        $$('km_edit_query_list' + elementNo).hidden = true;

        $$('km_list_query_operator' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).removeAllItems();
        $$('km_list_query_operator' + elementNo).appendItem(
            km_getLStr("query_operator.equals"), "=");
        $$('km_list_query_operator' + elementNo).appendItem(
            km_getLStr("query_operator.contains"), "like");
        $$('km_list_query_operator' + elementNo).selectedIndex = 0;
        
        $$('km_edit_query_text' + elementNo).value = "";
    } else if (key === "user") {
        $$('km_edit_query_date' + elementNo).hidden = true;
        $$('km_edit_query_text' + elementNo).hidden = true;
        $$('km_edit_query_list' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_edit_query_list' + elementNo).removeAllItems();
        for (mapKey in this.users) {
            $$('km_edit_query_list' + elementNo).appendItem(this.users[mapKey], mapKey);
        }
        $$('km_edit_query_list' + elementNo).selectedIndex = 0;
    } else if (key === "bank") {
        $$('km_edit_query_date' + elementNo).hidden = true;
        $$('km_edit_query_text' + elementNo).hidden = true;
        $$('km_edit_query_list' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_edit_query_list' + elementNo).removeAllItems();
        for (var i = 0; i < this.bankTree.mBankList.length; i++) {
            $$('km_edit_query_list' + elementNo).appendItem(this.bankTree.mBankList[i][1],
                                                 this.bankTree.mBankList[i][0]);
        }
        $$('km_edit_query_list' + elementNo).selectedIndex = 0;
    } else if (key === "creditcard") {
        $$('km_edit_query_date' + elementNo).hidden = true;
        $$('km_edit_query_text' + elementNo).hidden = true;
        $$('km_edit_query_list' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_edit_query_list' + elementNo).removeAllItems();
        for (var i = 0; i < this.creditcardTree.mCardList.length; i++) {
            $$('km_edit_query_list' + elementNo).appendItem(this.creditcardTree.mCardList[i][1],
                                                 this.creditcardTree.mCardList[i][0]);
        }
        $$('km_edit_query_list' + elementNo).selectedIndex = 0;
    } else if (key === "emoney") {
        $$('km_edit_query_date' + elementNo).hidden = true;
        $$('km_edit_query_text' + elementNo).hidden = true;
        $$('km_edit_query_list' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_edit_query_list' + elementNo).removeAllItems();
        for (var i = 0; i < this.emoneyTree.mMoneyList.length; i++) {
            $$('km_edit_query_list' + elementNo).appendItem(this.emoneyTree.mMoneyList[i][1],
                                                 this.emoneyTree.mMoneyList[i][0]);
        }
        $$('km_edit_query_list' + elementNo).selectedIndex = 0;
    }
    this.query();
};

Kmoney.prototype.onQueryCondition1Select = function() {
    this.onQueryConditionSelect('1');    

    if ($$('km_list_query_condition1').value === "none") {
        $$('km_list_query_condition2').disabled = true;
    } else {
        $$('km_list_query_condition2').disabled = false;
    }

};

Kmoney.prototype.onQueryCondition2Select = function() {
    this.onQueryConditionSelect('2');    
};

Kmoney.prototype.onQueryConditionChanged = function() {
    this.query();
};
Kmoney.prototype.getSelectedTree = function () {
    var tab = null;
    switch ($$('km_tabbox').selectedTab.id) {
    case 'km_tab_cash':
        tab = this.cashTree;
        break;
    case 'km_tab_bank':
        tab = this.bankTree;
        break;
    case 'km_tab_creditcard':
        tab = this.creditcardTree;
        break;
    case 'km_tab_emoney':
        tab = this.emoneyTree;
        break;
    case 'km_tab_summary':
        tab = this.summary;
        break;
    case 'km_tab_balance':
        tab = this.balance;
        break;
    case 'km_tab_all':
        tab = this.allView;
        break;
    }
    return tab;
};
