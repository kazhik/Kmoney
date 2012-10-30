"use strict";

function BankMaster() {
  this.mDb = null;
  this.mTree = new TreeViewController("km_tree_master_bank");
  this.listeners = [];
};
BankMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  this.mTree.init(this, this.load.bind(this));

  this.listeners['km_tree_master_bank.command'] = this.onSelect.bind(this);
  $$('km_tree_master_bank').addEventListener("command",
    this.listeners['km_tree_master_bank.command']);

  this.load();
};
BankMaster.prototype.terminate = function() {
  $$('km_tree_master_bank').removeEventListener("command",
    this.listeners['km_tree_master_bank.command']);
};

BankMaster.prototype.load = function() {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    km_debug("BankMaster.load");
    this.mDb.bankInfo.loadMaster(loadCallback.bind(this));
  
};
BankMaster.prototype.addRecord = function() {
    function onCompleted() {
        this.load();
    }
    var params = {
        "name": $$('km_edit_name').value,
        "userId": $$('km_edit_user').value
    };
    
    this.mDb.bankInfo.insert(params, onCompleted.bind(this));
}
BankMaster.prototype.updateRecord = function() {
    function onCompleted() {
        this.load();
        this.mTree.ensureRowIsVisible("master_bank_id", id);
    }
    var id = this.mTree.getSelectedRowValue("master_bank_id");
    var params = {
        "name": $$('km_edit_name').value,
        "userId": $$('km_edit_user').value
    };
    
    this.mDb.bankInfo.update(id, params, onCompleted.bind(this));
};

BankMaster.prototype.deleteRecord = function() {
    function onCompleted() {
        this.load();
    }
    var id = this.mTree.getSelectedRowValue("master_bank_id");
    this.mDb.bankInfo.delete(id, onCompleted.bind(this));

};

BankMaster.prototype.onSelect = function() {
    $$('km_edit_name').value = this.mTree.getSelectedRowValue("master_bank_name");
    $$('km_edit_user').value = this.mTree.getSelectedRowValue("master_bank_userid");
 
};



