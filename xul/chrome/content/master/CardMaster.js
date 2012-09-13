"use strict";

function CardMaster() {
  this.mDb = null;
  this.mTree = new TreeViewController("km_tree_master_creditcard");
  this.listeners = [];
};
CardMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  this.mTree.init(this, this.load.bind(this));

  this.listeners['km_tree_master_creditcard.select'] = this.onSelect.bind(this);
  $$('km_tree_master_creditcard').addEventListener("select",
    this.listeners['km_tree_master_creditcard.select']);

  this.load();
};
CardMaster.prototype.load = function() {
  this.mDb.selectQuery("select A.rowid, A.name, A.user_id, B.name, A.bank_id, C.name "
                       + "from km_creditcard_info A "
                       + "inner join km_user B "
                       + "on A.user_id = B.id "
                       + "inner join km_bank_info C "
                       + "on A.bank_id = C.rowid");
  
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mTree.populateTableData(records, columns, types);
  this.mTree.showTable(true);
  
};
CardMaster.prototype.addRecord = function() {
  var name = $$('km_edit_name').value;
  var userId = $$('km_edit_user').value;
  var bankId = $$('km_edit_bank').value;
  var sql = ["insert into km_creditcard_info ("
    + "name, "
    + "user_id, "
    + "bank_id "
    + ") values ( "
    + "'" + name + "', "
    + userId + ", "
    + bankId + ")"];
  this.mDb.executeTransaction(sql);
  this.load();
  
}
CardMaster.prototype.updateRecord = function() {
  var name = $$('km_edit_name').value;
  var userId = $$('km_edit_user').value;
  
  var rowid = this.mTree.getColumnValue(0);
  var sql = ["update km_creditcard_info "
    + "set "
    + "name = '" + name + "', "
    + "user_id = " + userId + ", "
    + "bank_id = " + bankId + " "
    + "where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(0, rowid);
};

CardMaster.prototype.deleteRecord = function() {
  var rowid = this.mTree.getColumnValue(0);
  if (rowid === "") {
    return;
  }
  var sql = ["delete from km_creditcard_info where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  
  this.load();
};

CardMaster.prototype.onSelect = function() {
  $$('km_edit_name').value = this.mTree.getColumnValue(1);
  $$('km_edit_user').value = this.mTree.getColumnValue(2);
  $$('km_edit_bank').value = this.mTree.getColumnValue(4);
 
};



