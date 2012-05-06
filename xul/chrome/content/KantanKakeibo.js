

function KantanKakeibo() {
};
KantanKakeibo.prototype.importDb = function(kantanDbFile, cashTable) {
  var kantanDb = new SQLiteHandler();
  try {
      kantanDb.openDatabase(kantanDbFile, true);
  } catch (e) {
      Components.utils.reportError('in function importDb - ' + e);
      km_message("Connect to '" + kantanDbFile.path + "' failed: " + e, 0x3);
      return false;
  }
  
  var sql = "select "
    + "A.date_time, "
    + "A.balance_type, "
    + "B.item_name, "
    + "C.detail_name, "
    + "A.cash_value, "
    + "A.information "
    + "from cash_flow A, balance_item B "
    + "left join item_detail C "
    + "on A.item_detail_id = C._id  "
    + "where A.balance_item_id = B._id "
    + "order by A.date_time, A.time ";
  kantanDb.selectQuery(sql);
  var records = kantanDb.getRecords();

  for (var i = 0; i < records.length; i++) {
    var transactionDate = records[i][0];
    var income = 0;
    var expense = 0;
    if (records[i][1] == 0) {
      expense = records[i][4];
    } else {
      income = records[i][4];
    }
    var itemName = records[i][2];
    var detail = records[i][3];
    var memo = records[i][5];
    if (detail != null && detail != "") {
      if (memo != null && memo != "") {
        detail += "(" + memo + ")";
      }
    } else {
      detail = memo;
    }
    cashTable.importRecord(transactionDate, income, expense,
      itemName, detail, 1, 0, 0);
  }
  kantanDb.closeConnection();
  
  return true;
};

