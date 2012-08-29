function EMoneyTable() {
  this.mDb = null;
  this.mMoneyList = null;
  this.mTree = new TreeViewController("km_tree_emoney");
};
EMoneyTable.prototype.initialize = function(db) {
  this.mDb = db;
  this.mTree.init(this.load.bind(this));
  this.loadEMoneyList();
};
EMoneyTable.prototype.load = function(direction, sortColumn) {
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
  
  var count = this.mDb.getRowCount('km_emoney_trns', '');
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
    + "A.money_id, "
    + "D.name as money_name, "
    + "A.user_id, "
    + "C.name as user_name, "
    + "A.source, "
    + "A.internal, "
    + "A.rowid "
    + "from km_emoney_trns A "
    + "left join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "inner join km_emoney_info D "
    + " on A.money_id = D.rowid "
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
EMoneyTable.prototype.onSelect = function() {
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
  $$('km_edit_emoney').value = this.mTree.getColumnValue(6);
  $$('km_edit_user').value = this.mTree.getColumnValue(8);
  $$('km_edit_internal').checked = (Number(this.mTree.getColumnValue(11)) === 1);
};
EMoneyTable.prototype.loadEMoneyList = function() {
  this.mDb.selectQuery("select rowid, name, user_id from km_emoney_info");
  this.mMoneyList = this.mDb.getRecords();

  this.onUserSelect();    
    
};
EMoneyTable.prototype.getMoneyId = function(name, userId) {
  for (var i = 0; i < this.mMoneyList.length; i++) {
    if (this.mMoneyList[i][1] === name && this.mMoneyList[i][2] == userId) {
      return this.mMoneyList[i][0];
    }
  }
  return 0;
  
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

EMoneyTable.prototype.executeImport = function(newRecordArray) {
  var sqlArray = [];
  var sql;
  for (var i = 0; i < newRecordArray.length; i++) {
    sql = ["insert into km_emoney_trns ("
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
      + ") "
      + "select "
      + "'" + newRecordArray[i]["transactionDate"] + "', "
      + newRecordArray[i]["income"] + ", "
      + newRecordArray[i]["expense"] + ", "
      + newRecordArray[i]["itemId"] + ", "
      + "\"" + newRecordArray[i]["detail"] + "\", "
      + newRecordArray[i]["userId"] + ", "
      + newRecordArray[i]["moneyId"] + ", "
      + "datetime('now', 'localtime'), "
      + newRecordArray[i]["internal"] + ", "
      + newRecordArray[i]["source"] + " "
      + "where not exists ("
      + " select 1 from km_emoney_trns "
      + " where transaction_date = '" + newRecordArray[i]["transactionDate"] + "'"
      + " and income = " + newRecordArray[i]["income"]
      + " and expense = " + newRecordArray[i]["expense"]
      + " and user_id = " + newRecordArray[i]["userId"]
      + ")"];
    km_log(sql);
    sqlArray.push(sql);
  }
  this.mDb.executeTransaction(sqlArray);
};

EMoneyTable.prototype.addRecord = function() {
  var rec = {
    "transactionDate": "",
    "income": 0,
    "expense": 0,
    "itemId": 0,
    "detail": "",
    "userId": 0,
    "moneyId": 0,
    "internal": 0,
    "source": 0,
  };
  rec["transactionDate"] = $$('km_edit_transactionDate').value;
  if ($$('km_edit_income').selected) {
    rec["income"] = $$('km_edit_amount').value;
    rec["expense"] = 0;
  } else {
    rec["income"] = 0;
    rec["expense"] = $$('km_edit_amount').value;
  }
  if ($$('km_edit_internal').checked) {
    rec["internal"] = 1;
  } else {
    rec["internal"] = 0;
  }
  rec["itemId"] = $$('km_edit_item').value;
  rec["detail"] = $$('km_edit_detail').value;
  rec["userId"] = $$('km_edit_user').value;
  rec["moneyId"] = $$('km_edit_emoney').value;
  rec["source"] = 1;

  this.addNewRecord(rec);
  this.executeInsert();

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
  var rowid = this.mTree.getColumnValue(12);
  var sql = ["update km_emoney_trns "
    + "set "
    + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', "
    + "income = " + incomeValue + ", "
    + "expense = " + expenseValue + ", "
    + "item_id = " + $$('km_edit_item').value + ", "
    + "detail = " + "\"" + $$('km_edit_detail').value + "\", "
    + "user_id = " + $$('km_edit_user').value + ", "
    + "money_id = " + $$('km_edit_emoney').value + ", "
    + "last_update_date = datetime('now', 'localtime'), "
    + "internal = " + internalValue + ", "
    + "source = 1 "
    + "where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(12, rowid);
};

EMoneyTable.prototype.deleteRecord = function() {
  var rowid = this.mTree.getColumnValue(12);
  if (rowid === "") {
    return;
  }
  
  var sql = ["delete from km_emoney_trns where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  
  this.load();
};

