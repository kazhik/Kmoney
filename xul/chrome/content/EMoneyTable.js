EMoneyTable.prototype = new TreeDataTable("km_tree_emoney");
EMoneyTable.constructor = EMoneyTable;
EMoneyTable.superclass = TreeDataTable.prototype;

function EMoneyTable() {
  this.mDb = null;
  this.mMoneyList = null;
};
EMoneyTable.prototype.initialize = function(db) {
  this.mDb = db;
  EMoneyTable.superclass.init.call(this, this.load.bind(this));
};
EMoneyTable.prototype.load = function(direction, sortColumn) {
  if (sortColumn === undefined) {
    sortColumn = 'transaction_date';    
  }
  var count = this.mDb.getRowCount('km_emoney_trns', '');
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
    + "A.money_id, "
    + "D.name as money_name, "
    + "A.user_id, "
    + "C.name as user_name, "
    + "A.source, "
    + "A.internal, "
    + "A.rowid "
    + "from km_emoney_trns A "
    + "inner join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "inner join km_emoney_info D "
    + " on A.money_id = D.rowid "
    + "order by " + sortColumn + " "
    + "limit " + this.mLimit + " offset " + this.mOffset;
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.PopulateEMoneyList();
  this.PopulateTableData(records, columns, types);
  this.ensureRowIsVisible(12, -1);
  this.ShowTable(true);
  
  $$('km_from_value').value = this.getFromValue();
  $$('km_to_value').value = this.getToValue();
  
};
EMoneyTable.prototype.onSelect = function() {
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
  $$('km_edit_emoney').value = this.getColumnValue(6);
  $$('km_edit_user').value = this.getColumnValue(8);
  $$('km_edit_internal').checked = (Number(this.getColumnValue(11)) === 1);
};
EMoneyTable.prototype.PopulateEMoneyList = function() {
    this.mDb.selectQuery("select rowid, name, user_id from km_emoney_info");
    this.mMoneyList = this.mDb.getRecords();

    this.onUserSelect();    
    
  };
EMoneyTable.prototype.onUserSelect = function() {
    $$("km_edit_emoney").removeAllItems();
    var userId = $$('km_edit_user').value;

    for (var i = 0; i < this.mMoneyList.length; i++) {
      if (this.mMoneyList[i][2] == userId) {
        $$("km_edit_emoney").appendItem(this.mMoneyList[i][1], this.mMoneyList[i][0]);
      }
    }
    $$("km_edit_emoney").selectedIndex = 0;
  
};

EMoneyTable.prototype.addRecord = function() {
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
    + "'" + $$('km_edit_transactionDate').value + "', "
    + incomeValue + ", "
    + expenseValue + ", "
    + $$('km_edit_item').value + ", "
    + "\"" + $$('km_edit_detail').value + "\", "
    + $$('km_edit_user').value + ", "
    + $$('km_edit_emoney').value + ", "
    + "datetime('now'), "
    + "0, "
    + "1)"];
  this.mDb.executeTransaction(sql);
  this.load();
};
EMoneyTable.prototype.updateRecord = function() {
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
  var currIdx = this.treeTable.currentIndex;
  var sql = ["update km_emoney_trns "
    + "set "
    + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', "
    + "income = " + incomeValue + ", "
    + "expense = " + expenseValue + ", "
    + "item_id = " + $$('km_edit_item').value + ", "
    + "detail = " + "\"" + $$('km_edit_detail').value + "\", "
    + "user_id = " + $$('km_edit_user').value + ", "
    + "money_id = " + $$('km_edit_emoney').value + ", "
    + "last_update_date = datetime('now'), "
    + "internal = " + internalValue + ", "
    + "source = 1 "
    + "where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  this.load();
  this.ensureRowIsVisible(12, rowid);
};

EMoneyTable.prototype.deleteRecord = function() {
  var sql = ["delete from km_emoney_trns where rowid = " + this.getColumnValue(12)];
  this.mDb.executeTransaction(sql);
  
  this.load();
};

