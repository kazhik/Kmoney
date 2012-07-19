"use strict";

function CardMaster() {
  this.mDb = null;
  this.mTree = new TreeViewController("km_tree_master_creditcard");
};
CardMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  this.mTree.init(this, this.load.bind(this));

  this.load();
};
CardMaster.prototype.load = function() {
  this.mDb.selectQuery("select A.rowid, A.name, A.user_id, B.name "
                       + "from km_creditcard_info A, km_user B "
                       + "where A.user_id = B.id");
  
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mTree.PopulateTableData(records, columns, types);
  this.mTree.ShowTable(true);
  
};

