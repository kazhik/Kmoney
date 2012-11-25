var win = null;
var doc = null;
var app = null;
var dbconn = null;

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

    dbconn = utils.openDatabase('../../db/Kmoney.sqlite');

}

function shutDown()
{
    dbconn.close();
//    win.close();
}

function execSelect(sql) {
    var statement = dbconn.createStatement(sql);
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

