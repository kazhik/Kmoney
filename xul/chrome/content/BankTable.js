BankTable.prototype = new TreeDataTable("km_tree_bank");
BankTable.constructor = BankTable;
BankTable.superclass = TreeDataTable.prototype;

function BankTable() {
  this.mDb = null;
  this.mBankList = null;
  this.mLimit = 100;
  this.mOffset = 0;
};
BankTable.prototype.initialize = function(db) {
  this.mDb = db;
  BankTable.superclass.init.call(this, this.load.bind(this));
};
BankTable.prototype.load = function(direction, sortColumn) {
  if (sortColumn === undefined) {
    sortColumn = 'transaction_date';    
  }
  var count = this.mDb.getRowCount('km_bank_trns', '');
  this.setRowCount(count);
  $$('km_total').value = count;
  this.setOffset(direction);
  var sql = "select "
    + "A.transaction_date, "
    + "A.item_id, "
    + "B.name as item_name, "
    + "A.detail, "
    + "A.income, "
    + "A.expense, "
    + "A.bank_id, "
    + "D.name as bank_name, "
    + "A.user_id, "
    + "C.name as user_name, "
    + "A.source, "
    + "A.internal, "
    + "A.rowid "
    + "from km_bank_trns A "
    + "inner join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "inner join km_bank_info D "
    + " on A.bank_id = D.rowid "
    + "order by " + sortColumn + " "
    + "limit " + this.mLimit + " offset " + this.mOffset;
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();
  this.PopulateBankList();
  this.PopulateTableData(records, columns, types);
  this.ensureRowIsVisible(12, -1);
  this.ShowTable(true);
  $$('km_from_value').value = this.getFromValue();
  $$('km_to_value').value = this.getToValue();
  
};
BankTable.prototype.onSelect = function() {
  $$('km_edit_transactionDate').value = this.getColumnValue(0);
  $$('km_edit_item').value = this.getColumnValue(1);
  $$('km_edit_detail').value = this.getColumnValue(3);
  var amount = this.getColumnValue(4);
  if (Number(amount) == 0) {
    amount = this.getColumnValue(5);
    $$('income_expense').selectedItem = $$('km_edit_expense');
  } else {
    $$('income_expense').selectedItem = $$('km_edit_income');
  }
  $$('km_edit_amount').value = amount;
  $$('km_edit_bank').value = this.getColumnValue(6);
  $$('km_edit_user').value = this.getColumnValue(8);
  $$('km_edit_internal').checked = (Number(this.getColumnValue(11)) === 1);

}
BankTable.prototype.PopulateBankList = function() {
    this.mDb.selectQuery("select rowid, name, user_id from km_bank_info");
    this.mBankList = this.mDb.getRecords();

    this.onUserSelect();
};
BankTable.prototype.onUserSelect = function() {
    $$("km_edit_bank").removeAllItems();
    var userId = $$('km_edit_user').value;

    for (var i = 0; i < this.mBankList.length; i++) {
      if (this.mBankList[i][2] == userId) {
        $$("km_edit_bank").appendItem(this.mBankList[i][1], this.mBankList[i][0]);
      }
    }
    $$("km_edit_bank").selectedIndex = 0;
  
};

BankTable.prototype.addRecord = function() {
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
  var sql = ["insert into km_bank_trns ("
    + "transaction_date, "
    + "income, "
    + "expense, "
    + "item_id, "
    + "detail, "
    + "user_id, "
    + "bank_id, "
    + "last_update_date, "
    + "internal, "
    + "source "
    + ") values ( "
    + "\"" + $$('km_edit_transactionDate').value + "\", "
    + incomeValue + ", "
    + expenseValue + ", "
    + $$('km_edit_item').value + ", "
    + "\"" + $$('km_edit_detail').value + "\", "
    + $$('km_edit_user').value + ", "
    + $$('km_edit_bank').value + ", "
    + "datetime('now'), "
    + "0, "
    + "1)"];
  this.mDb.executeTransaction(sql);
  this.load();
};
BankTable.prototype.updateRecord = function() {
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
  var rowid = this.getColumnValue(12);
  var sql = ["update km_bank_trns "
    + "set "
    + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', "
    + "income = " + incomeValue + ", "
    + "expense = " + expenseValue + ", "
    + "item_id = " + $$('km_edit_item').value + ", "
    + "detail = " + "\"" + $$('km_edit_detail').value + "\", "
    + "user_id = " + $$('km_edit_user').value + ", "
    + "bank_id = " + $$('km_edit_bank').value + ", "
    + "last_update_date = datetime('now'), "
    + "internal = " + internalValue + ", "
    + "source = 1 "
    + "where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  this.load();
  this.ensureRowIsVisible(12, rowid);
};

BankTable.prototype.deleteRecord = function() {
  var sql = ["delete from km_bank_trns where rowid = " + this.getColumnValue(12)];
  km_log(sql);
  this.mDb.executeTransaction(sql);
  
  this.load();
};

