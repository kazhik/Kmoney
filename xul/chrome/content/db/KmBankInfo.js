function KmBankInfo(db) {
    this.mDb = db;
    this.mBankList = null;
}
KmBankInfo.prototype.load = function(loadCallback) {
    this.mDb.selectQuery("select id, name, user_id from km_bank_info");
    this.mBankList = this.mDb.getRecords();
    loadCallback(this.mBankList);
};

KmBankInfo.prototype.loadMaster = function(loadCallback) {
    this.mDb.selectQuery("select A.id, A.name, A.user_id, B.name "
                         + "from km_bank_info A, km_user B "
                         + "where A.user_id = B.id");
    
    var records = this.mDb.getRecords();
    var columns = this.mDb.getColumns();

    loadCallback(records, columns);    
    
};

KmBankInfo.prototype.insert = function(params, insertCallback) {
    var sql = ["insert into km_bank_info ("
      + "name, "
      + "user_id "
      + ") values ( "
      + "'" + params['name'] + "', "
      + params['userId'] + ")"];

    this.mDb.executeTransaction(sql);
    
    insertCallback(this.mDb.getLastInsertRowId());
};
KmBankInfo.prototype.update = function(id, params, updateCallback) {
    var sql = ["update km_bank_info "
      + "set "
      + "name = '" + params['name'] + "', "
      + "user_id = " + params['userId'] + " "
      + "where id = " + id];

    this.mDb.executeTransaction(sql);
    
    updateCallback();
};
KmBankInfo.prototype.delete = function(id, deleteCallback) {
    var sql = ["delete from km_bank_info where id = " + id];
    this.mDb.executeTransaction(sql);
    deleteCallback();
};


KmBankInfo.prototype.getBankId = function (name, userId) {
    for(var i = 0; i < this.mBankList.length; i++) {
        if(this.mBankList[i][1] === name && this.mBankList[i][2] == userId) {
            return this.mBankList[i][0];
        }
    }
    return 0;

};
KmBankInfo.prototype.getBankList = function (userId) {
    var bankList = [];
    for (var i = 0; i < this.mBankList.length; i++) {
        if (this.mBankList[i][2] == userId) {
            bankList.push(this.mBankList[i]);
        }
    }
    return bankList;
};
