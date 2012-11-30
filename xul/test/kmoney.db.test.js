utils.include('./kmoney.common.js');

initDbfile('newdb');

testKmDatabase.priority = 'normal';
function testKmDatabase() {
    app.mDb.newDatabase(dbfile);
    assert.equal(true, app.mDb.isConnected());

    dbconn.close();
    dbconn = utils.openDatabase(dbfile);

    var sql = "select count(*) from km_bank_info";
    var statement = execSelect(sql);        
    var bankInfoCount = statement.getInt64(0);    
    closeStatement(statement);
    assert.equal(2, bankInfoCount);

    app.mDb.closeDatabase();    
    assert.equal(false, app.mDb.isConnected());
    
}
