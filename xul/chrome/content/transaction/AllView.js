function AllView() {
  this.mDb = null;
  this.mTree = new TreeViewController("km_tree_all");
  this.mPaging = false;
};
AllView.prototype.initialize = function(db) {
  this.mDb = db;
  this.mTree.init(this.load.bind(this));
};
AllView.prototype.load = function(direction, sortColumn) {
  var orderby = "";
  if (sortColumn === undefined) {
    if (this.mTree.mSortOrder != null) {
      orderby = "order by " + this.mTree.mSortOrder;
    } else {
      orderby = "order by date"
    }
  } else if (sortColumn === "") {
    orderby = "";
  } else {
    orderby = "order by " + sortColumn;
    this.mTree.mSortOrder = sortColumn;
  }

  var count = this.mDb.getRowCount('kmv_transactions', '');
  this.mTree.setRowCount(count);
  $$('km_total').value = count;
  if (this.mPaging) {
    this.mTree.setOffset(direction);
  }
  var sql = "select "
    + "A.date, "
    + "A.item, "
    + "A.detail, "
    + "A.income, "
    + "A.expense, "
    + "case "
    + " when A.type = 'realmoney' then '" + km_getLStr("transaction_type.cash") + "'"
    + " when A.type = 'bank' then '" + km_getLStr("transaction_type.bank") + "'"
    + " when A.type = 'creditcard' then '" + km_getLStr("transaction_type.creditcard") + "'"
    + " when A.type = 'emoney' then '" + km_getLStr("transaction_type.emoney") + "'"
    + " end as type, "
    + "A.rowid "
    + "from kmv_transactions A "
    + orderby;
  if (this.mPaging) {
    sql += "limit " + this.mTree.mLimit + " offset " + this.mTree.mOffset;
  }
  this.mDb.selectQuery(sql);
  km_log(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();
  this.mTree.PopulateTableData(records, columns, types);
  this.mTree.ShowTable(true);
  if (this.mPaging) {
    $$('km_from_value').value = this.mTree.getFromValue();
    $$('km_to_value').value = this.mTree.getToValue();
  }  
};

