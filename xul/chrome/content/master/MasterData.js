"use strict";

var masterData;

function MasterData() {
    
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
}


MasterData.prototype.initialize = function(db) {
    
    this.userMaster = new UserMaster();
    this.userMaster.initialize(db);
    this.itemMaster = new ItemMaster();
    this.itemMaster.initialize(db);
    this.cardMaster = new CardMaster();
    this.cardMaster.initialize(db);
    /*
    this.bankMaster = new BankMaster();
    this.bankMaster.initialize(db);
    this.emoneyMaster = new EMoneyMaster();
    this.emoneyMaster.initialize(db);
    */
    this.addEventListeners();
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
    }
    return tab;
};
MasterData.prototype.close = function () {
    window.close();
}
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

}