utils.include('./kmoney.common.js');

initDbfile('existingdb');

testImport.priority = 'normal';
function testImport() {
    importConfTest();
    
    insertMizuhoTestConf();
    mizuhoTest();

    insertSaisonTestConf();
    saisonTest();
}
function saisonTest() {
    function importCallback() {
        done["value"] = true;
    }
    execUpdate("delete from km_import_history where source_type = 10");
    
    var importer = app.getImportModule("セゾンカード");
    
    var importFile = utils.normalizeToFile("file/saison.csv");
    var done = {value: false};
    importer.importDb("セゾンカード", importFile, 2, importCallback);
    utils.wait(done);

    var sql = ["select A.transaction_date, A.item_id, A.detail,",
               "A.expense, A.card_id, A.user_id,",
               "B.pay_month, B.pay_amount, B.bought_amount",
               "from km_creditcard_trns A,",
               "km_creditcard_payment B",
               "where A.id = B.transaction_id",
               "order by A.id desc"].join(" ");
    var statement = execSelect(sql);
    assert.isTrue(statement !== null);
    assert.equal("2012-07-29", statement.row.transaction_date);
    assert.equal(2405, statement.row.expense);
    assert.equal(1, statement.row.item_id);
    assert.equal(2, statement.row.user_id);
    assert.equal("2012-09", statement.row.pay_month);
    assert.equal("三省堂書店", statement.row.detail);
    statement = getNext(statement);
    assert.equal("2012-07-20", statement.row.transaction_date);
    assert.equal(1, statement.row.item_id);
    assert.equal(2, statement.row.user_id);
    assert.equal("2012-09", statement.row.pay_month);
    assert.equal(1900, statement.row.pay_amount);
    assert.equal(2000, statement.row.bought_amount);
    assert.equal(2000, statement.row.expense);
    closeStatement(statement);

}
function insertSaisonTestConf() {
    var sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 10, "
      + "'既定値', "
      + "1, "
      + "1, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 10 and detail = '既定値')";
    execUpdate(sql);
    sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 10, "
      + "'さくら水産', "
      + "2, "
      + "0, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 10 and detail = 'さくら水産')";
    execUpdate(sql);
    
}
function mizuhoTest() {
    function importCallback() {
        done["value"] = true;
    }
    execUpdate("delete from km_import_history where source_type = 7");
    
    var importer = app.getImportModule("みずほ銀行");
    
    var importFile = utils.normalizeToFile("file/import-mizuho.ofx");
    var done = {value: false};
    importer.importDb("みずほ銀行", importFile, 1, importCallback);
    
    utils.wait(done);
    var sql = ["select transaction_date, item_id, detail,",
               "income, expense, bank_id, user_id",
               "from km_bank_trns order by id desc"].join(" ");
    var statement = execSelect(sql);
    assert.isTrue(statement !== null);
    assert.equal("2012-09-05", statement.row.transaction_date);
    statement = getNext(statement);
    assert.isTrue(statement !== null);
    assert.equal("2012-08-27", statement.row.transaction_date);
    statement = getNext(statement);
    assert.isTrue(statement !== null);
    assert.equal("2012-08-15", statement.row.transaction_date);
    statement = getNext(statement);
    assert.isTrue(statement !== null);
    assert.equal("2012-07-10", statement.row.transaction_date);
    statement = getNext(statement);
    assert.isTrue(statement !== null);
    assert.equal("2012-07-06", statement.row.transaction_date);
    statement = getNext(statement);
    assert.isTrue(statement !== null);
    assert.equal("2012-07-05", statement.row.transaction_date);
    statement = getNext(statement);
    assert.isTrue(statement !== null);
    assert.equal("2012-06-29", statement.row.transaction_date);
    statement = getNext(statement);
    assert.isTrue(statement !== null);
    assert.equal("2012-05-25", statement.row.transaction_date);
    statement = getNext(statement);
    assert.isTrue(statement !== null);
    closeStatement(statement);

    
}
function insertMizuhoTestConf() {
    var sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 7, "
      + "'クレジットカード', "
      + "1, "
      + "1, "
      + "1, "
      + "0 ";
      + "where not exists "
      + "(select 1 from km_import where source_type = 7 and detail = 'クレジットカード')";
    execUpdate(sql);
    
}

function importConfTest() {
    var dialog = window.openDialog("chrome://kmoney/content/import/ImportConf.xul",
                                   "ImportConf",
        "chrome, resizable, centerscreen, dialog", app.mDb, app.itemMap);
    
    utils.wait(500);

    var tree = dialog.importConf.mTree;

    // みずほ銀行を選択し、設定を追加    
    $('km_list_importconf_type', dialog).selectedIndex = 5;
    $('km_textbox_importconf_detail', dialog).value = "ＡＴＭ";
    $('km_list_importconf_item', dialog).selectedIndex = 3;
    $('km_list_importconf_internal', dialog).selectedIndex = 1;
    $('km_checkbox_importconf_default', dialog).checked = true;
    action.clickOn($('km_button_importconf_add', dialog));
    
    var rowCnt = tree.treeView.rowCount;
    tree.treeView.selection.select(rowCnt - 1);
    assert.equal("7", tree.getSelectedRowValue('import_conf_source_type'));
    assert.equal("ＡＴＭ", tree.getSelectedRowValue('import_conf_detail'));
    assert.equal("1", tree.getSelectedRowValue('import_conf_default'));
    assert.equal("1", tree.getSelectedRowValue('import_conf_internal'));
    assert.equal("1", tree.getSelectedRowValue('import_conf_permission'));

    // 更新
    $('km_checkbox_importconf_default', dialog).checked = false;
    action.clickOn($('km_button_importconf_update', dialog));
    assert.equal("0", tree.getSelectedRowValue('import_conf_default'));
    
    // 削除
    action.clickOn($('km_button_importconf_delete', dialog));
    assert.equal(rowCnt - 1, tree.treeView.rowCount);

    // 閉じる
    action.clickOn($('km_button_importconf_close', dialog));
    
}

