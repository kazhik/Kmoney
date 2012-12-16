utils.include('./kmoney.common.js');

initDbfile('existingdb');

testMasterData.priority = 'normal';
function testMasterData() {

    var dialog = window.openDialog("chrome://kmoney/content/master/MasterData.xul", "MasterData",
        "chrome, resizable, centerscreen, dialog", app.mDb);
    
    utils.wait(500);

    userMasterTest(dialog);
    itemMasterTest(dialog);
    bankMasterTest(dialog);
    creditcardMasterTest(dialog);
    emoneyMasterTest(dialog);

    // クローズ
    action.clickOn($('km_button_master_close', dialog));
    
}
function emoneyMasterTest(dialog) {
    var masterData = dialog.masterData;
    $('km_master_tabbox', dialog).selectedTab = $('km_tab_master_emoney', dialog);

    var emoneyTree = masterData.emoneyMaster.mTree;
    // 追加    
    $('km_edit_name', dialog).value = "emoney1";
    $('km_edit_user', dialog).selectedIndex = 1;
    action.clickOn($('km_button_master_add', dialog));
    var rowCnt = emoneyTree.treeView.rowCount;
    emoneyTree.treeView.selection.select(rowCnt - 1);
    assert.equal("emoney1", emoneyTree.getSelectedRowValue('master_emoney_name'));
    assert.equal("2", emoneyTree.getSelectedRowValue('master_emoney_userid'));
    
    // 更新
    $('km_edit_name', dialog).value = "emoney2";
    $('km_edit_user', dialog).selectedIndex = 0;
    action.clickOn($('km_button_master_update', dialog));
    rowCnt = emoneyTree.treeView.rowCount;
    emoneyTree.treeView.selection.select(rowCnt - 1);
//    assert.equal("emoney2", emoneyTree.getSelectedRowValue('master_emoney_name'));
    assert.equal("1", emoneyTree.getSelectedRowValue('master_emoney_userid'));

    // 削除
    action.clickOn($('km_button_master_delete', dialog));
    assert.equal(rowCnt - 1, emoneyTree.treeView.rowCount);

}
function creditcardMasterTest(dialog) {
    var masterData = dialog.masterData;
    $('km_master_tabbox', dialog).selectedTab = $('km_tab_master_creditcard', dialog);

    var cardTree = masterData.cardMaster.mTree;
    $('km_edit_name', dialog).value = "card1";
    $('km_edit_user', dialog).selectedIndex = 1;
    $('km_edit_bank', dialog).selectedIndex = 0;
    action.clickOn($('km_button_master_add', dialog));
    var rowCnt = cardTree.treeView.rowCount;
    cardTree.treeView.selection.select(rowCnt - 1);
    assert.equal("card1", cardTree.getSelectedRowValue('master_creditcard_name'));
    assert.equal("2", cardTree.getSelectedRowValue('master_creditcard_userid'));
    assert.equal("1", cardTree.getSelectedRowValue('master_creditcard_bankid'));
    
    $('km_edit_name', dialog).value = "card2";
    $('km_edit_user', dialog).selectedIndex = 0;
    $('km_edit_bank', dialog).selectedIndex = 1;
    action.clickOn($('km_button_master_update', dialog));
    rowCnt = cardTree.treeView.rowCount;
    cardTree.treeView.selection.select(rowCnt - 1);
    assert.equal("card2", cardTree.getSelectedRowValue('master_creditcard_name'));
    assert.equal("1", cardTree.getSelectedRowValue('master_creditcard_userid'));
    assert.equal("2", cardTree.getSelectedRowValue('master_creditcard_bankid'));
    
    action.clickOn($('km_button_master_delete', dialog));
    assert.equal(rowCnt - 1, cardTree.treeView.rowCount);
}
function bankMasterTest(dialog) {
    var masterData = dialog.masterData;
    $('km_master_tabbox', dialog).selectedTab = $('km_tab_master_bank', dialog);

    var bankTree = masterData.bankMaster.mTree;
    // 追加    
    $('km_edit_name', dialog).value = "bank1";
    $('km_edit_user', dialog).selectedIndex = 1;
    action.clickOn($('km_button_master_add', dialog));
    var rowCnt = bankTree.treeView.rowCount;
    bankTree.treeView.selection.select(rowCnt - 1);
    assert.equal("bank1", bankTree.getSelectedRowValue('master_bank_name'));
    assert.equal("2", bankTree.getSelectedRowValue('master_bank_userid'));
    
    // 更新
    $('km_edit_name', dialog).value = "bank2";
    $('km_edit_user', dialog).selectedIndex = 0;
    action.clickOn($('km_button_master_update', dialog));
    rowCnt = bankTree.treeView.rowCount;
    bankTree.treeView.selection.select(rowCnt - 1);
    assert.equal("bank2", bankTree.getSelectedRowValue('master_bank_name'));
    assert.equal("1", bankTree.getSelectedRowValue('master_bank_userid'));

    // 削除
    action.clickOn($('km_button_master_delete', dialog));
    assert.equal(rowCnt - 1, bankTree.treeView.rowCount);

}
function itemMasterTest(dialog) {
    var masterData = dialog.masterData;
    $('km_master_tabbox', dialog).selectedTab = $('km_tab_master_item', dialog);

    var itemTree = masterData.itemMaster.mTree;
    // 費目追加    
    $('km_edit_name', dialog).value = "item1";
    action.clickOn($('km_button_master_add', dialog));
    
    var rowCnt = itemTree.treeView.rowCount;
    itemTree.treeView.selection.select(rowCnt - 1);
    assert.equal("item1", itemTree.getSelectedRowValue('master_item_name'));
    assert.equal("0", itemTree.getSelectedRowValue('master_item_sum_value'));

    $('km_edit_name', dialog).value = "item2";
    $('km_master_sum', dialog).checked = true;
    action.clickOn($('km_button_master_add', dialog));
    
    rowCnt = itemTree.treeView.rowCount;
    itemTree.treeView.selection.select(rowCnt - 1);
    assert.equal("item2", itemTree.getSelectedRowValue('master_item_name'));
    assert.equal("1", itemTree.getSelectedRowValue('master_item_sum_value'));

    // 費目更新    
    $('km_edit_name', dialog).value = "item3";
    $('km_master_sum', dialog).checked = false;
    action.clickOn($('km_button_master_update', dialog));
    rowCnt = itemTree.treeView.rowCount;
    itemTree.treeView.selection.select(rowCnt - 1);
    assert.equal("item3", itemTree.getSelectedRowValue('master_item_name'));
    assert.equal("0", itemTree.getSelectedRowValue('master_item_sum_value'));
    
    // 費目変更    
    action.clickOn($('km_button_master_delete', dialog));
    assert.equal(rowCnt - 1, itemTree.treeView.rowCount);
    itemTree.treeView.selection.select(rowCnt - 2);    
    action.clickOn($('km_button_master_delete', dialog));
    assert.equal(rowCnt - 2, itemTree.treeView.rowCount);
}
function userMasterTest(dialog) {
    var masterData = dialog.masterData;
    $('km_master_tabbox', dialog).selectedTab = $('km_tab_master_user', dialog);
    
    // ユーザー追加
    var userTree = masterData.userMaster.mTree;

    $('km_edit_name', dialog).value = "kazhik";
    action.clickOn($('km_button_master_add', dialog));

    var rowCnt = userTree.treeView.rowCount;
    userTree.treeView.selection.select(rowCnt - 1);
    var colVal = userTree.getSelectedRowValue('master_user_name');
    assert.equal("kazhik", colVal);
    // ユーザー更新
    $('km_edit_name', dialog).value = "kazhik.modified";
    action.clickOn($('km_button_master_update', dialog));
    colVal = userTree.getSelectedRowValue('master_user_name');
    assert.equal("kazhik.modified", colVal);
    // ユーザー削除
    action.clickOn($('km_button_master_delete', dialog));
    assert.equal(rowCnt - 1, userTree.treeView.rowCount);
    
}

