var win = null;
var doc = null;
var app = null;
var dbconn = null;

var dbfile = null;

function initDbfile(mode) {
    if (mode === 'existingdb') {
        dbfile = utils.normalizeToFile('../../db/testdb.sqlite');
    } else if (mode === 'newdb') {
        dbfile = utils.normalizeToFile('../../db/testnewdb.sqlite');
        if (dbfile.exists()) {
            dbfile.remove(false);
        }
    }
}

function setUp() {
}

function tearDown() {

}

function startUp()
{
    var loaded = { value : false };
    function onLoad() {
        loaded.value = true;
    }
    
    win = window.open("chrome://kmoney/content/", "kmoney", "chrome");
    assert.isTrue(win !== null);
    win.addEventListener('load', onLoad, false);
    utils.wait(loaded);
   
    doc = win.document;
    assert.isTrue(doc !== null);
    
    app = win.kmoney;
    assert.isTrue(app !== null);
    
    openTestDb();
    
}

function shutDown()
{
    if (dbconn !== null) {
        dbconn.close();
    }
    win.close();
}

function openTestDb() {
    dbconn = utils.openDatabase(dbfile);
    app.mDb.openDatabase(dbfile);
    
    utils.log(app.mDb.isConnected());
}

// 一件だけ取得
function execSelect(sql) {
    var statement = dbconn.createStatement(sql);
    statement.executeStep();

    return statement;    
}
// 次の一件を取得
function getNext(statement) {
    statement.executeStep();
    return statement;
}

function execUpdate(sql) {
    var statement = dbconn.createStatement(sql);
    statement.executeStep();

    closeStatement(statement);
}

function closeStatement(stmt) {
    stmt.reset();
    stmt.finalize();
}

