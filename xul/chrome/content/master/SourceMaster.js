"use strict";

function SourceMaster() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_master_importtype");
    this.listeners = [];
};
SourceMaster.prototype.initialize = function(db) {
    this.mDb = db;
    
    this.mTree.init(this, this.load.bind(this));

    this.listeners['km_tree_master_importtype.select'] = this.onSelect.bind(this);
    $$('km_tree_master_importtype').addEventListener("select",
      this.listeners['km_tree_master_importtype.select']);
    
    this.load();
};
SourceMaster.prototype.terminate = function() {
    $$('km_tree_master_importtype').removeEventListener("select",
      this.listeners['km_tree_master_importtype.select']);
};
SourceMaster.prototype.load = function() {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    this.mDb.source.loadMaster(loadCallback.bind(this));
  
};

SourceMaster.prototype.onSelect = function() {
    $$('km_textbox_name').value = this.mTree.getSelectedRowValue('source_name');
    if (this.mTree.getSelectedRowValue('enabled') === '1') {
        $$('km_master_enabled').checked = true;
    } else {
        $$('km_master_enabled').checked = false;
    }
};
SourceMaster.prototype.updateRecord = function() {
    function onCompleted() {
        this.load();
        this.mTree.ensureRowIsVisible('source_id', id);
    }
    var params = {
        "enabled": ($$('km_master_enabled').checked === true)? 1: 0
    };
    var id = this.mTree.getSelectedRowValue('source_id');
    this.mDb.source.update(id, params, onCompleted.bind(this));
  
};

SourceMaster.prototype.moveUp = function() {
    this.mTree.moveUp();
};

SourceMaster.prototype.moveDown = function() {
    this.mTree.moveDown();
};