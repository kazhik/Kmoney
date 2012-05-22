CreditCardTable.prototype = new TreeDataTable("km_tree_creditcard");
CreditCardTable.constructor = CreditCardTable;
CreditCardTable.superclass = TreeDataTable.prototype;

function CreditCardTable() {
  this.mDb = null;
  this.mCardList = null;
};
CreditCardTable.prototype.initialize = function(db) {
  this.mDb = db;
  CreditCardTable.superclass.init.call(this, this.load.bind(this));
};
CreditCardTable.prototype.load = function(direction, sortColumn) {
  var orderby = "";
  if (sortColumn === undefined) {
    if (this.mSortOrder != null) {
      orderby = "order by " + this.mSortOrder;
    } else {
      orderby = "order by transaction_date"
    }
  } else if (sortColumn === "") {
    orderby = "";
  } else {
    orderby = "order by " + sortColumn;
    this.mSortOrder = sortColumn;
  }

  var count = this.mDb.getRowCount('km_creditcard_trns', '');
  this.setRowCount(count);
  $$('km_total').value = count;
  this.setOffset(direction);
  var sql = "select "
    + "A.transaction_date, "
    + "A.item_id, "
    + "B.name as item_name, "
    + "A.detail, "
    + "A.expense, "
    + "A.card_id, "
    + "D.name as card_name, "
    + "A.user_id, "
    + "C.name as user_name, "
    + "A.rowid "
    + "from km_creditcard_trns A "
    + "left join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "inner join km_creditcard_info D "
    + " on A.card_id = D.rowid "
    + orderby + " "
    + "limit " + this.mLimit + " offset " + this.mOffset;
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();
  this.PopulateCardList();
  this.PopulateTableData(records, columns, types);
  this.ensureRowIsVisible(9, -1);
  this.ShowTable(true);
  
  $$('km_from_value').value = this.getFromValue();
  $$('km_to_value').value = this.getToValue();
};
CreditCardTable.prototype.onSelect = function() {
  $$('km_edit_transactionDate').value = this.getColumnValue(0);
  $$('km_edit_item').value = this.getColumnValue(1);
  $$('km_edit_detail').value = this.getColumnValue(3);
  $$('km_edit_amount').value = this.getColumnValue(4);
  $$('income_expense').selectedItem = $$('km_edit_expense');
  $$('km_edit_user').value = this.getColumnValue(7);
  $$('km_edit_creditcard').value = this.getColumnValue(5);
};
CreditCardTable.prototype.PopulateCardList = function() {
    
    this.mDb.selectQuery("select rowid, name, user_id from km_creditcard_info");
    this.mCardList = this.mDb.getRecords();

    this.onUserSelect();    
    
};
CreditCardTable.prototype.onUserSelect = function() {
    $$("km_edit_creditcard").removeAllItems();
    var userId = $$('km_edit_user').value;

    for (var i = 0; i < this.mCardList.length; i++) {
      if (this.mCardList[i][2] == userId) {
        $$("km_edit_creditcard").appendItem(this.mCardList[i][1], this.mCardList[i][0]);
      }
    }
    $$("km_edit_creditcard").selectedIndex = 0;
  
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
    + "'" + $$('km_edit_transactionDate').value + "', "
    + $$('km_edit_amount').value + ", "
    + $$('km_edit_item').value + ", "
    + "\"" + $$('km_edit_detail').value + "\", "
    + $$('km_edit_user').value + ", "
    + $$('km_edit_creditcard').value + ", "
    + "datetime('now'), "
    + "1)"];
  this.mDb.executeTransaction(sql);
  this.load();
};
CreditCardTable.prototype.updateRecord = function() {
  var rowid = this.getColumnValue(9);
  var sql = ["update km_creditcard_trns "
    + "set "
    + "transaction_date = " + "'" + $$('km_edit_transactionDate').value + "', "
    + "expense = " + $$('km_edit_amount').value + ", "
    + "item_id = " + $$('km_edit_item').value + ", "
    + "detail = " + "\"" + $$('km_edit_detail').value + "\", "
    + "user_id = " + $$('km_edit_user').value + ", "
    + "card_id = " + $$('km_edit_creditcard').value + ", "
    + "last_update_date = datetime('now'), "
    + "source = 1 "
    + "where rowid = " + rowid];
  km_log(sql);
  this.mDb.executeTransaction(sql);
  this.load();
  this.ensureRowIsVisible(9, rowid);
};

CreditCardTable.prototype.deleteRecord = function() {
  var rowid = this.getColumnValue(9);
  if (rowid === "") {
    return;
  }
  var sql = ["delete from km_creditcard_trns where rowid = " + rowid];
  this.mDb.executeTransaction(sql);
  
  this.load();
};
