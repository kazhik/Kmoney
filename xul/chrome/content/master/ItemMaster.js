"use strict";

function ItemMaster() {
  this.mDb = null;
  this.mTree = new TreeViewController("km_tree_master_item");
  this.mItemList = null;
  this.listeners = [];
};
ItemMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  this.mTree.init(this, this.load.bind(this));

  this.listeners['km_tree_master_item.select'] = this.onSelect.bind(this);
  $$('km_tree_master_item').addEventListener("select",
    this.listeners['km_tree_master_item.select']);
  
  this.load();
};
ItemMaster.prototype.load = function() {
  this.mDb.selectQuery("select rowid, name, internal, sum_include from km_item");
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mItemList = this.mDb.getRecords();

  this.mTree.populateTableData(records, columns, types);
  this.mTree.showTable(true);
  
};
ItemMaster.prototype.addRecord = function() {
  var sumInclude = ($$('km_master_sum').checked)? 1: 0;
    
  var sql = ["insert into km_item ("
    + "name, "
    + "internal, "
    + "sum_include "
    + ") values ( "
    + "'" + $$('km_edit_name').value + "', "
    + $$('km_edit_internal').value + ", "
    + sumInclude + ")"];
  this.mDb.executeTransaction(sql);
  this.load();
  
}
ItemMaster.prototype.updateRecord = function() {
  var sumInclude = ($$('km_master_sum').checked)? 1: 0;
 
  var rowid = this.mTree.getColumnValue(0);
  var sql = ["update km_item "
    + "set "
    + "name = '" + $$('km_edit_name').value + "', "
    + "internal = " + $$('km_edit_internal').value + ", "
    + "sum_include = " + sumInclude + " "
    + "where rowid = " + rowid];
  km_log(sql);
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(0, rowid);
};

ItemMaster.prototype.deleteRecord = function() {
  var rowid = this.mTree.getColumnValue(0);
  if (rowid === "") {
    return;
  }
  var sql = ["delete from km_item where rowid = " + rowid];
  km_log(sql);
  this.mDb.executeTransaction(sql);
  
  this.load();
};

ItemMaster.prototype.onSelect = function() {
  $$('km_edit_name').value = this.mTree.getColumnValue(1);
  $$('km_edit_internal').value = this.mTree.getColumnValue(2);
  $$('km_master_sum').checked = (Number(this.mTree.getColumnValue(3)) === 1);
 
};

