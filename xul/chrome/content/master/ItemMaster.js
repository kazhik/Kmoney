ItemMaster.prototype = new TreeDataTable("km_tree_master_item");
ItemMaster.constructor = ItemMaster;
ItemMaster.superclass = TreeDataTable.prototype;

function ItemMaster() {
  this.mDb = null;
  this.mItemList = null;
};
ItemMaster.prototype.initialize = function(db) {
  this.mDb = db;
  
  ItemMaster.superclass.init.call(this, this.load.bind(this));
};
ItemMaster.prototype.load = function() {
  this.mDb.selectQuery("select rowid, name from km_item");
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mItemList = this.mDb.getRecords();

  this.PopulateTableData(records, columns, types);
  this.ShowTable(true);
  
};

