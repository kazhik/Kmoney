"use strict";

function BankMaster() {
  this.mDb = null;
  this.mTree = new TreeViewController("km_tree_master_bank");
  this.listeners = [];
};
BankMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  this.mTree.init(this, this.load.bind(this));

  this.listeners['km_tree_master_bank.select'] = this.onSelect.bind(this);
  $$('km_tree_master_bank').addEventListener("select",
    this.listeners['km_tree_master_bank.select']);

  this.load();
};
BankMaster.prototype.load = function() {
  this.mDb.selectQuery("select A.rowid, A.name, A.user_id, B.name "
                       + "from km_bank_info A, km_user B "
                       + "where A.user_id = B.id");
  
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mTree.PopulateTableData(records, columns, types);
  this.mTree.ShowTable(true);
  
};
BankMaster.prototype.addRecord = function() {
  var name = $$('km_edit_name').value;
  var userId = $$('km_edit_user').value;
  var sql = ["insert into km_bank_info ("
    + "name, "
    + "user_id "
    + ") values ( "
    + "'" + name + "', "
    + userId + ")"];
  this.mDb.executeTransaction(sql);
  this.load();
  
}
BankMaster.prototype.updateRecord = function() {
  var name = $$('km_edit_name').value;
  var userId = $$('km_edit_user').value;
  
  var rowid = this.mTree.getColumnValue(0);
  var sql = ["update km_bank_info "
    + "set "
    + "name = '" + name + "', "
    + "user_id = " + userId + " "
    + "where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(0, rowid);
};

BankMaster.prototype.deleteRecord = function() {
  var rowid = this.mTree.getColumnValue(0);
  if (rowid === "") {
    return;
  }
  var sql = ["delete from km_bank_info where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  
  this.load();
};

BankMaster.prototype.onSelect = function() {
  $$('km_edit_name').value = this.mTree.getColumnValue(1);
  $$('km_edit_user').value = this.mTree.getColumnValue(2);
 
};


