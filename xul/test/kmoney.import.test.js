utils.include('./kmoney.common.js');

initDbfile('existingdb');

testImport.priority = 'normal';
function testImport() {
    execUpdate("delete from km_import");
    importConfTest();
    
    insertMizuhoTestConf();
    mizuhoTest();

    insertSaisonTestConf();
    saisonTest();
    
    insertSuicaTestConf();
    suicaTest();
    
    insertCashTestConf();
    cashTest();
    
    insertBankTestConf();
    bankTest();
    
    insertEMoneyTestConf();
    emoneyTest();

}
function insertEMoneyTestConf() {
    var sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 12, "
      + "'既定値', "
      + "3, "
      + "1, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 12 and detail = '既定値')";
    execUpdate(sql);
    sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 12, "
      + "'バス', "
      + "3, "
      + "0, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 12 and detail = 'バス')";
    execUpdate(sql);      
    sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 12, "
      + "'チャージ', "
      + "4, "
      + "0, "
      + "1, "
      + "1 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 12 and detail = 'チャージ')";
    execUpdate(sql);      
    sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 12, "
      + "'松屋', "
      + "1, "
      + "0, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 12 and detail = '松屋')";
      execUpdate(sql);      
}
function emoneyTest() {
    function importCallback() {
        done["value"] = true;
    }
    execUpdate("delete from km_import_history where source_type = 12");
    
    var importer = app.getImportModule("電子マネー（汎用）");
    
    var importFile = utils.normalizeToFile("file/emoney.csv");
    var done = {value: false};
    importer.importDb("Suica", importFile, 1, importCallback);
    utils.wait(done);

    var sql = ["select transaction_date, item_id, detail,",
               "income, expense, money_id, user_id, internal",
               "from km_emoney_trns order by id desc"].join(" ");
    var statement = execSelect(sql);
    assert.isTrue(statement !== null);
    assert.equal("2012-11-18", statement.row.transaction_date);
    assert.equal(4, statement.row.item_id);
    assert.equal(1, statement.row.user_id);
    assert.equal(1, statement.row.internal);
    assert.equal("チャージ", statement.row.detail);
    statement = getNext(statement);
    assert.equal("2012-11-04", statement.row.transaction_date);
    statement = getNext(statement);
    assert.equal("2012-10-09", statement.row.transaction_date);
    assert.equal(0, statement.row.internal);
    statement = getNext(statement);
    assert.equal("2012-09-01", statement.row.transaction_date);
    assert.equal(360, statement.row.expense);
    assert.equal(3, statement.row.item_id);
    statement = getNext(statement);
    assert.equal("2012-08-28", statement.row.transaction_date);
    assert.equal(1, statement.row.item_id);
    assert.equal("松屋", statement.row.detail);
    statement = getNext(statement);
    assert.equal("2012-07-31", statement.row.transaction_date);
    statement = getNext(statement);
    assert.equal("2012-04-01", statement.row.transaction_date);
    statement = getNext(statement);
    assert.equal("2012-03-12", statement.row.transaction_date);
    statement = getNext(statement);
    assert.equal("2012-02-21", statement.row.transaction_date);
    assert.equal(0, statement.row.internal);
    closeStatement(statement);
}
function insertBankTestConf() {
    var sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 3, "
      + "'既定値', "
      + "1, "
      + "1, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 3 and detail = '既定値')";
    execUpdate(sql);
    sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 3, "
      + "'ATM', "
      + "4, "
      + "0, "
      + "1, "
      + "1 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 3 and detail = 'ATM')";
    execUpdate(sql);      
}
function bankTest() {
    function importCallback() {
        done["value"] = true;
    }
    execUpdate("delete from km_import_history where source_type = 3");
    
    var importer = app.getImportModule("銀行口座（汎用）");
    
    var importFile = utils.normalizeToFile("file/bank.csv");
    var done = {value: false};
    importer.importDb("銀行口座（汎用）", importFile, 1, importCallback);
    utils.wait(done);

    var sql = ["select transaction_date, item_id, detail,",
               "income, expense, bank_id, user_id, internal",
               "from km_bank_trns order by id desc"].join(" ");
    var statement = execSelect(sql);
    assert.isTrue(statement !== null);
    assert.equal("2012-11-08", statement.row.transaction_date);
    assert.equal(1, statement.row.item_id);
    assert.equal(1, statement.row.user_id);
    assert.equal(0, statement.row.internal);
    assert.equal("bank-detail9", statement.row.detail);
    statement = getNext(statement);
    assert.equal(871, statement.row.expense);
    assert.equal("2012-11-04", statement.row.transaction_date);
    statement = getNext(statement);
    assert.equal("2012-10-09", statement.row.transaction_date);
    assert.equal(0, statement.row.internal);
    statement = getNext(statement);
    assert.equal("2012-09-12", statement.row.transaction_date);
    statement = getNext(statement);
    assert.equal("2012-08-28", statement.row.transaction_date);
    statement = getNext(statement);
    assert.equal("2012-07-31", statement.row.transaction_date);
    assert.equal(0, statement.row.expense);
    assert.equal(20000, statement.row.income);
    assert.equal(4, statement.row.item_id);
    assert.equal(1, statement.row.internal);
    assert.equal("ATM", statement.row.detail);
    closeStatement(statement);
    
}

function insertCashTestConf() {
    var sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 2, "
      + "'既定値', "
      + "1, "
      + "1, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 2 and detail = '既定値')";
    execUpdate(sql);
    sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 2, "
      + "'ATM', "
      + "4, "
      + "0, "
      + "1, "
      + "1 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 2 and detail = 'ATM')";
    execUpdate(sql);    
    
}
function cashTest() {
    function importCallback() {
        done["value"] = true;
    }
    execUpdate("delete from km_import_history where source_type = 2");
    
    var importer = app.getImportModule("現金（汎用）");
    
    var importFile = utils.normalizeToFile("file/cash.csv");
    var done = {value: false};
    importer.importDb("現金（汎用）", importFile, 1, importCallback);
    utils.wait(done);

    var sql = ["select transaction_date, item_id, detail,",
               "income, expense, user_id, internal",
               "from km_realmoney_trns order by id desc"].join(" ");
    var statement = execSelect(sql);
    assert.isTrue(statement !== null);
    assert.equal("2012-11-08", statement.row.transaction_date);
    assert.equal(3040, statement.row.expense);
    assert.equal(1, statement.row.item_id);
    assert.equal(1, statement.row.user_id);
    assert.equal("cash-detail9", statement.row.detail);
    statement = getNext(statement);
    assert.equal("2012-11-04", statement.row.transaction_date);
    statement = getNext(statement);
    assert.equal("2012-10-09", statement.row.transaction_date);
    assert.equal(0, statement.row.internal);
    statement = getNext(statement);
    assert.equal("2012-09-12", statement.row.transaction_date);
    assert.equal(0, statement.row.expense);
    assert.equal(10000, statement.row.income);
    assert.equal(4, statement.row.item_id);
    assert.equal(1, statement.row.internal);
    closeStatement(statement);
    
}



function insertSuicaTestConf() {
    var sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 12, "
      + "'既定値', "
      + "3, "
      + "1, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 12 and detail = '既定値')";
    execUpdate(sql);

    sql = "insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ")"
      + "select 12, "
      + "'物販', "
      + "1, "
      + "0, "
      + "1, "
      + "0 "
      + "where not exists "
      + "(select 1 from km_import where source_type = 12 and detail = '物販')";
    execUpdate(sql);    
}
function suicaTest() {
    function importCallback() {
        done["value"] = true;
    }
    execUpdate("delete from km_import_history where source_type = 12");
    
    var importer = app.getImportModule("Suica");
    
    var importFile = utils.normalizeToFile("file/Suica.html");
    var done = {value: false};
    importer.importDb("Suica", importFile, 2, importCallback);
    utils.wait(done);

    var sql = ["select transaction_date, item_id, detail,",
               "income, expense, money_id, user_id",
               "from km_emoney_trns order by id desc"].join(" ");
    var statement = execSelect(sql);
    assert.isTrue(statement !== null);
    assert.equal("2012-11-07", statement.row.transaction_date);
    assert.equal(928, statement.row.expense);
    assert.equal(1, statement.row.item_id);
    assert.equal(2, statement.row.user_id);
    assert.equal("物販", statement.row.detail);
    statement = getNext(statement);
    statement = getNext(statement);
    assert.equal("2012-11-03", statement.row.transaction_date);
    assert.equal(130, statement.row.expense);
    assert.equal(3, statement.row.item_id);
    assert.equal(2, statement.row.user_id);
    closeStatement(statement);
    
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

