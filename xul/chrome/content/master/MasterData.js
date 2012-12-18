"use strict";

var masterData;

function MasterData() {
    this.mDb = null;

    this.userMaster = null;
    this.itemMaster = null;
    this.cardMaster = null;
    this.bankMaster = null;
    this.emoneyMaster = null;

    this.listeners = [];

};

function openMasterDataDialog() {
    masterData = new MasterData();
    masterData.initialize(window.arguments[0]);
};

MasterData.prototype.initialize = function (db) {
    km_log("MasterData.initialize start");
    this.mDb = db;

    this.userMaster = new UserMaster();
    this.userMaster.initialize(db);
    this.itemMaster = new ItemMaster();
    this.itemMaster.initialize(db);
    this.cardMaster = new CardMaster();
    this.cardMaster.initialize(db);
    this.bankMaster = new BankMaster();
    this.bankMaster.initialize(db);
    this.emoneyMaster = new EMoneyMaster();
    this.emoneyMaster.initialize(db);

    this.addEventListeners();

    this.onTabSelected();
    km_log("MasterData.initialize end");
};
MasterData.prototype.terminate = function () {
    this.userMaster.terminate();
    this.itemMaster.terminate();
    this.cardMaster.terminate();
    this.bankMaster.terminate();
    this.emoneyMaster.terminate();
};
MasterData.prototype.addRecord = function () {
    var tab = this.getSelectedTab();
    if (typeof tab.addRecord === 'function') {
        tab.addRecord();
    }
};
MasterData.prototype.updateRecord = function () {
    var tab = this.getSelectedTab();
    if (typeof tab.updateRecord != 'function') {
        return;
    }
    if (tab.mTree.checkSelected() === false) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
        return;
    }
    tab.updateRecord();
};
MasterData.prototype.deleteRecord = function () {
    var tab = this.getSelectedTab();
    if (typeof tab.deleteRecord != 'function') {
        return;
    }
    if (tab.mTree.checkSelected() === false) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.delete.notSelected"));
        return;
    }
    tab.deleteRecord();
};
MasterData.prototype.getSelectedTab = function () {
    var tab = null;
    switch ($$('km_master_tabbox').selectedTab.id) {
    case 'km_tab_master_user':
        tab = this.userMaster;
        break;
    case 'km_tab_master_item':
        tab = this.itemMaster;
        break;
    case 'km_tab_master_bank':
        tab = this.bankMaster;
        break;
    case 'km_tab_master_creditcard':
        tab = this.cardMaster;
        break;
    case 'km_tab_master_emoney':
        tab = this.emoneyMaster;
        break;
    }
    return tab;
};
MasterData.prototype.close = function () {
    this.removeEventListeners();
    window.close();
};
MasterData.prototype.addEventListeners = function () {
    this.listeners['km_button_master_add.command'] = this.addRecord.bind(this);
    $$('km_button_master_add').addEventListener("command",
    this.listeners['km_button_master_add.command']);

    this.listeners['km_button_master_update.command'] = this.updateRecord.bind(this);
    $$('km_button_master_update').addEventListener("command",
    this.listeners['km_button_master_update.command']);

    this.listeners['km_button_master_delete.command'] = this.deleteRecord.bind(this);
    $$('km_button_master_delete').addEventListener("command",
    this.listeners['km_button_master_delete.command']);

    this.listeners['km_button_master_close.command'] = this.close.bind(this);
    $$('km_button_master_close').addEventListener("command",
    this.listeners['km_button_master_close.command']);

    this.listeners['km_tabs.select'] = this.onTabSelected.bind(this);
    $$('km_tabs').addEventListener("select", this.listeners['km_tabs.select']);
};

MasterData.prototype.removeEventListeners = function () {
    $$('km_button_master_add').removeEventListener("command",
    this.listeners['km_button_master_add.command']);

    $$('km_button_master_update').removeEventListener("command",
    this.listeners['km_button_master_update.command']);

    $$('km_button_master_delete').removeEventListener("command",
    this.listeners['km_button_master_delete.command']);

    $$('km_button_master_close').removeEventListener("command",
    this.listeners['km_button_master_close.command']);

    $$('km_tabs').removeEventListener("select", this.listeners['km_tabs.select']);
};

MasterData.prototype.loadUserList = function () {
    function loadCallback(records) {
        $$('km_list_user').removeAllItems();
    
        for (var i = 0; i < records.length; i++) {
            $$('km_list_user').appendItem(records[i][1], records[i][0]);
        }
    
        $$('km_list_user').selectedIndex = 0;
    }
    this.mDb.userInfo.load(loadCallback.bind(this));

};
MasterData.prototype.loadCardList = function () {
    function loadCallback(records) {
        $$("km_list_creditcard").removeAllItems();
    
        for (var i = 0; i < records.length; i++) {
            $$("km_list_creditcard").appendItem(records[i][1], records[i][0]);
        }
        $$("km_list_creditcard").selectedIndex = 0;
        
    }
    this.mDb.creditCardInfo.load(loadCallback.bind(this));

};

MasterData.prototype.loadEMoneyList = function () {
    function loadCallback(records) {
        $$("km_list_emoney").removeAllItems();
    
        for (var i = 0; i < records.length; i++) {
            $$("km_list_emoney").appendItem(records[i][1], records[i][0]);
        }
        $$("km_list_emoney").selectedIndex = 0;
    }
    this.mDb.emoneyInfo.load(loadCallback.bind(this));

};
MasterData.prototype.loadBankList = function () {
    function loadCallback(records) {
        $$("km_list_bank").removeAllItems();
    
        for (var i = 0; i < records.length; i++) {
            $$("km_list_bank").appendItem(records[i][1], records[i][0]);
        }
        $$("km_list_bank").selectedIndex = 0;
    }
    this.mDb.bankInfo.load(loadCallback.bind(this));

};
MasterData.prototype.onTabSelected = function (e) {
    switch ($$('km_master_tabbox').selectedTab.id) {
    case 'km_tab_master_user':
        $$('km_label_name').value = km_getLStr("master.username")
        $$('km_box_item').hidden = true;
        $$('km_box_user').hidden = true;
        $$('km_box_creditcard').hidden = true;
        $$('km_box_bank').hidden = true;
        break;
    case 'km_tab_master_item':
        $$('km_label_name').value = km_getLStr("master.itemname")
        $$('km_box_item').hidden = false;
        $$('km_box_user').hidden = true;
        $$('km_box_creditcard').hidden = true;
        $$('km_box_bank').hidden = true;
        break;
    case 'km_tab_master_bank':
        $$('km_label_name').value = km_getLStr("master.bankname")
        $$('km_box_item').hidden = true;
        $$('km_box_user').hidden = false;
        $$('km_box_creditcard').hidden = true;
        $$('km_box_bank').hidden = true;
        this.loadUserList();
        break;
    case 'km_tab_master_creditcard':
        $$('km_label_name').value = km_getLStr("master.cardname")
        $$('km_box_item').hidden = true;
        $$('km_box_user').hidden = false;
        $$('km_box_creditcard').hidden = true;
        $$('km_box_bank').hidden = false;
        this.loadUserList();
        this.loadBankList();
        break;
    case 'km_tab_master_emoney':
        $$('km_label_name').value = km_getLStr("master.emoneyname")
        $$('km_box_item').hidden = true;
        $$('km_box_user').hidden = false;
        $$('km_box_creditcard').hidden = true;
        $$('km_box_bank').hidden = true;
        this.loadUserList();
        break;
    }
};