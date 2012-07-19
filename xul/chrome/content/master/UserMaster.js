"use strict";

function UserMaster() {
  this.mDb = null;
  this.mUserList = null;
  this.mTree = new TreeViewController("km_tree_master_user");
};
UserMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  this.mTree.init(this, this.load.bind(this));
  
  this.load();
};
UserMaster.prototype.load = function() {
  this.mDb.selectQuery("select id, name from km_user");
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mUserList = this.mDb.getRecords();

  this.mTree.PopulateTableData(records, columns, types);
  this.mTree.ShowTable(true);
  
};

