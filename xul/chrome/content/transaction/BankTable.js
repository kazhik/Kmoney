function BankTable() {
  this.mDb = null;
  this.mBankList = null;
  this.mTree = new TreeViewController("km_tree_bank");
};
BankTable.prototype.initialize = function(db) {
  this.mDb = db;
  this.mTree.init(this.load.bind(this));
  this.loadBankList();
};
BankTable.prototype.load = function(direction, sortColumn) {
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

  var count = this.mDb.getRowCount('km_bank_trns', '');
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
    + "A.bank_id, "
    + "D.name as bank_name, "
    + "A.user_id, "
    + "C.name as user_name, "
    + "A.source, "
    + "A.internal, "
    + "A.rowid "
    + "from km_bank_trns A "
    + "left join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "inner join km_bank_info D "
    + " on A.bank_id = D.rowid "
    + orderby + " "
    + "limit " + this.mTree.mLimit + " offset " + this.mTree.mOffset;
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();
  this.mTree.PopulateTableData(records, columns, types);
  this.mTree.ensureRowIsVisible(12, -1);
  this.mTree.ShowTable(true);
  
  this.onUserSelect();    
  
  $$('km_from_value').value = this.mTree.getFromValue();
  $$('km_to_value').value = this.mTree.getToValue();
  
};
BankTable.prototype.onSelect = function() {
//  $$('km_edit_transactionDate').value = this.mTree.getSelectedRowValue('transaction_date');
  $$('km_edit_transactionDate').value = this.mTree.getColumnValue(0);
  $$('km_edit_item').value = this.mTree.getColumnValue(1);
  $$('km_edit_detail').value = this.mTree.getColumnValue(3);
  var amount = this.mTree.getColumnValue(4);
  if (Number(amount) == 0) {
    amount = this.mTree.getColumnValue(5);
    $$('income_expense').selectedItem = $$('km_edit_expense');
  } else {
    $$('income_expense').selectedItem = $$('km_edit_income');
  }
  $$('km_edit_amount').value = amount;
  $$('km_edit_bank').value = this.mTree.getColumnValue(6);
  $$('km_edit_user').value = this.mTree.getColumnValue(8);
  $$('km_edit_internal').checked = (Number(this.mTree.getColumnValue(11)) === 1);

}
BankTable.prototype.loadBankList = function() {
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
    + "datetime('now', 'localtime'), "
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
  var rowid = this.mTree.getColumnValue(12);
  var sql = ["update km_bank_trns "
    + "set "
    + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', "
    + "income = " + incomeValue + ", "
    + "expense = " + expenseValue + ", "
    + "item_id = " + $$('km_edit_item').value + ", "
    + "detail = " + "\"" + $$('km_edit_detail').value + "\", "
    + "user_id = " + $$('km_edit_user').value + ", "
    + "bank_id = " + $$('km_edit_bank').value + ", "
    + "last_update_date = datetime('now', 'localtime'), "
    + "internal = " + internalValue + ", "
    + "source = 1 "
    + "where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(12, rowid);
};

BankTable.prototype.deleteRecord = function() {
  var rowid = this.mTree.getColumnValue(12);
  if (rowid === "") {
    return;
  }
  var sql = ["delete from km_bank_trns where rowid = " + rowid];
  km_log(sql);
  this.mDb.executeTransaction(sql);
  
  this.load();
};

BankTable.prototype.executeInsert = function(newRecordArray) {
  var sqlArray = [];
  var sql;
  for (var i = 0; i < newRecordArray.length; i++) {
    
    var sql = ["insert into km_bank_trns ("
      + "transaction_date, "
      + "item_id, "
      + "detail, "
      + "income, "
      + "expense, "
      + "user_id, "
      + "bank_id, "
      + "internal, "
      + "source, "
      + "last_update_date "
      + ") "
      + "select "
      + "'" + newRecordArray[i]["transactionDate"] + "', "
      + newRecordArray[i]["itemId"] + ", "
      + "\"" + newRecordArray[i]["detail"] + "\", "
      + newRecordArray[i]["income"] + ", "
      + newRecordArray[i]["expense"] + ", "
      + newRecordArray[i]["userId"] + ", "
      + newRecordArray[i]["bankId"] + ", "
      + newRecordArray[i]["internal"] + ", "
      + newRecordArray[i]["source"] + ", "
      + "datetime('now', 'localtime') "
      + "where not exists ("
      + " select 1 from km_bank_trns "
      + " where transaction_date = '" + newRecordArray[i]["transactionDate"] + "'"
      + " and income = " + newRecordArray[i]["income"]
      + " and expense = " + newRecordArray[i]["expense"]
      + " and bank_id = " + newRecordArray[i]["bankId"]
      + " and user_id = " + newRecordArray[i]["userId"]
      + ")"];
    km_log(sql);
    sqlArray.push(sql);

  }
  this.mDb.executeTransaction(sqlArray);
};
BankTable.prototype.getBankId = function(name, userId) {
  for (var i = 0; i < this.mBankList.length; i++) {
    if (this.mBankList[i][1] === name && this.mBankList[i][2] == userId) {
      return this.mBankList[i][0];
    }
  }
  return 0;
  
};

