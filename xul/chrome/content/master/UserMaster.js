"use strict";

function UserMaster() {
  this.mDb = null;
  this.mUserList = null;
  this.mTree = new TreeViewController("km_tree_master_user");
  this.listeners = [];
};
UserMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  this.mTree.init(this, this.load.bind(this));

  this.listeners['km_tree_master_user.select'] = this.onSelect.bind(this);
  $$('km_tree_master_user').addEventListener("select",
    this.listeners['km_tree_master_user.select']);
  
  this.load();
};
UserMaster.prototype.load = function() {
  this.mDb.selectQuery("select id, name from km_user");
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mUserList = this.mDb.getRecords();

  this.mTree.populateTableData(records, columns, types);
  this.mTree.showTable(true);
  
};
UserMaster.prototype.addRecord = function() {
  var name = $$('km_edit_name').value;
  var sql = ["insert into km_user ("
    + "name "
    + ") values ( "
    + "'" + name + "') "];
  this.mDb.executeTransaction(sql);
  this.load();
  
}
UserMaster.prototype.updateRecord = function() {
  var name = $$('km_edit_name').value;
  
  var rowid = this.mTree.getColumnValue(0);
  var sql = ["update km_user "
    + "set "
    + "name = '" + name + "' "
    + "where id = " + rowid];
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(0, rowid);
};

UserMaster.prototype.deleteRecord = function() {
  var rowid = this.mTree.getColumnValue(0);
  if (rowid === "") {
    return;
  }
  var sql = ["delete from km_user where id = " + rowid];
  this.mDb.executeTransaction(sql);
  
  this.load();
};

UserMaster.prototype.onSelect = function() {
  $$('km_edit_name').value = this.mTree.getColumnValue(1);
 
};
