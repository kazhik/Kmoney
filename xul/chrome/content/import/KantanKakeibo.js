function KantanKakeibo(db, cashTbl) {
  AbstractImport.call(this, db);
  
  this.cashTbl = cashTbl;
}
KantanKakeibo.prototype = Object.create(AbstractImport.prototype);

KantanKakeibo.prototype.importDb = function(kantanDbFile, userId) {
  this.userId = userId;
  this.loadSourceType("かんたん家計簿");
  this.loadImportConf();
  
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
    var rec = {
      "transactionDate": records[i][0],
      "income": 0,
      "expense": 0,
      "itemId": 0,
      "detail": "",
      "userId": userId,
      "internal": 0,
      "source": this.sourceType,
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
    var itemInfo = this.getItemInfo(records[i][2]);
    if (itemInfo["itemId"] === undefined) {
      km_alert(km_getLStr("error.title"), km_getLStr("error.import.noConf"));
      return false;
    }
    rec["itemId"] = itemInfo["itemId"];
    rec["internal"] = itemInfo["internal"];

    this.cashTbl.addNewRecord(rec);
  }
  this.cashTbl.executeInsert();
  kantanDb.closeConnection();
  this.cashTbl.load('last');
  
  return true;
};

