utils.include('./kmoney.common.js');

testKmDatabase.priority = 'normal';
function testKmDatabase() {
    var dbfile = utils.makeFileWithPath('../../db/testdb.sqlite');
    
    if (dbfile.exists()) {
        dbfile.remove(false);
    }
    
    win.kmoney.mDb.newDatabase(dbfile);
    assert.equal(true, win.kmoney.mDb.isConnected());

    dbconn.close();
    dbconn = utils.openDatabase(dbfile);

    var sql = "select count(*) from km_bank_info";
    var statement = execSelect(sql);        
    var bankInfoCount = statement.getInt64(0);    
    closeStatement(statement);
    assert.equal(2, bankInfoCount);
    
    win.kmoney.mDb.closeDatabase();    
    assert.equal(false, win.kmoney.mDb.isConnected());
}

