"use strict";

function MasterData() {
    
    this.userMaster = null;
    this.itemMaster = null;
    this.cardMaster = null;
    this.bankMaster = null;
    this.emoneyMaster = null;
  
};
MasterData.prototype.initialize = function(db) {
    
    this.userMaster = new UserMaster();
    this.userMaster.initialize(db);
    this.itemMaster = new ItemMaster(db);
    this.itemMaster.initialize(db);
    this.cardMaster = new CardMaster(db);
    this.cardMaster.initialize(db);
    this.bankMaster = new BankMaster(db);
    this.bankMaster.initialize(db);
    this.emoneyMaster = new EMoneyMaster(db);
    this.emoneyMaster.initialize(db);
      
};
MasterData.prototype.load = function(direction, sortColumn) {
    $$('km_edit_user').removeAllItems();

    this.mDb.selectQuery("select id, name from km_user");
    var records = this.mDb.getRecords();

    for (var i = 0; i < records.length; i++) {
        $$('km_edit_user').appendItem(records[i][1], records[i][0]);
    }

    $$('km_edit_user').selectedIndex = 0;


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
    + "left join km_item B "
    + " on A.item_id = B.rowid "
    + "inner join km_user C "
    + " on A.user_id = C.id "
    + "inner join km_bank_info D "
    + " on A.bank_id = D.rowid "
    + orderby + " "
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
