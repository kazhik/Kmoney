"use strict";

UserMaster.prototype = new TreeDataTable("km_tree_master_user");
UserMaster.constructor = UserMaster;
UserMaster.superclass = TreeDataTable.prototype;

function UserMaster() {
  this.mDb = null;
  this.mUserList = null;
};
UserMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  UserMaster.superclass.init.call(this, this.load.bind(this));
  
  this.load();
};
UserMaster.prototype.load = function() {
  this.mDb.selectQuery("select id, name from km_user");
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mUserList = this.mDb.getRecords();

  this.PopulateTableData(records, columns, types);
  this.ShowTable(true);
  
};

