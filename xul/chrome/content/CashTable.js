CashTable.prototype = new TreeDataTable("km_tree_cash");
CashTable.constructor = CashTable;
CashTable.superclass = TreeDataTable.prototype;

function CashTable() {
  this.mDb = null;
  
};
CashTable.prototype.initialize = function(db) {
  this.mDb = db;
  CashTable.superclass.init.call(this);
};
CashTable.prototype.load = function() {
  var sql = "select "
    + "A.transaction_date as " + km_getLStr("column.transaction_date") + ", "
    + "A.item_id, "
    + "B.name as " + km_getLStr("column.item_name") + ", "
    + "A.detail as " + km_getLStr("column.detail") + ", "
    + "A.income as " + km_getLStr("column.income") + ", "
    + "A.expense as " + km_getLStr("column.expense") + ", "
    + "A.user_id, "
    + "C.name as " + km_getLStr("column.user_name") + ", "
    + "A.internal as " + km_getLStr("column.internal") + " "
    + "from km_realmoney_trns A "
    + "inner join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "order by A.transaction_date";
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();
  
  this.createColumns(columns, 0, []);
  CashTable.superclass.hideColumns.call(this, 'km_cols_cash', ['item_id', 'user_id', 'internal']);
  this.PopulateTableData(records, columns, types);
  this.ShowTable(true);
  
};
CashTable.prototype.onSelect = function() {
  $$('transactionDate').value = this.getColumnValue(0);
  $$('item').value = this.getColumnValue(1);
  $$('detail').value = this.getColumnValue(3);
  var amount = this.getColumnValue(4);
  if (Number(amount) == 0) {
    amount = this.getColumnValue(5);
    $$('income_expense').selectedItem = $$('expense');
  } else {
    $$('income_expense').selectedItem = $$('income');
  }
  $$('amount').value = amount;
  $$('user').value = this.getColumnValue(6);
}
CashTable.prototype.addRecord = function() {
  var incomeValue;
  var expenseValue;
  if ($$('income').selected) {
    incomeValue = $$('amount').value;
    expenseValue = 0;
  } else {
    incomeValue = 0;
    expenseValue = $$('amount').value;
  }
  var internalValue;
  if ($$('internal').checked) {
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
    + "'" + $$('transactionDate').value + "', "
    + incomeValue + ", "
    + expenseValue + ", "
    + $$('item').value + ", "
    + "'" + $$('detail').value + "', "
    + $$('user').value + ", "
    + internalValue + ", "
    + "datetime('now'), "
    + "1)"];
  this.mDb.executeTransaction(sql);
};

