"use strict";
Components.utils.import("chrome://kmoney/content/common/sqlite.js");
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
    this.maFileExt = [];
    this.listeners = [];
    this.summary = null;
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
    this.mDb = new SQLiteHandler();
    this.maFileExt = [];
    this.cashTree = new CashTable();
    this.creditcardTree = new CreditCardTable();
    this.emoneyTree = new EMoneyTable();
    this.bankTree = new BankTable();
    this.summary = new SummaryView();
    this.allView = new AllView();
    
    this.addEventListeners();

    var bOpenLastDb = true;
    if (bOpenLastDb) {
        this.openLastDb();
    }
    this.populateItemList();
    this.populateUserList();
    this.populateInternalList();
    
    this.cashTree.initialize(this.mDb);
    this.creditcardTree.initialize(this.mDb);
    this.emoneyTree.initialize(this.mDb);
    this.bankTree.initialize(this.mDb);
    this.summary.initialize(this.mDb);
    this.allView.initialize(this.mDb);

    this.initImport();
    
    this.initQueryCondition();

    this.loadTable($$('km_tabbox').selectedTab.id);
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
    this.importers["uc"] = new UCCard(this.mDb, this.creditcardTree);
    this.importers["shinsei"] = new ShinseiBank(this.mDb, this.bankTree);
    this.importers["mizuho"] = new MizuhoBank(this.mDb, this.bankTree);
    this.importers["suica"] = new Suica(this.mDb, this.emoneyTree);
    this.importers["kantan"] = new KantanKakeibo(this.mDb, this.cashTree);
};

Kmoney.prototype.Shutdown = function () {
    this.summary.terminate();
    this.removeEventListeners();
    this.closeDatabase(false);
};
Kmoney.prototype.initQueryCondition = function () {
    $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.none"), "none");
    $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.date"), "date");
    $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.item"), "item");
    $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.detail"), "detail");
    $$('km_list_query_condition1').appendItem(km_getLStr("query_condition.user"), "user");

    $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.none"), "none");
    $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.date"), "date");
    $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.item"), "item");
    $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.detail"), "detail");
    $$('km_list_query_condition2').appendItem(km_getLStr("query_condition.user"), "user");

    $$('km_list_query_condition1').selectedIndex = 1;
    $$('km_list_query_andor').selectedIndex = 0;
    $$('km_list_query_condition2').selectedIndex = 0;
    this.onQueryCondition1Select();
    this.onQueryCondition2Select();
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

    this.listeners['km_list_query_condition1.select'] = this.onQueryCondition1Select.bind(this);
    $$('km_list_query_condition1').addEventListener(
        "select", this.listeners['km_list_query_condition1.select']);

    this.listeners['km_list_query_condition2.select'] = this.onQueryCondition2Select.bind(this);
    $$('km_list_query_condition2').addEventListener(
        "select", this.listeners['km_list_query_condition2.select']);
    
    this.listeners['km_edit_user.select'] = this.onUserSelect.bind(this);
    $$('km_edit_user').addEventListener("select", this.listeners['km_edit_user.select']);

    this.listeners['kmc-setmaster.command'] = this.openSetMaster.bind(this);
    $$('kmc-setmaster').addEventListener("command", this.listeners['kmc-setmaster.command']);

    this.listeners['kmc-setprefs.command'] = this.openSetPrefs.bind(this);
    $$('kmc-setprefs').addEventListener("command", this.listeners['kmc-setprefs.command']);

    this.listeners['kmc-importconf.command'] = this.openImportConf.bind(this);
    $$('kmc-importconf').addEventListener("command", this.listeners['kmc-importconf.command']);

    this.listeners['km_button_query.command'] = this.query.bind(this);
    $$('km_button_query').addEventListener("command", this.listeners['km_button_query.command']);

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
    var key;
    var value;
    var operator;
    var queryParams = {
        "cond1": {},
        "andor": $$('km_list_query_andor').value,
        "cond2": {}
    };
    
    key = $$('km_list_query_condition1').value;
    if (key === "date") {
        value = $$('km_edit_query_date1').value;
        operator = $$('km_list_query_operator1').value;
    } else if (key === "item") {
        value = $$('km_edit_query_list1').value;
        operator = "=";
    } else if (key === "detail") {
        value = $$('km_edit_query_text1').value;
        operator = "=";
    } else if (key === "user") {
        value = $$('km_edit_query_list1').value;
        operator = "=";
    } else if (key === "none") {
        value = "";
    }

    queryParams['cond1']['key'] = key;
    queryParams['cond1']['operator'] = operator;
    queryParams['cond1']['value'] = value;
    
    queryParams['andor'] = $$('km_list_query_andor').value;
    
    key = $$('km_list_query_condition2').value;
    if (key === "date") {
        value = $$('km_edit_query_date2').value;
        operator = $$('km_list_query_operator2').value;
    } else if (key === "item") {
        value = $$('km_edit_query_list2').value;
        operator = "=";
    } else if (key === "detail") {
        value = $$('km_edit_query_text2').value;
        operator = "=";
    } else if (key === "user") {
        value = $$('km_edit_query_list2').value;
        operator = "=";
    } else if (key === "none") {
        value = "";
    }
    queryParams['cond2']['key'] = key;
    queryParams['cond2']['operator'] = operator;
    queryParams['cond2']['value'] = value;

    switch (tabId) {
    case 'km_tab_cash':
        this.cashTree.query(queryParams);
        $$('bankbox').hidden = true;
        $$('creditcardbox').hidden = true;
        $$('emoneybox').hidden = true;
        $$('km_edit1').hidden = false;
        $$('km_edit2').hidden = false;
        $$('km_edit_buttons').hidden = false;
        $$('km_summary_viewchanger').hidden = true;
        $$('km_simple_query').hidden = false;
        break;
    case 'km_tab_bank':
        this.bankTree.query(queryParams);
        $$('bankbox').hidden = false;
        $$('creditcardbox').hidden = true;
        $$('emoneybox').hidden = true;
        $$('km_edit1').hidden = false;
        $$('km_edit2').hidden = false;
        $$('km_edit_buttons').hidden = false;
        $$('km_summary_viewchanger').hidden = true;
        $$('km_simple_query').hidden = false;
        break;
    case 'km_tab_creditcard':
        this.creditcardTree.query(queryParams);
        $$('bankbox').hidden = true;
        $$('creditcardbox').hidden = false;
        $$('emoneybox').hidden = true;
        $$('km_edit1').hidden = false;
        $$('km_edit2').hidden = false;
        $$('km_edit_buttons').hidden = false;
        $$('km_summary_viewchanger').hidden = true;
        $$('km_simple_query').hidden = false;
        break;
    case 'km_tab_emoney':
        this.emoneyTree.query(queryParams);
        $$('bankbox').hidden = true;
        $$('creditcardbox').hidden = true;
        $$('emoneybox').hidden = false;
        $$('km_edit1').hidden = false;
        $$('km_edit2').hidden = false;
        $$('km_edit_buttons').hidden = false;
        $$('km_summary_viewchanger').hidden = true;
        $$('km_simple_query').hidden = false;
        break;
    case 'km_tab_all':
        this.allView.query(queryParams);
        $$('bankbox').hidden = true;
        $$('creditcardbox').hidden = true;
        $$('emoneybox').hidden = true;
        $$('km_edit1').hidden = true;
        $$('km_edit2').hidden = true;
        $$('km_edit_buttons').hidden = true;
        $$('km_summary_viewchanger').hidden = true;
        $$('km_simple_query').hidden = false;
        break;
    case 'km_tab_summary':
        this.summary.drawGraph();
        $$('km_edit1').hidden = true;
        $$('km_edit2').hidden = true;
        $$('km_edit_buttons').hidden = true;
        $$('km_summary_viewchanger').hidden = false;
        $$('km_simple_query').hidden = true;
        break;
    }
};
Kmoney.prototype.onTabSelected = function (e) {
    this.loadTable($$('km_tabbox').selectedTab.id);
};
Kmoney.prototype.openDatabaseFile = function (dbFile) {
    if (this.closeDatabase(false)) {
        try {
            this.mDb.openDatabase(dbFile, true);
        } catch (e) {
            Components.utils.reportError('in function openDatabaseFile - ' + e);
            km_message("Connect to '" + dbFile.path + "' failed: " + e, 0x3);
            return false;
        }
        KmGlobals.mru.add(this.mDb.getFile().path);
        return true;
    }
    return false;
};
Kmoney.prototype.importFile = function () {
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
        importer.importDb(retVals['file'], retVals["user"]);
    }
    return true;
};
Kmoney.prototype.newDatabase = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("newdatabase.title"), nsIFilePicker.modeSave);
    fp.defaultString = "Kmoney.sqlite";

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        try {
            this.mDb.openDatabase(fp.file, true);
        } catch (e) {
            Components.utils.reportError('in function newDatabase - ' + e);
            km_message("Connect to '" + fp.file.path + "' failed: " + e, 0x3);
            return false;
        }
        KmGlobals.mru.add(this.mDb.getFile().path);

        var initDatabase = new InitDB();
        initDatabase.execute(this.mDb);
    }
    return true;
};
Kmoney.prototype.closeDatabase = function (bAlert) {
    //nothing to close if no database is already open
    if (!this.mDb.isConnected()) {
        if (bAlert) alert(km_getLStr("noOpenDb"));
        return true;
    }

    //if another file is already open, confirm before closing
    var answer = true;
    if (bAlert) answer = kmPrompt.confirm(null, km_getLStr("extName"), km_getLStr("confirmClose"));

    if (!answer) return false;


    //make the current database as null and
    //call setDatabase to do appropriate things
    this.mDb.closeConnection();
    return true;
};

Kmoney.prototype.openDatabase = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("selectDb"), nsIFilePicker.modeOpen);
    
    this.maFileExt = km_prefsBranch.getCharPref("sqliteFileExtensions").split(",");
    
    var sExt = "";
    for (var iCnt = 0; iCnt < this.maFileExt.length; iCnt++) {
        sExt += "*." + this.maFileExt[iCnt] + ";";
    }
    fp.appendFilter(km_getLStr("sqliteDbFiles") + " (" + sExt + ")", sExt);
    fp.appendFilters(nsIFilePicker.filterAll);

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
//          bConnected = this.mDb.openDatabase(nsiFileObj, bSharedPagerCache);
        this.openDatabaseFile(fp.file);
    }
    return true;

};

Kmoney.prototype.openLastDb = function () {
    // opening with last used DB if preferences set to do so
    var bPrefVal = km_prefsBranch.getBoolPref("openWithLastDb");
    if (!bPrefVal) return;

    var sPath = KmGlobals.mru.getLatest();
    if (sPath == null) return;

    //Last used DB found, open this DB
    var newfile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    try {
        newfile.initWithPath(sPath);
    } catch (e) {
        kmPrompt.alert(null, km_getLStr("extName"), 'Failed to init local file using ' + sPath);
        return;
    }
    //if the last used file is not found, bail out
    if (!newfile.exists()) {
        kmPrompt.alert(null, km_getLStr("extName"), km_getLFStr("lastDbDoesNotExist", [sPath]));
        return;
    }

    bPrefVal = km_prefsBranch.getBoolPref("promptForLastDb");
    if (bPrefVal) {
        var check = {
            value: false
        }; // default the checkbox to false
        var result = kmPrompt.confirmCheck(null, km_getLStr("extName") + " - " + km_getLStr("promptLastDbTitle"), km_getLStr("promptLastDbAsk") + "\n" + sPath + "?", km_getLStr("promptLastDbOpen"), check);

        if (!result) return;
        //update the promptForLastDb preference
        bPrefVal = km_prefsBranch.setBoolPref("promptForLastDb", !check.value);
    }
    //assign the new file (nsIFile) to the current database
    this.openDatabaseFile(newfile);
};

Kmoney.prototype.populateItemList = function () {
    this.mDb.selectQuery("select rowid, name from km_item");
    var records = this.mDb.getRecords();

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

};
Kmoney.prototype.populateUserList = function () {
    $$('km_edit_user').removeAllItems();
    $$('km_summary_user').removeAllItems();

    this.mDb.selectQuery("select id, name from km_user");
    var records = this.mDb.getRecords();

    $$('km_summary_user').appendItem(km_getLStr('query_condition.none'), 0);
    for (var i = 0; i < records.length; i++) {
        $$('km_edit_user').appendItem(records[i][1], records[i][0]);
        $$('km_summary_user').appendItem(records[i][1], records[i][0]);
        this.users[records[i][0]] = records[i][1];
    }

    $$('km_edit_user').selectedIndex = 0;
    $$('km_summary_user').selectedIndex = 0;

};
Kmoney.prototype.populateInternalList = function () {
    $$('km_edit_internal').removeAllItems();
    $$('km_edit_internal').appendItem(km_getLStr("internal.none"), 0);
    $$('km_edit_internal').appendItem(km_getLStr("internal.self"), 1);
    $$('km_edit_internal').appendItem(km_getLStr("internal.family"), 2);
    $$('km_edit_internal').selectedIndex = 0;
};
Kmoney.prototype.reset = function () {
    $$('km_edit_transactionDate').value = convDateToYYYYMMDD(new Date(), "-");
    $$('km_edit_detail').value = "";
    $$('km_edit_amount').value = "";
};
Kmoney.prototype.addRecord = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.addRecord === 'function') {
        tree.addRecord();
    }
};
Kmoney.prototype.updateRecord = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.updateRecord != 'function') {
        return;
    }
    if (tree.mTree.checkSelected() === false) {
      km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
      return;
    }
    tree.updateRecord();
};
Kmoney.prototype.onUserSelect = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.onUserSelect === 'function') {
        tree.onUserSelect();
    }
};
Kmoney.prototype.query = function () {
    this.loadTable($$('km_tabbox').selectedTab.id);
};

Kmoney.prototype.onQueryCondition1Select = function() {
    var key = $$('km_list_query_condition1').value;
    
    var mapKey;
    
    if (key === "none") {
        $$('km_edit_query_date1').hidden = true;
        $$('km_edit_query_text1').hidden = true;
        $$('km_edit_query_list1').hidden = true;
        $$('km_list_query_operator1').hidden = true;

        $$('km_list_query_operator1').removeAllItems();
    } else if (key === "date") {
        $$('km_edit_query_date1').hidden = false;
        $$('km_edit_query_text1').hidden = true;
        $$('km_edit_query_list1').hidden = true;
        
        $$('km_list_query_operator1').hidden = false;
        $$('km_list_query_operator1').removeAllItems();
        $$('km_list_query_operator1').appendItem(km_getLStr("query_operator.ge"), ">=");
        $$('km_list_query_operator1').appendItem(km_getLStr("query_operator.le"), "<=");

        $$('km_list_query_operator1').selectedIndex = 0;
        var now = new Date();
        now.setMonth(now.getMonth() - 2);
        now.setDate(1);
        $$('km_edit_query_date1').value = convDateToYYYYMMDD(now, "-");
    } else if (key === "item") {
        $$('km_edit_query_date1').hidden = true;
        $$('km_edit_query_text1').hidden = true;
        $$('km_edit_query_list1').hidden = false;
        $$('km_list_query_operator1').hidden = true;
        
        $$('km_edit_query_list1').removeAllItems();
        for (mapKey in this.itemMap) {
            $$('km_edit_query_list1').appendItem(mapKey, this.itemMap[mapKey]);
        }
    } else if (key === "detail") {
        $$('km_edit_query_date1').hidden = true;
        $$('km_edit_query_text1').hidden = false;
        $$('km_edit_query_list1').hidden = true;

        $$('km_list_query_operator1').hidden = false;
        $$('km_list_query_operator1').removeAllItems();
        $$('km_list_query_operator1').appendItem(
            km_getLStr("query_operator.equals"), "equals");
        $$('km_list_query_operator1').appendItem(
            km_getLStr("query_operator.contains"), "contains");
        
        $$('km_edit_query_text1').value = "";
    } else if (key === "user") {
        $$('km_edit_query_date1').hidden = true;
        $$('km_edit_query_text1').hidden = true;
        $$('km_edit_query_list1').hidden = false;
        $$('km_list_query_operator1').hidden = true;
        
        $$('km_edit_query_list1').removeAllItems();
        for (mapKey in this.users) {
            $$('km_edit_query_list1').appendItem(this.users[mapKey], mapKey);
        }
    }
    
};

Kmoney.prototype.onQueryCondition2Select = function() {
    var key = $$('km_list_query_condition2').value;
    
    var mapKey;
    
    if (key === "none") {
        $$('km_edit_query_date2').hidden = true;
        $$('km_edit_query_text2').hidden = true;
        $$('km_edit_query_list2').hidden = true;
        $$('km_list_query_operator2').hidden = true;

        $$('km_list_query_operator2').removeAllItems();
    } else if (key === "date") {
        $$('km_edit_query_date2').hidden = false;
        $$('km_edit_query_text2').hidden = true;
        $$('km_edit_query_list2').hidden = true;
        
        $$('km_list_query_operator2').hidden = false;
        $$('km_list_query_operator2').removeAllItems();
        $$('km_list_query_operator2').appendItem(km_getLStr("query_operator.ge"), ">=");
        $$('km_list_query_operator2').appendItem(km_getLStr("query_operator.le"), "<=");

        $$('km_list_query_operator2').selectedIndex = 0;
        var now = new Date();
        now.setDate(2);
        $$('km_edit_query_date2').value = convDateToYYYYMMDD(now, "-");
    } else if (key === "item") {
        $$('km_edit_query_date2').hidden = true;
        $$('km_edit_query_text2').hidden = true;
        $$('km_edit_query_list2').hidden = false;
        $$('km_list_query_operator2').hidden = true;
        
        $$('km_edit_query_list2').removeAllItems();
        for (mapKey in this.itemMap) {
            $$('km_edit_query_list2').appendItem(mapKey, this.itemMap[mapKey]);
        }
    } else if (key === "detail") {
        $$('km_edit_query_date2').hidden = true;
        $$('km_edit_query_text2').hidden = false;
        $$('km_edit_query_list2').hidden = true;

        $$('km_list_query_operator2').hidden = false;
        $$('km_list_query_operator2').removeAllItems();
        $$('km_list_query_operator2').appendItem(
            km_getLStr("query_operator.equals"), "equals");
        $$('km_list_query_operator2').appendItem(
            km_getLStr("query_operator.contains"), "contains");
        
        $$('km_edit_query_text2').value = "";
    } else if (key === "user") {
        $$('km_edit_query_date2').hidden = true;
        $$('km_edit_query_text2').hidden = true;
        $$('km_edit_query_list2').hidden = false;
        $$('km_list_query_operator2').hidden = true;
        
        $$('km_edit_query_list2').removeAllItems();
        for (mapKey in this.users) {
            $$('km_edit_query_list2').appendItem(this.users[mapKey], mapKey);
        }
    }
};

Kmoney.prototype.deleteRecord = function () {
    var tree = this.getSelectedTree();
    if (typeof tree.deleteRecord != 'function') {
        return;
    }
    if (tree.mTree.checkSelected() === false) {
      km_alert(km_getLStr("error.title"), km_getLStr("error.delete.notSelected"));
      return;
    }
    var bConfirm = km_confirm(km_getLStr("confirm.title"), km_getLStr("confirm.deleteRow"));
    if (!bConfirm) {
      return;
    }
    tree.deleteRecord();
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
    case 'km_tab_all':
        tab = this.allView;
        break;
    }
    return tab;
};
//this object handles MRU using one preference 'jsonMruData'
KmGlobals.mru = {
    mbInit: false,
    mSize: 0,
    mList: [],
    mProfilePath: '',

    initialize: function () {
        try {
            this.convert();
        } catch (e) {}

        this.getPref();

        this.mProfilePath = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile).path;
        this.mbInit = true;
    },

    convert: function () {
        //use the two prefs and remove them; so, the following can happen only once.
        var sPref = km_prefsBranch.getComplexValue("mruPath.1", Ci.nsISupportsString).data;
        this.mList = sPref.split(",");
        this.mSize = km_prefsBranch.getIntPref("mruSize");

        km_prefsBranch.clearUserPref("mruPath.1");
        km_prefsBranch.clearUserPref("mruSize");

        this.setPref();
        return true;
    },

    add: function (sPath) {
        if (sPath.indexOf(this.mProfilePath) == 0) sPath = "[ProfD]" + sPath.substring(this.mProfilePath.length);

        var iPos = this.mList.indexOf(sPath);
        if (iPos >= 0) {
            //remove at iPos
            this.mList.splice(iPos, 1);
        }
        //add in the beginning
        this.mList.splice(0, 0, sPath);

        if (this.mList.length > this.mSize) {
            //remove the extra entries
            this.mList.splice(this.mSize, this.mList.length - this.mSize);
        }

        this.setPref();
    },

    remove: function (sPath) {
        if (sPath.indexOf(this.mProfilePath) == 0) sPath = "[ProfD]" + sPath.substring(this.mProfilePath.length);

        var iPos = this.mList.indexOf(sPath);
        if (iPos >= 0) {
            //remove at iPos
            this.mList.splice(iPos, 1);
            this.setPref();
            return true;
        }
        return false;
    },

    getList: function () {
        if (!this.mbInit) this.initialize();

        var aList = [];
        for (var i = 0; i < this.mList.length; i++) {
            aList.push(this.getFullPath(this.mList[i]));
        }
        return aList;
    },

    getLatest: function () {
        if (!this.mbInit) this.initialize();

        if (this.mList.length > 0) return this.getFullPath(this.mList[0]);
        else return null;
    },

    getFullPath: function (sVal) {
        var sRelConst = "[ProfD]";
        if (sVal.indexOf(sRelConst) == 0) sVal = this.mProfilePath + sVal.substring(sRelConst.length);

        return sVal;
    },

    getPref: function () {
        try {
            var sPref = km_prefsBranch.getComplexValue("jsonMruData", Ci.nsISupportsString).data;
        } catch (e) {
            var sPref = km_prefsBranch.getCharPref("jsonMruData");
        }
        var obj = JSON.parse(sPref);
        this.mList = obj.list;
        this.mSize = obj.size;
    },

    setPref: function () {
        try {
            var sPref = km_prefsBranch.getComplexValue("jsonMruData", Ci.nsISupportsString).data;
        } catch (e) {
            var sPref = km_prefsBranch.getCharPref("jsonMruData");
        }
        var obj = JSON.parse(sPref);
        obj.list = this.mList;
        obj.size = this.mSize;
        sPref = JSON.stringify(obj);
        km_setUnicodePref("jsonMruData", sPref);
    }
};