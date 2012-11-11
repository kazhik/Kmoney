var description = 'Kmoneyテスト';

var win = null;
var doc = null;
var app = null;

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
}

function shutDown()
{
//    win.close();
}


testKmoney.description = 'Kmoneyテスト';
testKmoney.priority = 'normal';
function testKmoney() {
//    var elem = doc.getElementById("km_menu_file");
//    action.clickOn($('km_menu_file', doc));
    assert.isTrue(doc !== null);
    utils.wait(500); // km_tab_bankのロードを待つ
    action.clickOn($('km_tab_bank', doc));
    action.keypressOn($('km_edit_detail', doc), 'f');
    $('km_edit_detail', doc).value = "Hello";
//    action.keypressOn($('km_mainwindow', doc), 'f', { altKey : true });

//    alert(JSON.stringify(win.kmoney.mDb.bankInfo.mBankList));
}
