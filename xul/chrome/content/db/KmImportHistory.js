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
               ":source_type,",
               ":source_url,",
               ":period_from,",
               ":period_to,",
               "datetime('now', 'localtime') ",
               ")"].join(" ");

    km_log(sql);
    var sqlStatement = this.mDb.createStatementWithParams(sql, params);
    this.mDb.execTransaction([sqlStatement]);
    
    insertCallback(this.mDb.getLastInsertRowId());
};
