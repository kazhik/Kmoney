"use strict";
Components.utils.import("chrome://kmoney/content/appInfo.js");

KmGlobals.disableChrome();

const SOURCE_KMONEY = 1;
var kmoney;
   
function Kmoney() {
    this.mDb = null;
    this.cashTrns = null;
    this.creditcardTrns = null;
    this.bankTrns = null;
    this.emoneyTrns = null;
    this.allView = null;
    this.listeners = [];
    this.summary = null;
    this.balance = null;
    this.asset = null;
    this.itemMap = {};
    this.users = {};
    this.currentUser = {};

    this.maFileExt = null;
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
    this.cashTrns = new CashTransaction();
    this.creditcardTrns = new CreditCardTransaction();
    this.emoneyTrns = new EMoneyTransaction();
    this.bankTrns = new BankTransaction();
    this.summary = new SummaryView();
    this.balance = new BalanceView();
    this.allView = new AllTransaction();
    this.asset = new Asset();
    
    this.mDb = new KmDatabase();
    
    this.addEventListeners();

    //To set our variables, etc. we fool observe into believing that the following preferences have changed.
    for(var i = 0; i < KmGlobals.observedPrefs.length; i++) {
        this.observe("", "nsPref:changed", KmGlobals.observedPrefs[i]);
    }
    
    if (!km_prefsBranch.getBoolPref("view.creditcard")) {
        $$('km_tab_creditcard').hidden = true;
    }
    if (!km_prefsBranch.getBoolPref("view.emoney")) {
        $$('km_tab_emoney').hidden = true;
    }
    this.maFileExt = km_prefsBranch.getCharPref("sqliteFileExtensions").split(",");
    
    this.changeUIElements($$('km_tabbox').selectedTab.id);

    if (km_prefsBranch.getBoolPref("openWithLastDb")) {
        if (this.mDb.openLastDb()) {
            this.loadData();
        }
    }
    km_debug("Kmoney.Startup end");
};

Kmoney.prototype.observe = function (subject, topic, data) {
    if (topic != "nsPref:changed") return;

    switch (data) {
        case "jsonMruData":
            KmGlobals.mru.getList();
            break;
        case "sqliteFileExtensions":
            var sExt = km_prefsBranch.getCharPref("sqliteFileExtensions");
            this.maFileExt = sExt.split(",");
            for (var iC = 0; iC < this.maFileExt.length; iC++) {
                this.maFileExt[iC] = this.maFileExt[iC].trim();
            }
            break;
        default:
            break;
    }
};

Kmoney.prototype.loadData = function() {
    km_debug("Kmoney.loadData start");
    
    this.mDb.loadMasterData();
    
    this.cashTrns.initialize(this.mDb);
    this.creditcardTrns.initialize(this.mDb);
    this.emoneyTrns.initialize(this.mDb);
    this.bankTrns.initialize(this.mDb);
    this.summary.initialize(this.mDb);
    this.balance.initialize(this.mDb);
    this.allView.initialize(this.mDb);
    this.asset.initialize(this.mDb);

    this.populateItemList();
    this.populateUserList();
    this.populateInternalList();
    
    var tabId = $$('km_tabbox').selectedTab.id;
    this.loadTable(tabId);
    km_debug("Kmoney.loadData end");
};
Kmoney.prototype.Shutdown = function () {
    km_debug("Kmoney.Shutdown start");
    this.summary.terminate();
    this.balance.terminate();
    this.allView.terminate();
    this.removeEventListeners();
    this.mDb.closeDatabase();
    km_debug("Kmoney.Shutdown end");
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

    this.listeners['kmc-delete'] = this.deleteRecord.bind(this);
    $$('kmc-delete').addEventListener("command", this.listeners['kmc-delete']);

    this.listeners['kmc-undo'] = this.undo.bind(this);
    $$('kmc-undo').addEventListener("command", this.listeners['kmc-undo']);

    this.listeners['km_menu_data_duplicate'] = this.query.bind(this);
    $$('km_menu_data_duplicate').addEventListener("command", this.listeners['km_menu_data_duplicate']);
    
    this.listeners['km_list_query_condition1.command'] = this.onQueryCondition1Select.bind(this, true);
    $$('km_list_query_condition1').addEventListener(
        "command", this.listeners['km_list_query_condition1.command']);

    this.listeners['km_list_query_condition2.command'] = this.onQueryCondition2Select.bind(this, true);
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
        
    this.listeners['km_date_qcond_value1.change'] = this.onQueryConditionChanged.bind(this);
    $$('km_date_qcond_value1').addEventListener(
        "change", this.listeners['km_date_qcond_value1.change']);

    this.listeners['km_date_qcond_value2.change'] = this.onQueryConditionChanged.bind(this);
    $$('km_date_qcond_value2').addEventListener(
        "change", this.listeners['km_date_qcond_value2.change']);

    this.listeners['km_textbox_qcond_value1.change'] = this.onQueryConditionChanged.bind(this);
    $$('km_textbox_qcond_value1').addEventListener(
        "change", this.listeners['km_textbox_qcond_value1.change']);

    this.listeners['km_textbox_qcond_value2.change'] = this.onQueryConditionChanged.bind(this);
    $$('km_textbox_qcond_value2').addEventListener(
        "change", this.listeners['km_textbox_qcond_value2.change']);
    
    this.listeners['km_list_qcond_value1.command'] = this.onQueryConditionChanged.bind(this);
    $$('km_list_qcond_value1').addEventListener(
        "command", this.listeners['km_list_qcond_value1.command']);

    this.listeners['km_list_qcond_value2.command'] = this.onQueryConditionChanged.bind(this);
    $$('km_list_qcond_value2').addEventListener(
        "command", this.listeners['km_list_qcond_value2.command']);

    this.listeners['km_list_user.select'] = this.onUserSelect.bind(this);
    $$('km_list_user').addEventListener("select", this.listeners['km_list_user.select']);

    this.listeners['kmc-setmaster.command'] = this.openSetMaster.bind(this);
    $$('kmc-setmaster').addEventListener("command", this.listeners['kmc-setmaster.command']);

    this.listeners['kmc-setprefs.command'] = this.openSetPrefs.bind(this);
    $$('kmc-setprefs').addEventListener("command", this.listeners['kmc-setprefs.command']);

    this.listeners['kmc-setuser.command'] = this.openSetUser.bind(this);
    $$('kmc-setuser').addEventListener("command", this.listeners['kmc-setuser.command']);
    
    this.listeners['kmc-importconf.command'] = this.openImportConf.bind(this);
    $$('kmc-importconf').addEventListener("command", this.listeners['kmc-importconf.command']);

    this.listeners['kmc-update-item'] = this.updateSelectedRow.bind(this, 'item');
    $$('kmc-update-item').addEventListener("command", this.listeners['kmc-update-item']);
    
    this.listeners['kmc-update-detail'] = this.updateSelectedRow.bind(this, 'detail');
    $$('kmc-update-detail').addEventListener("command", this.listeners['kmc-update-detail']);

    this.listeners['kmc-update-user'] = this.updateSelectedRow.bind(this, 'user');
    $$('kmc-update-user').addEventListener("command", this.listeners['kmc-update-user']);

    this.listeners['kmc-update-bank'] = this.updateSelectedRow.bind(this, 'bank');
    $$('kmc-update-bank').addEventListener("command", this.listeners['kmc-update-bank']);

    this.listeners['kmc-update-creditcard'] = this.updateSelectedRow.bind(this, 'creditcard');
    $$('kmc-update-creditcard').addEventListener("command", this.listeners['kmc-update-creditcard']);

    this.listeners['kmc-update-emoney'] = this.updateSelectedRow.bind(this, 'emoney');
    $$('kmc-update-emoney').addEventListener("command", this.listeners['kmc-update-emoney']);

    this.listeners['kmc-asset'] = this.openAssetTab.bind(this);
    $$('kmc-asset').addEventListener("command", this.listeners['kmc-asset']);

    this.listeners['km_tree_all.dblclick'] = this.openEditTab.bind(this);
    $$('km_tree_all').addEventListener("dblclick", this.listeners['km_tree_all.dblclick']);
    
    this.listeners['km_list_summary_user.command'] = this.onSummaryUserSelect.bind(this);
    $$('km_list_summary_user').addEventListener("command", this.listeners['km_list_summary_user.command']);

    this.listeners['km_list_summary_monthfromY.command'] = this.onSummaryPeriodChanged.bind(this);
    $$('km_list_summary_monthfromY').addEventListener("command",
                                                 this.listeners['km_list_summary_monthfromY.command']);
    this.listeners['km_list_summary_monthfromM.command'] = this.onSummaryPeriodChanged.bind(this);
    $$('km_list_summary_monthfromM').addEventListener("command",
                                                 this.listeners['km_list_summary_monthfromM.command']);
    this.listeners['km_list_summary_monthtoY.command'] = this.onSummaryPeriodChanged.bind(this);
    $$('km_list_summary_monthtoY').addEventListener("command",
                                                 this.listeners['km_list_summary_monthtoY.command']);
    this.listeners['km_list_summary_monthtoM.command'] = this.onSummaryPeriodChanged.bind(this);
    $$('km_list_summary_monthtoM').addEventListener("command",
                                                 this.listeners['km_list_summary_monthtoM.command']);

};
Kmoney.prototype.removeEventListeners = function () {
    $$('kmc-openDb').removeEventListener("command", this.listeners['kmc-openDb.command']);

    $$('kmc-newDb').removeEventListener("command", this.listeners['kmc-newDb.command']);

    $$('kmc-import').removeEventListener("command", this.listeners['kmc-import.command']);
    
    $$('km_tabs').removeEventListener("select", this.listeners['km_tabs.select']);

    $$('km_button_add').removeEventListener("command", this.listeners['km_button_add.command']);

    $$('km_button_update').removeEventListener("command", this.listeners['km_button_update.command']);

    $$('km_button_delete').removeEventListener("command", this.listeners['km_button_delete.command']);

    $$('km_button_reset').removeEventListener("command", this.listeners['km_button_reset.command']);

    $$('km_tree_all').removeEventListener("select", this.listeners['km_tree_all.select']);

    $$('kmc-delete').removeEventListener("command", this.listeners['kmc-delete']);

    $$('kmc-undo').removeEventListener("command", this.listeners['kmc-undo']);

    $$('km_menu_data_duplicate').removeEventListener("command", this.listeners['km_menu_data_duplicate']);
    
    $$('km_list_query_condition1').removeEventListener(
        "command", this.listeners['km_list_query_condition1.command']);

    $$('km_list_query_condition2').removeEventListener(
        "command", this.listeners['km_list_query_condition2.command']);

    $$('km_list_query_andor').removeEventListener(
        "command", this.listeners['km_list_query_andor.command']);

    $$('km_list_query_operator1').removeEventListener(
        "command", this.listeners['km_list_query_operator1.command']);

    $$('km_list_query_operator2').removeEventListener(
        "command", this.listeners['km_list_query_operator2.command']);
        
    $$('km_date_qcond_value1').removeEventListener(
        "change", this.listeners['km_date_qcond_value1.change']);

    $$('km_date_qcond_value2').removeEventListener(
        "change", this.listeners['km_date_qcond_value2.change']);

    $$('km_textbox_qcond_value1').removeEventListener(
        "change", this.listeners['km_textbox_qcond_value1.change']);

    $$('km_textbox_qcond_value2').removeEventListener(
        "change", this.listeners['km_textbox_qcond_value2.change']);
    
    $$('km_list_qcond_value1').removeEventListener(
        "command", this.listeners['km_list_qcond_value1.command']);

    $$('km_list_qcond_value2').removeEventListener(
        "command", this.listeners['km_list_qcond_value2.command']);

    $$('km_list_user').removeEventListener("select", this.listeners['km_list_user.select']);

    $$('kmc-setmaster').removeEventListener("command", this.listeners['kmc-setmaster.command']);

    $$('kmc-setprefs').removeEventListener("command", this.listeners['kmc-setprefs.command']);
    
    $$('kmc-setuser').removeEventListener("command", this.listeners['kmc-setuser.command']);

    $$('kmc-importconf').removeEventListener("command", this.listeners['kmc-importconf.command']);

    $$('kmc-update-item').removeEventListener("command", this.listeners['kmc-update-item']);
    
    $$('kmc-update-detail').removeEventListener("command", this.listeners['kmc-update-detail']);

    $$('kmc-update-user').removeEventListener("command", this.listeners['kmc-update-user']);

    $$('kmc-update-bank').removeEventListener("command", this.listeners['kmc-update-bank']);

    $$('kmc-update-creditcard').removeEventListener("command", this.listeners['kmc-update-creditcard']);

    $$('kmc-update-emoney').removeEventListener("command", this.listeners['kmc-update-emoney']);
    
    $$('kmc-asset').removeEventListener("command", this.listeners['kmc-asset']);

    $$('km_tree_all').remoteEventListener("dblclick", this.listeners['km_tree_all.dblclick']);

    $$('km_list_summary_user').remoteEventListener("command",
                                              this.listeners['km_list_summary_user.command']);
    $$('km_list_summary_monthfromY').removeEventListener("command",
                                                 this.listeners['km_list_summary_monthfromY.command']);
    $$('km_list_summary_monthfromM').removeEventListener("command",
                                                 this.listeners['km_list_summary_monthfromM.command']);
    $$('km_list_summary_monthtoY').removeEventListener("command",
                                                 this.listeners['km_list_summary_monthtoY.command']);
    $$('km_list_summary_monthtoM').removeEventListener("command",
                                                 this.listeners['km_list_summary_monthtoM.command']);
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
Kmoney.prototype.openSetUser = function () {
    window.openDialog("chrome://kmoney/content/SwitchUserDialog.xul", "SwitchUserDialog",
        "chrome, resizable, centerscreen, modal, dialog", this.users, this.currentUser);

    for (var i = 0; $$('km_list_summary_user').itemCount; i++) {
        var item = $$('km_list_summary_user').getItemAtIndex(i);
        if (item.value == this.currentUser['user']) {
            $$('km_list_summary_user').selectedIndex = i;
            break;
        }
    }
    this.onSummaryUserSelect();
    
    for (var i = 0; $$('km_list_user').itemCount; i++) {
        var item = $$('km_list_user').getItemAtIndex(i);
        if (item.value == this.currentUser['user']) {
            $$('km_list_user').selectedIndex = i;
            break;
        }
    }
    this.onUserSelect();
};
Kmoney.prototype.openSetPrefs = function () {
    var features = "chrome,titlebar,toolbar,centerscreen,modal";
    openDialog(KmGlobals.chromes.preferences, 'preferences', features);
};

Kmoney.prototype.openEditTab = function () {
    function getCallback(trnsType, id) {
        if (trnsType === "realmoney") {
            $$('km_tabbox').selectedTab = $$('km_tab_cash');
            this.cashTrns.openEdit(id);
        } else if (trnsType === "bank") {
            $$('km_tabbox').selectedTab = $$('km_tab_bank');
            this.bankTrns.openEdit(id);
        } else if (trnsType === "creditcard") {
            $$('km_tabbox').selectedTab = $$('km_tab_creditcard');
            this.creditcardTrns.openEdit(id);
        } else if (trnsType === "emoney") {
            $$('km_tabbox').selectedTab = $$('km_tab_emoney');
            this.emoneyTrns.openEdit(id);
        }
        
    }
    this.allView.getTransactionInfo(getCallback.bind(this));
    
};
Kmoney.prototype.openAssetTab = function() {
    var currentTab;
    var tabId = $$('km_tabbox').selectedTab.id;
    if (tabId === 'km_tab_cash') {
        currentTab = this.cashTrns;
        $$('km_read_transactiontype').value = 1;
    } else if (tabId === 'km_tab_bank') {
        currentTab = this.bankTrns;
        $$('km_read_transactiontype').value = 2;
    } else {
        return;
    }

    var income = parseFloat(currentTab.mTree.getSelectedRowValue('income'));
    var expense = parseFloat(currentTab.mTree.getSelectedRowValue('expense')); 
    if (income > 0) {
        $$('km_read_amount').value = income * -1;
    } else if (expense > 0) {
        $$('km_read_amount').value = expense;
    }
    
    $$('km_read_user').value = currentTab.mTree.getSelectedRowValue('user_name');
    $$('km_read_userid').value = currentTab.mTree.getSelectedRowValue('user_id');
    $$('km_textbox_assetname').value = currentTab.mTree.getSelectedRowValue('detail');
    $$('km_read_transactionid').value = currentTab.mTree.getSelectedRowValue('id');
    
    $$('km_tabbox').selectedTab = $$('km_tab_asset');
};

Kmoney.prototype.changeUIElements = function(tabId) {
    $$('kmc-update-bank').setAttribute("disabled", true);
    $$('kmc-update-creditcard').setAttribute("disabled", true);
    $$('kmc-update-emoney').setAttribute("disabled", true);
    $$('km_menu_update').setAttribute("disabled", false);
    $$('kmc-delete').setAttribute("disabled", false);
    $$('kmc-asset').setAttribute("disabled", true);

    if (tabId === 'km_tab_bank') {
        hideElements(['km_box_creditcard', 'km_box_emoney',
                      'km_box_summary_qcond', 'km_box_asset']);
        showElements(['km_box_bank', 'km_box_edit1', 'km_box_edit2',
                      'km_radgroup_income-expense',
                      'km_box_edit_buttons', 'km_box_qcond1', 'km_box_qcond2']);
        $$('km_menu_data_duplicate').disabled = false;
        $$('kmc-update-bank').setAttribute("disabled", false);
        $$('kmc-asset').setAttribute("disabled", false);
        
        this.initQueryCondition(tabId);
    } else if (tabId === 'km_tab_creditcard') {
        hideElements(['km_box_bank', 'km_box_emoney',
                      'km_box_summary_qcond',
                      'km_radgroup_income-expense',
                      'km_box_asset']);
        showElements(['km_box_creditcard', 'km_box_edit1', 'km_box_edit2',
                      'km_box_edit_buttons', 'km_box_qcond1',
                      'km_box_qcond2']);
        $$('kmc-update-creditcard').setAttribute("disabled", false);
        $$('km_menu_data_duplicate').disabled = false;
        this.initQueryCondition(tabId);
    } else if (tabId === 'km_tab_emoney') {
        hideElements(['km_box_bank', 'km_box_creditcard',
                      'km_box_summary_qcond', 'km_box_asset']);
        showElements(['km_box_emoney', 'km_box_edit1', 'km_box_edit2',
                      'km_box_edit_buttons',
                      'km_box_qcond1', 'km_box_qcond2',
                      'km_radgroup_income-expense']);
        $$('km_menu_data_duplicate').disabled = false;
        $$('kmc-update-emoney').setAttribute("disabled", false);
        this.initQueryCondition(tabId);
    } else if (tabId === 'km_tab_cash') {
        hideElements(['km_box_bank', 'km_box_creditcard', 'km_box_emoney',
                      'km_box_summary_qcond',
                      'km_box_asset']);
        showElements(['km_box_edit1', 'km_box_edit2', 'km_box_edit_buttons',
                      'km_box_qcond1', 'km_box_qcond2',
                      'km_radgroup_income-expense']);
        $$('km_menu_data_duplicate').disabled = false;
        $$('kmc-asset').setAttribute("disabled", false);
        this.initQueryCondition(tabId);
    } else if (tabId === 'km_tab_all') {
        hideElements(['km_box_bank', 'km_box_creditcard', 'km_box_emoney',
                      'km_box_edit1', 'km_box_edit2',
                      'km_box_asset', 'km_box_edit_buttons',
                      'km_box_summary_qcond']);
        showElements(['km_box_qcond1', 'km_box_qcond2']);
        $$('km_menu_data_duplicate').disabled = true;
        this.initQueryCondition(tabId);
    } else if (tabId === 'km_tab_summary') {
        hideElements(['km_box_summary_bank', 'km_box_edit1',
                      'km_box_edit2', 'km_box_asset',
                      'km_box_qcond1', 'km_box_qcond2', 'km_box_edit_buttons']);
        showElements(['km_box_summary_item', 'km_box_summary_qcond',
                      'km_radgroup_viewmode']);
        $$('km_menu_data_duplicate').disabled = true;
    } else if (tabId === 'km_tab_balance') {
        hideElements(['km_box_summary_item',
                      'km_box_edit1', 'km_box_edit2', 'km_box_asset',
                      'km_box_qcond1', 'km_box_qcond2', 'km_box_edit_buttons',
                      'km_radgroup_viewmode']);
        showElements(['km_box_summary_bank',
                      'km_box_summary_condition_period',
                      'km_box_summary_qcond']);
        $$('km_menu_data_duplicate').disabled = true;
    } else if (tabId === 'km_tab_asset') {
        hideElements(['km_box_bank', 'km_box_creditcard', 'km_box_emoney',
                      'km_box_edit1', 'km_box_edit2',
                      'km_box_summary_qcond', 'km_box_qcond1', 'km_box_qcond2']);
        showElements(['km_box_edit_buttons', 'km_box_asset']);
        $$('km_menu_data_duplicate').disabled = true;
    } else {
        $$('km_menu_update').setAttribute("disabled", true);
        $$('kmc-delete').setAttribute("disabled", true);
    }

};


Kmoney.prototype.loadTable = function (tabId) {
    switch (tabId) {
    case 'km_tab_cash':
    case 'km_tab_bank':
    case 'km_tab_creditcard':
    case 'km_tab_emoney':
        this.query();
        break;
    case 'km_tab_all':
        this.allView.load();
        break;
    case 'km_tab_summary':
        this.populateSummaryPeriodList();
        this.populateSummaryUserList(tabId);
        this.summary.load();
        break;
    case 'km_tab_balance':
        this.populateSummaryPeriodList();
        this.populateSummaryUserList(tabId);
        this.balance.load();
        break;
    case 'km_tab_asset':
        this.asset.load();
        break;
    }

};
Kmoney.prototype.setDefaultQueryCondition = function (qcond1, qcondAndor, qcond2) {
    if (qcond1 === -1) {
        qcond1 = 1;
    }
    if (qcondAndor === -1) {
        qcondAndor = 0;
    }
    if (qcond2 === -1) {
        qcond2 = 0;
    }
    $$('km_list_query_condition1').selectedIndex = qcond1;
    $$('km_list_query_andor').selectedIndex = qcondAndor;
    $$('km_list_query_condition2').selectedIndex = qcond2;
    this.onQueryCondition1Select(false);
    this.onQueryCondition2Select(false);
};
Kmoney.prototype.query = function () {
    var tree = this.getCurrentTabObj();
    if (typeof tree.load != 'function') {
        return;
    }
    if ($$('km_menu_data_duplicate').hasAttribute('checked')) {
        $$('km_box_qcond1').hidden = true;
        $$('km_box_qcond2').hidden = true;
        $$('km_button_add').disabled = true;
        tree.loadDuplicate();
    } else {
        $$('km_box_qcond1').hidden = false;
        $$('km_box_qcond2').hidden = false;
        $$('km_button_add').disabled = false;
        tree.load();
    }
};
Kmoney.prototype.onTabSelected = function (e) {
    $$('km_status_sum').label = "";
    var tabId = $$('km_tabbox').selectedTab.id
    this.changeUIElements(tabId);
    this.loadTable(tabId);
};

Kmoney.prototype.getImportModule = function (importType) {
    var importerList = [
        CashImport,
        BankImport,
        CreditCardImport,
        EMoneyImport,
        ViewCard,
        SaisonCard,
        UCCard,
        MizuhoBank,
        ShinseiBank,
        Suica,
        KantanKakeibo
    ];
    var importer;
    for (var i = 0; i < importerList.length; i++) {
        importer = new (importerList[i])(this.mDb);
        if (importer["type"] === importType) {
            return importer;
        }
    }
    return null;
};
Kmoney.prototype.importFile = function () {
    var importTypeList = [];
    
    function loadCallback(records) {
        function importCallback() {
            this.query();
            
        }
        for (var i = 0; i < records.length; i++) {
            importTypeList[records[i][1]] = {
                "label": records[i][1],
                "ext": "*." + records[i][2]
            }
        }
        var retVals = { file: null, importtype: null, name: null, user: null };
        
        window.openDialog("chrome://kmoney/content/import/ImportDialog.xul", "ImportDialog",
            "chrome, resizable, centerscreen, modal, dialog",
            this.mDb, importTypeList, this.users, retVals);
        
        if (retVals['name'] === null) {
            return;
        }
        var importer = this.getImportModule(retVals["importtype"]);
        if (importer === null) {
            km_debug("No import module");
            return;
        }
        importer.importDb(retVals['name'], retVals['file'], retVals["user"],
                          importCallback.bind(this));
    }
   
    // インポート種別のリストを作る
    this.mDb.source.load(loadCallback.bind(this));

};
Kmoney.prototype.newDatabase = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("newdatabase.title"), nsIFilePicker.modeSave);
    fp.defaultString = km_getLStr("extName") + "." + this.maFileExt[0];

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        this.mDb.newDatabase(fp.file);
        this.loadData();
    }
};
Kmoney.prototype.openDatabase = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("db.select"), nsIFilePicker.modeOpen);
    
    var sExt = "";
    for (var iCnt = 0; iCnt < this.maFileExt.length; iCnt++) {
        sExt += "*." + this.maFileExt[iCnt] + ";";
    }
    fp.appendFilter(km_getLStr("db.dbFiles") + " (" + sExt + ")", sExt);
    fp.appendFilters(nsIFilePicker.filterAll);

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        this.mDb.openDatabase(fp.file);
        this.loadData();
    }
};

Kmoney.prototype.populateItemList = function () {
    var itemList = this.mDb.itemInfo.mItemList;
    $$('km_list_item').removeAllItems();
    $$('km_list_summary_item').removeAllItems();
    $$('km_list_summary_item').appendItem(km_getLStr('query_condition.none'), 0);
    for (var i = 0; i < itemList.length; i++) {
        $$('km_list_item').appendItem(itemList[i][1], itemList[i][0]);
        $$('km_list_summary_item').appendItem(itemList[i][1], itemList[i][0]);
        this.itemMap[itemList[i][1]] = itemList[i][0];
    }
    $$('km_list_item').selectedIndex = 0;
    $$('km_list_summary_item').selectedIndex = 0;

};
Kmoney.prototype.populateSummaryUserList = function (tabId) {
    $$('km_list_summary_user').removeAllItems();
    if (tabId === "km_tab_summary") {
        $$('km_list_summary_user').appendItem(km_getLStr('query_condition.none'), 0);
    }
    var userList = this.mDb.userInfo.mUserList;
    var idx = 0;
    for (var i = 0; i < userList.length; i++) {
        $$('km_list_summary_user').appendItem(userList[i][1], userList[i][0]);
        if (userList[i][0] == this.currentUser['user']) {
            idx = i;
        }
    }

    $$('km_list_summary_user').selectedIndex = idx;
};
Kmoney.prototype.populateUserList = function () {
    var userList = this.mDb.userInfo.mUserList;
    $$('km_list_user').removeAllItems();
    var idx = 0;
    for (var i = 0; i < userList.length; i++) {
        $$('km_list_user').appendItem(userList[i][1], userList[i][0]);
        this.users[userList[i][1]] = userList[i][0];
        if (userList[i][0] == this.currentUser['user']) {
            idx = i;
        }
    }
    $$('km_list_user').selectedIndex = idx;
};

Kmoney.prototype.populateInternalList = function () {
    $$('km_list_internal').removeAllItems();
    $$('km_list_internal').appendItem(km_getLStr("internal.none"), 0);
    $$('km_list_internal').appendItem(km_getLStr("internal.self"), 1);
    $$('km_list_internal').appendItem(km_getLStr("internal.family"), 2);
    $$('km_list_internal').selectedIndex = 0;
};
Kmoney.prototype.populateSummaryPeriodList = function () {
    // レコードが存在する最も古い年から今年までをリストに入れる

    function getCallback(oldestYear) {
        var thisYear = (new Date()).getFullYear();
        if (isNaN(oldestYear)) {
            // レコード0件の場合は今年
            oldestYear = thisYear;
        }
        // デフォルトは前月までの12ヶ月間
        var monthToDefault = new Date();
        monthToDefault.setMonth(monthToDefault.getMonth() - 1);
        var monthFromDefault = new Date(monthToDefault.getFullYear(),
                                        monthToDefault.getMonth() - 11,
                                        1);
        var idx;
    
        $$('km_list_summary_monthfromY').removeAllItems();
        $$('km_list_summary_monthtoY').removeAllItems();
    
        $$('km_list_summary_monthfromY').appendItem("-", 0);
        $$('km_list_summary_monthtoY').appendItem("-", 0);
        var defaultValue = oldestYear;
        for (var year = oldestYear; year <= thisYear; year++) {
            $$('km_list_summary_monthfromY').appendItem(year, year);
            $$('km_list_summary_monthtoY').appendItem(year, year);
            if (year === monthFromDefault.getFullYear()) {
                defaultValue = year;
            }
        }
        $$('km_list_summary_monthfromY').value = defaultValue;
        $$('km_list_summary_monthtoY').value = monthToDefault.getFullYear();
        
        $$('km_list_summary_monthfromM').removeAllItems();
        $$('km_list_summary_monthfromM').appendItem("-", 0);
        $$('km_list_summary_monthtoM').removeAllItems();
        $$('km_list_summary_monthtoM').appendItem("-", 0);
        for (var i = 0; i < 12; i++) {
            var monthValue = zeroFill(i + 1, 2);
            $$('km_list_summary_monthfromM').appendItem(i + 1, monthValue);
            $$('km_list_summary_monthtoM').appendItem(i + 1, monthValue);
        }
        $$('km_list_summary_monthfromM').value = zeroFill(monthFromDefault.getMonth() + 1);
        $$('km_list_summary_monthtoM').value = zeroFill(monthToDefault.getMonth() + 1);
        
    }
    this.mDb.transactions.getOldestYear(getCallback.bind(this));

};

Kmoney.prototype.reset = function () {
    $$('km_date_transdate').value = convDateToYYYYMMDD(new Date(), "-");
    $$('km_textbox_detail').value = "";
    $$('km_textbox_amount').value = "";
};
Kmoney.prototype.updateSelectedRow = function(type) {
    var tree = this.getCurrentTabObj();
    if (typeof tree.updateRecord != 'function') {
        return;
    }
    var idList = tree.mTree.getSelectedRowValueList('id');
    if (idList.length === 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
        return;
    }
    
    var list = [];
    var elem = null;
    if (type === "item") {
        elem = $$('km_list_item');
    } else if (type === "detail") {
    } else if (type === "user") {
        elem = $$('km_list_user');
    } else if (type === "bank") {
        elem = $$('km_list_bank');
    } else if (type === "creditcard") {
        elem = $$('km_list_creditcard');
    } else if (type === "emoney") {
        elem = $$('km_list_emoney');
    }
    if (elem !== null) {
        var itemCount = elem.itemCount;
        for (var i = 0; i < itemCount; i++) {
            list.push(elem.getItemAtIndex(i));
        }
    }
    var retVals = {"newValue": null};
    window.openDialog("chrome://kmoney/content/transaction/UpdateDialog.xul", "UpdateDialog",
        "chrome, resizable, centerscreen, modal, dialog", type, list, retVals);
    if (retVals["newValue"] === null) {
        return;
    }
    if (km_prefsBranch.getBoolPref("confirm.update")) {
        var bOk = km_confirm(km_getLStr("confirm.title"), km_getLStr("confirm.updateRow"));
        if (!bOk) {
            return;
        }
    }
    var params = {};
    if (type === "item") {
        params["itemId"] = retVals["newValue"];
    } else if (type === "detail") {
        params["detail"] = retVals["newValue"];
    } else if (type === "user") {
        params["userId"] = retVals["newValue"];
    } else if (type === "bank") {
        params["bankId"] = retVals["newValue"];
    } else if (type === "creditcard") {
        params["cardId"] = retVals["newValue"];
    } else if (type === "emoney") {
        params["moneyId"] = retVals["newValue"];
    }
    tree.updateRecord(idList, params);    
};

Kmoney.prototype.getTransactionTab = function () {
    var tab = null;
    switch ($$('km_tabbox').selectedTab.id) {
    case 'km_tab_cash':
        tab = this.cashTrns;
        break;
    case 'km_tab_bank':
        tab = this.bankTrns;
        break;
    case 'km_tab_creditcard':
        tab = this.creditcardTrns;
        break;
    case 'km_tab_emoney':
        tab = this.emoneyTrns;
        break;
    }
    return tab;
};
Kmoney.prototype.addRecord = function () {
    var tree = this.getTransactionTab();
    
    if (tree !== null) {
        var amount = $$('km_textbox_amount').value;
        if (!isNumber(amount)) {
            km_alert(km_getLStr("error.title"), km_getLStr("error.amount.invalid"));
            return;
        }
    
        var params = {
            "transactionDate": $$('km_date_transdate').value,
            "itemId": $$('km_list_item').value,
            "detail": $$('km_textbox_detail').value,
            "income": 0,
            "expense": 0,
            "amount": amount,
            "userId": $$('km_list_user').value,
            "source": SOURCE_KMONEY
        };
    
        tree.addRecord(params);
    } else if ($$('km_tabbox').selectedTab.id === 'km_tab_asset') {
        this.asset.addRecord();
    }
    
};
Kmoney.prototype.updateRecord = function () {
    var tree = this.getTransactionTab();
    if (tree !== null) {
        var idList = tree.mTree.getSelectedRowValueList('id');
        if (idList.length === 0) {
            km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
            return;
        } else if (idList.length > 1) {
            km_alert(km_getLStr("error.title"), km_getLStr("error.update.multipleSelected"));
            return;
        }
    
        var amount = $$('km_textbox_amount').value;
        if (!isNumber(amount)) {
            km_alert(km_getLStr("error.title"), km_getLStr("error.amount.invalid"));
            return;
        }
        if (km_prefsBranch.getBoolPref("confirm.update")) {
            var bOk = km_confirm(km_getLStr("confirm.title"), km_getLStr("confirm.updateRow"));
            if (!bOk) {
                return;
            }
        }
    
        var params = {
            "transactionDate": $$('km_date_transdate').value,
            "itemId": $$('km_list_item').value,
            "detail": $$('km_textbox_detail').value,
            "income": 0,
            "expense": 0,
            "amount": amount,
            "userId": $$('km_list_user').value,
            "source": SOURCE_KMONEY
        };
        tree.updateRecord(idList, params);
    } else if ($$('km_tabbox').selectedTab.id === 'km_tab_asset') {
        this.asset.updateRecord();
        
    }
    

};
Kmoney.prototype.deleteRecord = function () {
    var tree = this.getTransactionTab();
    if (tree !== null) {
        var selectedCnt = tree.mTree.getSelectedRowCount();
        if (selectedCnt === 0) {
            km_alert(km_getLStr("error.title"), km_getLStr("error.delete.notSelected"));
            return;
        }
        if (km_prefsBranch.getBoolPref("confirm.update")) {
            var bOk = km_confirm(km_getLStr("confirm.title"), km_getLStr("confirm.deleteRow"));
            if (!bOk) {
                return;
            }
        }
        var idList = tree.mTree.getSelectedRowValueList('id');
        tree.deleteRecord(idList);
    } else if ($$('km_tabbox').selectedTab.id === 'km_tab_asset') {
        this.asset.deleteRecord();
        
    }

};

Kmoney.prototype.undo = function() {
    // この時点で開いていないタブでundoが行われたらどうする？
    this.mDb.undo();
    this.query();
    $$('kmc-undo').setAttribute("disabled", true);
};

Kmoney.prototype.onUserSelect = function () {
    switch ($$('km_tabbox').selectedTab.id) {
    case 'km_tab_cash':
        this.cashTrns.onUserSelect();
        break;
    case 'km_tab_bank':
        this.bankTrns.onUserSelect();
        break;
    case 'km_tab_creditcard':
        this.creditcardTrns.onUserSelect();
        break;
    case 'km_tab_emoney':
        this.emoneyTrns.onUserSelect();
        break;
    }
};
Kmoney.prototype.onSummaryUserSelect = function () {
    var tabId = $$('km_tabbox').selectedTab.id;
    if (tabId === 'km_tab_summary') {
        this.summary.onConditionChanged();
        
    } else if (tabId === 'km_tab_balance') {
        this.balance.onUserSelect();
        
    }
};
Kmoney.prototype.onSummaryPeriodChanged = function() {
    var tabId = $$('km_tabbox').selectedTab.id;
    if (tabId === 'km_tab_summary') {
        this.summary.onConditionChanged();
        
    } else if (tabId === 'km_tab_balance') {
        this.balance.onGraphItemChanged();
        
    }
    
}

Kmoney.prototype.initQueryCondition = function (tabId) {
    var qcond1 = $$('km_list_query_condition1').selectedIndex;
    var qcondChanged1 = false;
    this.populateQueryCondition('km_list_query_condition1');
    if (qcond1 === -1 || qcond1 > $$('km_list_query_condition1').itemCount - 1) {
        $$('km_list_query_condition1').selectedIndex = 1;
        qcondChanged1 = true;
    } else {
        $$('km_list_query_condition1').selectedIndex = qcond1;
    }

    var qcondAndOr = $$('km_list_query_andor').selectedIndex;
    if (qcondAndOr === -1) {
        $$('km_list_query_andor').selectedIndex = 0;
    }
    var qcond2 = $$('km_list_query_condition2').selectedIndex;
    var qcondChanged2 = false;
    this.populateQueryCondition('km_list_query_condition2');
    if (qcond2 === -1 || qcond2 > $$('km_list_query_condition2').itemCount - 1) {
        $$('km_list_query_condition2').selectedIndex = 0;
        qcondChanged2 = true;
    } else {
        $$('km_list_query_condition2').selectedIndex = qcond2;
    }
    
    if (tabId === 'km_tab_bank') {
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.bank"), "bank");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.bank"), "bank");
    } else if (tabId === 'km_tab_creditcard') {
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
    } else if (tabId === 'km_tab_emoney') {
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.emoney"),
                                                  "emoney");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.emoney"),
                                                  "emoney");
    } else if (tabId === 'km_tab_all') {
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.bank"), "bank");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.bank"), "bank");
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.creditcard"),
                                                  "creditcard");
        $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.emoney"),
                                                  "emoney");
        $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.emoney"),
                                                  "emoney");
    }
    if (qcondChanged1) {
        this.onQueryCondition1Select(false);
    }
    if (qcondChanged2) {
        this.onQueryCondition2Select(false);
    }
};

Kmoney.prototype.populateQueryCondition = function (elementId) {
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
        $$('km_date_qcond_value' + elementNo).hidden = true;
        $$('km_textbox_qcond_value' + elementNo).hidden = true;
        $$('km_list_qcond_value' + elementNo).hidden = true;
        $$('km_list_query_operator' + elementNo).hidden = true;

        $$('km_list_query_operator' + elementNo).removeAllItems();
    } else if (key === "date") {
        $$('km_date_qcond_value' + elementNo).hidden = false;
        $$('km_textbox_qcond_value' + elementNo).hidden = true;
        $$('km_list_qcond_value' + elementNo).hidden = true;
        
        $$('km_list_query_operator' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).removeAllItems();
        $$('km_list_query_operator' + elementNo).appendItem(km_getLStr("query_operator.ge"), ">=");
        $$('km_list_query_operator' + elementNo).appendItem(km_getLStr("query_operator.le"), "<=");

        $$('km_list_query_operator' + elementNo).selectedIndex = 0;
        var now = new Date();
        now.setMonth(now.getMonth() - 2);
        now.setDate(1);
        $$('km_date_qcond_value' + elementNo).value = convDateToYYYYMMDD(now, "-");
    } else if (key === "item") {
        $$('km_date_qcond_value' + elementNo).hidden = true;
        $$('km_textbox_qcond_value' + elementNo).hidden = true;
        $$('km_list_qcond_value' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_list_qcond_value' + elementNo).removeAllItems();
        for (mapKey in this.itemMap) {
            $$('km_list_qcond_value' + elementNo).appendItem(mapKey, this.itemMap[mapKey]);
        }
        $$('km_list_qcond_value' + elementNo).selectedIndex = 0;
    } else if (key === "detail") {
        $$('km_date_qcond_value' + elementNo).hidden = true;
        $$('km_textbox_qcond_value' + elementNo).hidden = false;
        $$('km_list_qcond_value' + elementNo).hidden = true;

        $$('km_list_query_operator' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).removeAllItems();
        $$('km_list_query_operator' + elementNo).appendItem(
            km_getLStr("query_operator.contains"), "like");
        $$('km_list_query_operator' + elementNo).appendItem(
            km_getLStr("query_operator.equals"), "=");
        $$('km_list_query_operator' + elementNo).selectedIndex = 0;
        
        $$('km_textbox_qcond_value' + elementNo).value = "";
    } else if (key === "user") {
        $$('km_date_qcond_value' + elementNo).hidden = true;
        $$('km_textbox_qcond_value' + elementNo).hidden = true;
        $$('km_list_qcond_value' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_list_qcond_value' + elementNo).removeAllItems();
        for (mapKey in this.users) {
            $$('km_list_qcond_value' + elementNo).appendItem(mapKey, this.users[mapKey]);
        }
        $$('km_list_qcond_value' + elementNo).selectedIndex = 0;
    } else if (key === "bank") {
        $$('km_date_qcond_value' + elementNo).hidden = true;
        $$('km_textbox_qcond_value' + elementNo).hidden = true;
        $$('km_list_qcond_value' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_list_qcond_value' + elementNo).removeAllItems();
        var bankMap = this.mDb.bankInfo.getBankMap();
        Object.keys(bankMap).forEach(function(key){
            $$('km_list_qcond_value' + elementNo).appendItem(key, key);
        });
        $$('km_list_qcond_value' + elementNo).selectedIndex = 0;
    } else if (key === "creditcard") {
        $$('km_date_qcond_value' + elementNo).hidden = true;
        $$('km_textbox_qcond_value' + elementNo).hidden = true;
        $$('km_list_qcond_value' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_list_qcond_value' + elementNo).removeAllItems();
        var cardMap = this.mDb.creditCardInfo.getCardMap();
        Object.keys(cardMap).forEach(function(key){
            $$('km_list_qcond_value' + elementNo).appendItem(key, key);
        });
        $$('km_list_qcond_value' + elementNo).selectedIndex = 0;
    } else if (key === "emoney") {
        $$('km_date_qcond_value' + elementNo).hidden = true;
        $$('km_textbox_qcond_value' + elementNo).hidden = true;
        $$('km_list_qcond_value' + elementNo).hidden = false;
        $$('km_list_query_operator' + elementNo).hidden = true;
        
        $$('km_list_qcond_value' + elementNo).removeAllItems();
        var emoneyMap = this.mDb.emoneyInfo.getMoneyMap();
        Object.keys(emoneyMap).forEach(function(key){
            $$('km_list_qcond_value' + elementNo).appendItem(key, key);
        });
        $$('km_list_qcond_value' + elementNo).selectedIndex = 0;
    }
};

Kmoney.prototype.onQueryCondition1Select = function(execQuery) {
    this.onQueryConditionSelect('1');    

    if ($$('km_list_query_condition1').value === "none") {
        $$('km_list_query_condition2').disabled = true;
    } else {
        $$('km_list_query_condition2').disabled = false;
    }
    if (execQuery === true) {
        this.query();
    }

};

Kmoney.prototype.onQueryCondition2Select = function(execQuery) {
    this.onQueryConditionSelect('2');    
    if (execQuery === true) {
        this.query();
    }
};

Kmoney.prototype.onQueryConditionChanged = function() {
    this.query();
};
Kmoney.prototype.getCurrentTabObj = function () {
    var tab = null;
    switch ($$('km_tabbox').selectedTab.id) {
    case 'km_tab_cash':
        tab = this.cashTrns;
        break;
    case 'km_tab_bank':
        tab = this.bankTrns;
        break;
    case 'km_tab_creditcard':
        tab = this.creditcardTrns;
        break;
    case 'km_tab_emoney':
        tab = this.emoneyTrns;
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
    case 'km_tab_asset':
        tab = this.asset;
        break;
    }
    return tab;
};
