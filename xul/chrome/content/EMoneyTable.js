EMoneyTable.prototype = new TreeDataTable("km_tree_emoney");
EMoneyTable.constructor = EMoneyTable;
EMoneyTable.superclass = TreeDataTable.prototype;

function EMoneyTable() {
  this.mDb = null;
  
};
EMoneyTable.prototype.initialize = function(db) {
  this.mDb = db;
  EMoneyTable.superclass.init.call(this);
};
EMoneyTable.prototype.load = function() {
  var sql = "select "
    + "A.transaction_date as " + km_getLStr("column.transaction_date") + ", "
    + "A.item_id, "
    + "B.name as " + km_getLStr("column.item_name") + ", "
    + "A.detail as " + km_getLStr("column.detail") + ", "
    + "A.income as " + km_getLStr("column.income") + ", "
    + "A.expense as " + km_getLStr("column.expense") + ", "
    + "A.money_id, "
    + "D.name as " + km_getLStr("column.card_name") + ", "
    + "A.user_id, "
    + "C.name as " + km_getLStr("column.user_name") + ", "
    + "A.source, "
    + "A.internal as " + km_getLStr("column.internal") + " "
    + "from km_emoney_trns A "
    + "inner join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "inner join km_emoney_info D "
    + " on A.money_id = D.rowid "
    + "order by A.transaction_date";
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();
  this.createColumns(columns, 0, []);
  EMoneyTable.superclass.hideColumns.call(this, 'km_cols_emoney',
    ['item_id', 'user_id', 'money_id', 'source']);
  this.PopulateEMoneyList();
  this.PopulateTableData(records, columns, types);
  this.ShowTable(true);
  
};
EMoneyTable.prototype.onSelect = function() {
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
  $$('emoney').value = this.getColumnValue(6);
  $$('user').value = this.getColumnValue(8);
}
EMoneyTable.prototype.PopulateEMoneyList = function() {
    $$("emoney").removeAllItems();
    
    this.mDb.selectQuery("select rowid, name from km_emoney_info");
    var records = this.mDb.getRecords();
    
    for (var i = 0; i < records.length; i++) {
      $$("emoney").appendItem(records[i][1], records[i][0]);
    }
    
    $$("emoney").selectedIndex = 0;
    
  };

EMoneyTable.prototype.addRecord = function() {
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
  var sql = ["insert into km_emoney_trns ("
    + "transaction_date, "
    + "income, "
    + "expense, "
    + "item_id, "
    + "detail, "
    + "user_id, "
    + "money_id, "
    + "last_update_date, "
    + "internal, "
    + "source "
    + ") values ( "
    + "'" + $$('transactionDate').value + "', "
    + incomeValue + ", "
    + expenseValue + ", "
    + $$('item').value + ", "
    + "'" + $$('detail').value + "', "
    + $$('user').value + ", "
    + $$('emoney').value + ", "
    + "datetime('now'), "
    + "0, "
    + "1)"];
  this.mDb.executeTransaction(sql);
};

