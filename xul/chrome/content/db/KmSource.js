function KmSource(db) {
    this.mDb = db;
}

KmSource.prototype.loadSourceType = function (srcName, loadCallback) {
    this.mDb.selectQuery("select id from km_source where type = '" + srcName + "'");
    var records = this.mDb.getRecords();
    var sourceType;
    if (records.length === 1) {
        sourceType = records[0][0];
    } else {
        sourceType = 0;
    }
    loadCallback(sourceType);
};

KmSource.prototype.load = function(loadCallback) {
    this.mDb.selectQuery("select A.id, A.type from km_source A " +
                         "where A.import = 1 and A.enabled = 1");
    loadCallback(this.mDb.getRecords());
};
