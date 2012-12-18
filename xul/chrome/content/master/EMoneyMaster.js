"use strict";

function EMoneyMaster() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_master_emoney");
    this.listeners = [];
};
EMoneyMaster.prototype.initialize = function(db) {
    this.mDb = db;
    
    this.mTree.init(this, this.load.bind(this));
  
    this.listeners['km_tree_master_emoney.select'] = this.onSelect.bind(this);
    $$('km_tree_master_emoney').addEventListener("select",
      this.listeners['km_tree_master_emoney.select']);
  
    this.load();
};
EMoneyMaster.prototype.terminate = function() {
    $$('km_tree_master_emoney').removeEventListener("select",
      this.listeners['km_tree_master_emoney.select']);
};
EMoneyMaster.prototype.load = function() {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    km_debug("EMoneyMaster.load");
    this.mDb.emoneyInfo.loadMaster(loadCallback.bind(this));
  
};
EMoneyMaster.prototype.addRecord = function() {
    function onCompleted(id) {
        this.load();
        this.mTree.ensureRowIsVisible('master_emoney_id', id);
    }
    var params = {
        "name": $$('km_textbox_name').value,
        "userId": $$('km_list_user').value
    };
    
    this.mDb.emoneyInfo.insert(params, onCompleted.bind(this));
  
}
EMoneyMaster.prototype.updateRecord = function() {
    function onCompleted() {
        this.load();
        this.mTree.ensureRowIsVisible('master_emoney_id', id);
    }
    var params = {
        "name": $$('km_textbox_name').value,
        "userId": $$('km_list_user').value
    };
    var id = this.mTree.getSelectedRowValue('master_emoney_id');
    this.mDb.emoneyInfo.update(id, params, onCompleted.bind(this));
  
};

EMoneyMaster.prototype.deleteRecord = function() {
    function onCompleted() {
        this.load();
        this.mTree.ensurePreviousRowIsVisible();
    }
    var id = this.mTree.getSelectedRowValue('master_emoney_id');
    if (id === "") {
      return;
    }
    this.mDb.emoneyInfo.delete(id, onCompleted.bind(this));
  
};

EMoneyMaster.prototype.onSelect = function() {
    $$('km_textbox_name').value = this.mTree.getSelectedRowValue('master_emoney_name');
    $$('km_list_user').value = this.mTree.getSelectedRowValue('master_emoney_userid');
 
};



