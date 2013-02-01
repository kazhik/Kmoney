function KantanKakeiboDb() {
    
}

KantanKakeiboDb.prototype.load = function(dbFile, loadCallback) {
    var kantanDb = new SQLiteHandler();
    try {
        kantanDb.openDatabase(dbFile, true);
    } catch (e) {
        Components.utils.reportError('in function load - ' + e);
        km_message("Connect to '" + dbFile.path + "' failed: " + e, 0x3);
        return false;
    }

    var sql = ["select ",
               "A.date_time, ",
               "A.balance_type, ",
               "B.item_name, ",
               "C.detail_name, ",
               "A.cash_value, ",
               "A.information ",
               "from cash_flow A, balance_item B ",
               "left join item_detail C ",
               "on A.item_detail_id = C._id  ",
               "where A.balance_item_id = B._id ",
               "order by A.date_time, A.time "].join(" ");
    kantanDb.selectQuery(sql);
    loadCallback(kantanDb.getRecords());
    
    return true;
};