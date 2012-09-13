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
EMoneyMaster.prototype.load = function() {
  this.mDb.selectQuery("select A.rowid, A.name, A.user_id, B.name, A.creditcard_id, C.name "
                       + "from km_emoney_info A "
                       + "inner join km_user B "
                       + "on A.user_id = B.id "
                       + "inner join km_creditcard_info C "
                       + "on A.creditcard_id = C.rowid");
  
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mTree.populateTableData(records, columns, types);
  this.mTree.showTable(true);
  
};
EMoneyMaster.prototype.addRecord = function() {
  var name = $$('km_edit_name').value;
  var userId = $$('km_edit_user').value;
  var cardId = $$('km_edit_creditcard').value;
  
  var sql = ["insert into km_emoney_info ("
    + "name, "
    + "user_id, "
    + "creditcard_id "
    + ") values ( "
    + "'" + name + "', "
    + userId + ", "
    + cardId + ")"];
  this.mDb.executeTransaction(sql);
  this.load();
  
}
EMoneyMaster.prototype.updateRecord = function() {
  var name = $$('km_edit_name').value;
  var userId = $$('km_edit_user').value;
  var cardId = $$('km_edit_creditcard').value;
  
  var rowid = this.mTree.getColumnValue(0);
  var sql = ["update km_emoney_info "
    + "set "
    + "name = '" + name + "', "
    + "user_id = " + userId + ", "
    + "creditcard_id = " + cardId + " "
    + "where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(0, rowid);
};

EMoneyMaster.prototype.deleteRecord = function() {
  var rowid = this.mTree.getColumnValue(0);
  if (rowid === "") {
    return;
  }
  var sql = ["delete from km_emoney_info where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  
  this.load();
};

EMoneyMaster.prototype.onSelect = function() {
  $$('km_edit_name').value = this.mTree.getColumnValue(1);
  $$('km_edit_user').value = this.mTree.getColumnValue(2);
  $$('km_edit_creditcard').value = this.mTree.getColumnValue(4);
 
};



