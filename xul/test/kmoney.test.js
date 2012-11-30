utils.include('./kmoney.common.js');

initDbfile('existingdb');

testKmoney.priority = 'normal';
function testKmoney() {
    assert.isTrue(doc !== null);
    utils.wait(500); // km_tab_bankのロードを待つ
    action.clickOn($('km_tab_bank', doc));
    action.keypressOn($('km_edit_detail', doc), 'f');
    $('km_edit_detail', doc).value = "Hello";
    action.keypressOn($('km_mainwindow', doc), 'f', { altKey : true });

    var elem = doc.getElementById("km_menu_file");
    action.clickOn($('km_menu_file', doc));
    // メニューを選択する方法がわからない

//    alert(JSON.stringify(win.kmoney.mDb.bankInfo.mBankList));
}

