CreditCardTable.prototype = new TreeDataTable("km_tree_creditcard");
CreditCardTable.constructor = CreditCardTable;
CreditCardTable.superclass = TreeDataTable.prototype;

function CreditCardTable() {
  this.mDb = null;
  
};
CreditCardTable.prototype.initialize = function(db) {
  this.mDb = db;
  CreditCardTable.superclass.init.call(this);
};
CreditCardTable.prototype.load = function() {
  var sql = "select "
    + "A.transaction_date as " + km_getLStr("column.transaction_date") + ", "
    + "A.item_id, "
    + "B.name as " + km_getLStr("column.item_name") + ", "
    + "A.detail as " + km_getLStr("column.detail") + ", "
    + "A.expense as " + km_getLStr("column.expense") + ", "
    + "A.card_id, "
    + "D.name as " + km_getLStr("column.card_name") + ", "
    + "A.user_id, "
    + "C.name as " + km_getLStr("column.user_name") + " "
    + "from km_creditcard_trns A "
    + "inner join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "inner join km_creditcard_info D "
    + " on A.card_id = D.rowid "
    + "order by A.transaction_date";
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();
  this.createColumns(columns, 0, []);
  CreditCardTable.superclass.hideColumns.call(this, 'km_cols_creditcard', ['item_id', 'user_id', 'card_id']);
  this.PopulateCardList();
  this.PopulateTableData(records, columns, types);
  this.ShowTable(true);
  
};
CreditCardTable.prototype.onSelect = function() {
  $$('transactionDate').value = this.getColumnValue(0);
  $$('item').value = this.getColumnValue(1);
  $$('detail').value = this.getColumnValue(3);
  $$('amount').value = this.getColumnValue(4);
  $$('income_expense').selectedItem = $$('expense');
  $$('creditcard').value = this.getColumnValue(5);
  $$('user').value = this.getColumnValue(7);
}
CreditCardTable.prototype.PopulateCardList = function() {
    $$("creditcard").removeAllItems();
    
    this.mDb.selectQuery("select rowid, name from km_creditcard_info");
    var records = this.mDb.getRecords();
    
    for (var i = 0; i < records.length; i++) {
      $$("creditcard").appendItem(records[i][1], records[i][0]);
    }
    
    $$("creditcard").selectedIndex = 0;
    
  };

CreditCardTable.prototype.addRecord = function() {
  var sql = ["insert into km_creditcard_trns ("
    + "transaction_date, "
    + "expense, "
    + "item_id, "
    + "detail, "
    + "user_id, "
    + "card_id, "
    + "last_update_date, "
    + "source "
    + ") values ( "
    + "'" + $$('transactionDate').value + "', "
    + $$('amount').value + ", "
    + $$('item').value + ", "
    + "'" + $$('detail').value + "', "
    + $$('user').value + ", "
    + $$('creditcard').value + ", "
    + "datetime('now'), "
    + "1)"];
  this.mDb.executeTransaction(sql);
};

