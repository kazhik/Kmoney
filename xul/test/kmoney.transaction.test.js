utils.include('./kmoney.common.js');

initDbfile('existingdb');

testTransactionData.priority = 'normal';
function testTransactionData() {
    utils.wait(500);

    cashTransactionTest();
    bankTransactionTest();
    emoneyTransactionTest();
    creditcardTransactionTest();
}
function creditcardTransactionTest() {
    var trns = app.creditcardTrns;
    var tree = trns.mTree;
    
    $('km_tabbox', win).selectedTab = $('km_tab_creditcard', win);

    // 追加    
    $('km_textbox_detail', win).value = "creditcard1";
    $('km_textbox_amount', win).value = "40001";
    action.clickOn($('km_button_add', win));
    var rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("creditcard1", tree.getSelectedRowValue('detail'));
    assert.equal("40001", tree.getSelectedRowValue('expense'));
    
    // 更新
    $('km_list_category', win).selectedIndex = 1;
    $('km_textbox_detail', win).value = "detail2";
    $('km_textbox_amount', win).value = "3200";
    $('km_list_user', win).selectedIndex = 0;
    $('km_list_creditcard', win).selectedIndex = 1;
    $('km_textbox_paymonthY', win).value = "2012";
    $('km_textbox_paymonthM', win).value = "12";
    
    action.readyToConfirm(true);
    action.clickOn($('km_button_update', win));
    rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("3200", tree.getSelectedRowValue('expense'));
    assert.equal("detail2", tree.getSelectedRowValue('detail'));
    assert.equal("外食", tree.getSelectedRowValue('category_name'));
    assert.equal("太郎", tree.getSelectedRowValue('user_name'));
    assert.equal("ビューカード", tree.getSelectedRowValue('card_name'));
    assert.equal("2012-12", tree.getSelectedRowValue('pay_month'));
    
    // 削除
    action.readyToConfirm(true);
    action.clickOn($('km_button_delete', win));
    assert.equal(rowCnt - 1, tree.treeView.rowCount);
}

function emoneyTransactionTest() {
    var trns = app.emoneyTrns;
    var tree = trns.mTree;
    
    $('km_tabbox', win).selectedTab = $('km_tab_emoney', win);

    // 追加    
    $('km_radgroup_income-expense', win).selectedItem = $('km_radio_expense', win);
    $('km_textbox_detail', win).value = "emoney1";
    $('km_textbox_amount', win).value = "877.87";
    action.clickOn($('km_button_add', win));
    var rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("emoney1", tree.getSelectedRowValue('detail'));
    assert.equal("877.87", tree.getSelectedRowValue('expense'));
    
    // 更新
    $('km_radgroup_income-expense', win).selectedItem = $('km_radio_income', win);
    $('km_list_category', win).selectedIndex = 1;
    $('km_textbox_detail', win).value = "detail2";
    $('km_textbox_amount', win).value = "3200";
    $('km_list_user', win).selectedIndex = 1;
    $('km_list_internal', win).selectedIndex = 2;
    action.readyToConfirm(true);
    action.clickOn($('km_button_update', win));
    rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("3200", tree.getSelectedRowValue('income'));
    assert.equal("0", tree.getSelectedRowValue('expense'));
    assert.equal("detail2", tree.getSelectedRowValue('detail'));
    assert.equal("外食", tree.getSelectedRowValue('category_name'));
    assert.equal("花子", tree.getSelectedRowValue('user_name'));
    assert.equal("家族", tree.getSelectedRowValue('internal_name'));
    
    // 削除
    action.readyToConfirm(true);
    action.clickOn($('km_button_delete', win));
    assert.equal(rowCnt - 1, tree.treeView.rowCount);
}

function bankTransactionTest() {
    var trns = app.bankTrns;
    var tree = trns.mTree;
    
    $('km_tabbox', win).selectedTab = $('km_tab_bank', win);

    // 追加    
    $('km_radgroup_income-expense', win).selectedItem = $('km_radio_expense', win);
    $('km_textbox_detail', win).value = "bank1";
    $('km_textbox_amount', win).value = "877.87";
    action.clickOn($('km_button_add', win));
    var rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("bank1", tree.getSelectedRowValue('detail'));
    assert.equal("877.87", tree.getSelectedRowValue('expense'));
    
    // 更新
    $('km_radgroup_income-expense', win).selectedItem = $('km_radio_income', win);
    $('km_list_category', win).selectedIndex = 1;
    $('km_textbox_detail', win).value = "detail2";
    $('km_textbox_amount', win).value = "3200";
    $('km_list_user', win).selectedIndex = 1;
    $('km_list_internal', win).selectedIndex = 2;
    action.readyToConfirm(true);
    action.clickOn($('km_button_update', win));
    rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("3200", tree.getSelectedRowValue('income'));
    assert.equal("0", tree.getSelectedRowValue('expense'));
    assert.equal("detail2", tree.getSelectedRowValue('detail'));
    assert.equal("外食", tree.getSelectedRowValue('category_name'));
    assert.equal("2", tree.getSelectedRowValue('user_id'));
    assert.equal("家族", tree.getSelectedRowValue('internal_name'));
    
    // 削除
    action.readyToConfirm(true);
    action.clickOn($('km_button_delete', win));
    assert.equal(rowCnt - 1, tree.treeView.rowCount);
}
function cashTransactionTest() {
    var trns = app.cashTrns;
    var tree = trns.mTree;
    
    $('km_tabbox', win).selectedTab = $('km_tab_cash', win);

    // 追加    
    $('km_radgroup_income-expense', win).selectedItem = $('km_radio_expense', win);
    $('km_textbox_detail', win).value = "detail1";
    $('km_textbox_amount', win).value = "1300";
    action.clickOn($('km_button_add', win));
    var rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("detail1", tree.getSelectedRowValue('detail'));
    assert.equal("1300", tree.getSelectedRowValue('expense'));
    
    // 更新
    $('km_radgroup_income-expense', win).selectedItem = $('km_radio_income', win);
    $('km_list_category', win).selectedIndex = 1;
    $('km_textbox_detail', win).value = "detail2";
    $('km_textbox_amount', win).value = "3200";
    $('km_list_user', win).selectedIndex = 1;
    $('km_list_internal', win).selectedIndex = 2;
    action.readyToConfirm(true);
    action.clickOn($('km_button_update', win));
    rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("3200", tree.getSelectedRowValue('income'));
    assert.equal("0", tree.getSelectedRowValue('expense'));
    assert.equal("detail2", tree.getSelectedRowValue('detail'));
    assert.equal("外食", tree.getSelectedRowValue('category_name'));
    assert.equal("2", tree.getSelectedRowValue('user_id'));
    assert.equal("家族", tree.getSelectedRowValue('internal_name'));
    
    // 削除
    action.readyToConfirm(true);
    action.clickOn($('km_button_delete', win));
    assert.equal(rowCnt - 1, tree.treeView.rowCount);
}
