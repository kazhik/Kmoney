function KmImportHistory(db) {
    this.mDb = db;
}
KmImportHistory.prototype.insert = function(params, insertCallback) {
    var sql = ["insert into km_import_history (",
               "source_type, ",
               "source_url, ",
               "period_from, ",
               "period_to, ",
               "import_date ",
               ") values (",
               params["source_type"] + ",",
               "'" + params["source_url"] + "',",
               "'" + params["period_from"] + "',",
               "'" + params["period_to"] + "',",
               "datetime('now', 'localtime') ",
               ")"].join(" ");

    km_log(sql);
    this.mDb.executeTransaction([sql]);
    
    insertCallback(this.mDb.getLastInsertRowId());
};
