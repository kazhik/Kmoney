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

MasterData.prototype.initialize = function(db) {
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
};
MasterData.prototype.addRecord = function () {
    var tab = this.getSelectedTab();
    if (typeof tab.addRecord === 'function') {
        tab.addRecord();
    }
};
MasterData.prototype.updateRecord = function () {
    var tab = this.getSelectedTab();
    if (typeof tab.updateRecord === 'function') {
        tab.updateRecord();
    }
};
MasterData.prototype.deleteRecord = function () {
    var tab = this.getSelectedTab();
    if (typeof tab.deleteRecord === 'function') {
        tab.deleteRecord();
    }
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
MasterData.prototype.loadUserList = function () {
    $$('km_edit_user').removeAllItems();

    this.mDb.selectQuery("select id, name from km_user");
    var records = this.mDb.getRecords();

    for (var i = 0; i < records.length; i++) {
        $$('km_edit_user').appendItem(records[i][1], records[i][0]);
    }

    $$('km_edit_user').selectedIndex = 0;

};
MasterData.prototype.loadCardList = function() {
    
    this.mDb.selectQuery("select rowid, name from km_creditcard_info");
    var cardList = this.mDb.getRecords();

    $$("km_edit_creditcard").removeAllItems();

    for (var i = 0; i < cardList.length; i++) {
      $$("km_edit_creditcard").appendItem(cardList[i][1], cardList[i][0]);
    }
    $$("km_edit_creditcard").selectedIndex = 0;
    
};
MasterData.prototype.loadEMoneyList = function() {
    this.mDb.selectQuery("select rowid, name from km_emoney_info");
    var moneyList = this.mDb.getRecords();

    $$("km_edit_emoney").removeAllItems();

    for (var i = 0; i < moneyList.length; i++) {
      $$("km_edit_emoney").appendItem(moneyList[i][1], moneyList[i][0]);
    }
    $$("km_edit_emoney").selectedIndex = 0;
};
MasterData.prototype.loadBankList = function() {
    this.mDb.selectQuery("select rowid, name from km_bank_info");
    var bankList = this.mDb.getRecords();

    $$("km_edit_bank").removeAllItems();

    for (var i = 0; i < bankList.length; i++) {
      $$("km_edit_bank").appendItem(bankList[i][1], bankList[i][0]);
    }
    $$("km_edit_bank").selectedIndex = 0;
};
MasterData.prototype.onTabSelected = function (e) {
    switch ($$('km_master_tabbox').selectedTab.id) {
    case 'km_tab_master_user':
        $$('km_edit_label_name').value = km_getLStr("master.username")
        $$('km_edit_internal').hidden = true;
        $$('userbox').hidden = true;
        $$('creditcardbox').hidden = true;
        $$('bankbox').hidden = true;
        break;
    case 'km_tab_master_item':
        $$('km_edit_label_name').value = km_getLStr("master.itemname")
        $$('km_edit_internal').hidden = false;
        $$('userbox').hidden = true;
        $$('creditcardbox').hidden = true;
        $$('bankbox').hidden = true;
        break;
    case 'km_tab_master_bank':
        $$('km_edit_label_name').value = km_getLStr("master.bankname")
        $$('km_edit_internal').hidden = true;
        $$('userbox').hidden = false;
        $$('km_edit_label_user').value = km_getLStr("master.username")
        $$('creditcardbox').hidden = true;
        $$('bankbox').hidden = true;
        this.loadUserList();
        break;
    case 'km_tab_master_creditcard':
        $$('km_edit_label_name').value = km_getLStr("master.cardname")
        $$('km_edit_internal').hidden = true;
        $$('userbox').hidden = false;
        $$('km_edit_label_user').value = km_getLStr("master.username")
        $$('creditcardbox').hidden = true;
        $$('bankbox').hidden = false;
        this.loadUserList();
        this.loadBankList();
        break;
    case 'km_tab_master_emoney':
        $$('km_edit_label_name').value = km_getLStr("master.emoneyname")
        $$('km_edit_internal').hidden = true;
        $$('userbox').hidden = false;
        $$('km_edit_label_user').value = km_getLStr("master.username")
        $$('creditcardbox').hidden = false;
        $$('bankbox').hidden = true;
        this.loadUserList();
        this.loadCardList();
        break;
    }
};
