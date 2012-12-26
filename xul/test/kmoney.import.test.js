utils.include('./kmoney.common.js');

initDbfile('existingdb');

testImport.priority = 'normal';
function testImport() {
    importConfTest();
    
    insertMizuhoTestConf();
    mizuhoTest();
    
}
function mizuhoTest() {
    function importCallback() {
        done["value"] = true;
    }
    
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

    execUpdate("delete from km_import_history");
    
}
function insertMizuhoTestConf() {
    var sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ") values ( "
      + "7, "
      + "'クレジットカード', "
      + "1, "
      + "1, "
      + "1, "
      + "0)";
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

