"use strict";

CardMaster.prototype = new TreeDataTable("km_tree_master_creditcard");
CardMaster.constructor = CardMaster;
CardMaster.superclass = TreeDataTable.prototype;

function CardMaster() {
  this.mDb = null;
};
CardMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  CardMaster.superclass.init.call(this, this.load.bind(this));
  
  this.load();
};
CardMaster.prototype.load = function() {
  this.mDb.selectQuery("select A.rowid, A.name, A.user_id, B.name "
                       + "from km_creditcard_info A, km_user B "
                       + "where A.user_id = B.id");
  
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.PopulateTableData(records, columns, types);
  this.ShowTable(true);
  
};

