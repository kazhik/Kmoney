function CashTable() {
  this.mDb = null;
  this.mTree = new TreeViewController("km_tree_cash");
};

CashTable.prototype.initialize = function(db) {
  this.mDb = db;

  this.mTree.init(this, this.load.bind(this));
};
CashTable.prototype.load = function(direction, sortColumn) {
  var orderby = "";
  if (sortColumn === undefined) {
    if (this.mTree.mSortOrder != null) {
      orderby = "order by " + this.mTree.mSortOrder;
    } else {
      orderby = "order by transaction_date"
    }
  } else if (sortColumn === "") {
    orderby = "";
  } else {
    orderby = "order by " + sortColumn;
    this.mTree.mSortOrder = sortColumn;
  }
  
  var count = this.mDb.getRowCount('km_realmoney_trns', '');
  this.mTree.setRowCount(count);
  $$('km_total').value = count;
  this.mTree.setOffset(direction);
  var sql = "select "
    + "A.transaction_date, "
    + "A.item_id, "
    + "B.name as item_name, "
    + "A.detail, "
    + "A.income, "
    + "A.expense, "
    + "A.user_id, "
    + "C.name as user_name, "
    + "A.internal, "
    + "A.rowid "
    + "from km_realmoney_trns A "
    + "left join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + orderby + " "
    + "limit " + this.mTree.mLimit + " offset " + this.mTree.mOffset;
  km_log(sql);
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();
  
  this.mTree.PopulateTableData(records, columns, types);
  this.mTree.ensureRowIsVisible(9, -1);
  this.mTree.ShowTable(true);
    
  $$('km_from_value').value = this.getFromValue();
  $$('km_to_value').value = this.getToValue();
};
CashTable.prototype.onSelect = function() {
  $$('km_edit_transactionDate').value = this.mTree.getColumnValue(0);
  $$('km_edit_item').value = this.mTree.getColumnValue(1);
  $$('km_edit_detail').value = this.mTree.getColumnValue(3);
  var amount = this.mTree.getColumnValue(4);
  if (Number(amount) === 0) {
    amount = this.mTree.getColumnValue(5);
    $$('income_expense').selectedItem = $$('km_edit_expense');
  } else {
    $$('income_expense').selectedItem = $$('km_edit_income');
  }
  $$('km_edit_amount').value = amount;
  $$('km_edit_user').value = this.mTree.getColumnValue(6);
  $$('km_edit_internal').checked = (Number(this.mTree.getColumnValue(8)) === 1);
};
CashTable.prototype.addRecord = function() {
  var incomeValue;
  var expenseValue;
  if ($$('km_edit_income').selected) {
    incomeValue = $$('km_edit_amount').value;
    expenseValue = 0;
  } else {
    incomeValue = 0;
    expenseValue = $$('km_edit_amount').value;
  }
  var internalValue;
  if ($$('km_edit_internal').checked) {
    internalValue = 1;
  } else {
    internalValue = 0;
  }
  
  var sql = ["insert into km_realmoney_trns ("
    + "transaction_date, "
    + "income, "
    + "expense, "
    + "item_id, "
    + "detail, "
    + "user_id, "
    + "internal, "
    + "last_update_date, "
    + "source "
    + ") values ( "
    + "'" + $$('km_edit_transactionDate').value + "', "
    + incomeValue + ", "
    + expenseValue + ", "
    + $$('km_edit_item').value + ", "
    + "\"" + $$('km_edit_detail').value + "\", "
    + $$('km_edit_user').value + ", "
    + internalValue + ", "
    + "datetime('now'), "
    + "1)"];
  this.mDb.executeTransaction(sql);
  
  this.load();
};
CashTable.prototype.updateRecord = function() {
  var incomeValue;
  var expenseValue;
  if ($$('km_edit_income').selected) {
    incomeValue = $$('km_edit_amount').value;
    expenseValue = 0;
  } else {
    incomeValue = 0;
    expenseValue = $$('km_edit_amount').value;
  }
  var internalValue;
  if ($$('km_edit_internal').checked) {
    internalValue = 1;
  } else {
    internalValue = 0;
  }

  var rowid = this.mTree.getColumnValue(9);
  var sql = ["update km_realmoney_trns "
    + "set "
    + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', "
    + "income = " + incomeValue + ", "
    + "expense = " + expenseValue + ", "
    + "item_id = " + $$('km_edit_item').value + ", "
    + "detail = " + "\"" + $$('km_edit_detail').value + "\", "
    + "user_id = " + $$('km_edit_user').value + ", "
    + "last_update_date = datetime('now'), "
    + "internal = " + internalValue + ", "
    + "source = 1 "
    + "where rowid = " + rowid];
  km_log(sql);
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(9, rowid);
};

CashTable.prototype.deleteRecord = function() {
  var rowid = this.mTree.getColumnValue(9);
  if (rowid === "") {
    return;
  }
  var sql = ["delete from km_realmoney_trns where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  
  this.load();
};


CashTable.prototype.importRecord = function(transactionDate, income, expense, itemName, detail,
  userId, internal, source) {
  
  var sql = ["insert into km_realmoney_trns ("
    + "transaction_date, "
    + "income, "
    + "expense, "
    + "item_id, "
    + "detail, "
    + "user_id, "
    + "internal, "
    + "last_update_date, "
    + "source "
    + ") "
    + "select "
    + "'" + transactionDate + "',"
    + income + ","
    + expense + ","
    + "(select rowid from km_item where name = '" + itemName + "'),"
    + "'" + detail + "',"
    + userId + ","
    + internal + ","
    + "datetime('now'), "
    + source + " "
    + "where not exists ("
    + " select 1 from km_realmoney_trns "
    + " where transaction_date = '" + transactionDate + "'"
    + " and income = " + income
    + " and expense = " + expense
    + " and source = " + source
    + " and user_id = " + userId
    + ")"];
  km_log(sql);
  this.mDb.executeTransaction(sql);
  
};
