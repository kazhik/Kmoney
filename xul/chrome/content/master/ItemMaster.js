"use strict";

function ItemMaster() {
  this.mDb = null;
  this.mTree = new TreeViewController("km_tree_master_item");
  this.mItemList = null;
};
ItemMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  this.mTree.init(this, this.load.bind(this));
  
  this.load();
};
ItemMaster.prototype.load = function() {
  this.mDb.selectQuery("select rowid, name, internal from km_item");
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mItemList = this.mDb.getRecords();

  this.mTree.PopulateTableData(records, columns, types);
  this.mTree.ShowTable(true);
  
};

