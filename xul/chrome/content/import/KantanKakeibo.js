
function KantanKakeibo(db, cashTbl, itemMap) {
  this.mDb = db;
  this.cashTable = cashTbl;
  
  // TODO: このマップは編集できるようにする
  this.importItemMap = {
    "食材・生活用品": itemMap["食材・生活用品"],
    "外食": itemMap["外食"],
    "娯楽": itemMap["娯楽"],
    "医療・サービス": itemMap["医療・サービス"],
    "住居・家電": itemMap["住居・家電"],
    "交通費": itemMap["交通費"],
    "ATM/振替": itemMap["ATM/振替"],
    "雑費": itemMap["雑費"],
    "通信費": itemMap["通信費"],
    "交際費": itemMap["交際費"],
    "衣料品": itemMap["衣料品"]
  };

};
KantanKakeibo.prototype.getSourceType = function() {
    this.mDb.selectQuery("select rowid from km_source where type = 'かんたん家計簿'" );
    var records = this.mDb.getRecords();
    if (records.length === 1) {
      return records[0][0];
    }
    return 0;
};

KantanKakeibo.prototype.importDb = function(kantanDbFile, userId) {
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

  var sourceType = this.getSourceType();
  for (var i = 0; i < records.length; i++) {
    var rec = {
      "transactionDate": records[i][0],
      "income": 0,
      "expense": 0,
      "itemId": this.importItemMap[records[i][2]],
      "detail": "",
      "userId": userId,
      "internal": 0,
      "source": sourceType,
    };

    if (records[i][1] == 0) {
      rec["income"] = 0;
      rec["expense"] = records[i][4];
    } else {
      rec["income"] = records[i][4];
      rec["expense"] = 0;
    }
    rec["detail"] = records[i][3];
    var memo = records[i][5];
    if (rec["detail"] != null && rec["detail"] != "") {
      if (memo != null && memo != "") {
        rec["detail"] += "(" + memo + ")";
      }
    } else {
      rec["detail"] = memo;
    }
    this.cashTable.addNewRecord(rec);
  }
  this.cashTable.executeInsert();
  kantanDb.closeConnection();
  
  return true;
};

