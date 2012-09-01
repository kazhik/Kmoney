"use strict";

var importConf;

function ImportConf() {
    this.mDb = null;
    
    this.listeners = [];
    
    this.mTree = new TreeViewController("km_tree_import_conf");
}

function openImportConfDialog() {
    importConf = new ImportConf();
    importConf.initialize(window.arguments[0], window.arguments[1]);
}

ImportConf.prototype.initialize = function(db, itemMap) {
    this.mDb = db;
    this.addEventListeners();

    this.mTree.init();
    
    this.initImportTypeList();
    this.initInternalList();
    this.initItemList(itemMap);
};
ImportConf.prototype.close = function () {
    window.close();
};

ImportConf.prototype.addEventListeners = function () {
    this.listeners['import_conf_add.command'] = this.addRecord.bind(this);
    $$('import_conf_add').addEventListener("command",
        this.listeners['import_conf_add.command']);

    this.listeners['import_conf_update.command'] = this.updateRecord.bind(this);
    $$('import_conf_update').addEventListener("command",
        this.listeners['import_conf_update.command']);

    this.listeners['import_conf_delete.command'] = this.deleteRecord.bind(this);
    $$('import_conf_delete').addEventListener("command",
        this.listeners['import_conf_delete.command']);
        
    this.listeners['import_conf_close.command'] = this.close.bind(this);
    $$('import_conf_close').addEventListener("command",
        this.listeners['import_conf_close.command']);

    this.listeners['km_import_select_type.select'] = this.onSelectType.bind(this);
    $$('km_import_select_type').addEventListener("select",
        this.listeners['km_import_select_type.select']);
    
    this.listeners['km_tree_import_conf.select'] = this.onSelect.bind(this);
    $$('km_tree_import_conf').addEventListener("select",
        this.listeners['km_tree_import_conf.select']);
    
};

ImportConf.prototype.addRecord = function () {
    var sourceType = $$("km_import_select_type").value;
    var detail = $$("conf_edit_detail").value;
    var itemId = $$('conf_edit_item').value;
    var defaultId = ($$('conf_edit_default').checked)? 1: 0;
    var internal = $$("conf_edit_internal").value;
    
    var sql = ["insert into km_import ("
      + "source_type, "
      + "detail, "
      + "item_id, "
      + "default_id, "
      + "permission, "
      + "internal "
      + ") values ( "
      + sourceType + ", "
      + "'" + detail + "', "
      + itemId + ", "
      + defaultId + ", "
      + "1, "
      + internal + ")"];
    this.mDb.executeTransaction(sql);
    this.onSelectType();
};
ImportConf.prototype.updateRecord = function () {
    if (this.mTree.checkSelected() === false) {
      km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
      return;
    }
    
    var rowid = this.mTree.getColumnValue(0);
    var detail = $$("conf_edit_detail").value;
    var itemId = $$('conf_edit_item').value;
    var defaultId = ($$('conf_edit_default').checked)? 1: 0;
    var internal = $$("conf_edit_internal").value;
    
    // permissionがなければdetailは変更不可
    var permission = this.mTree.getColumnValue(7);
    var orgDetail = "";
    if (permission != 0) {
        orgDetail = this.mTree.getColumnValue(2);
        if (detail != orgDetail) {
            km_alert(km_getLStr("error.title"), km_getLStr("error.update.cannotUpdate"));
            return;
        }
    }
    
    var sql = ["update km_import "
      + "set detail = '" + detail + "', "
      + "item_id = " + itemId + ", "
      + "default_id = " + defaultId + ", "
      + "internal = " + internal + " "
      + "where rowid = " + rowid];
    this.mDb.executeTransaction(sql);
    this.onSelectType();
};
ImportConf.prototype.deleteRecord = function () {
    if (this.mTree.checkSelected() === false) {
      km_alert(km_getLStr("error.title"), km_getLStr("error.delete.notSelected"));
      return;
    }

    // 削除不可
    var permission = this.mTree.getColumnValue(7);
    if (permission != 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.cannotDelete"));
    }
    
    
    var rowid = this.mTree.getColumnValue(0);
    if (rowid === "") {
      return;
    }
    var sql = ["delete from km_import where rowid = " + rowid];
    km_log(sql);
    this.mDb.executeTransaction(sql);
    
    this.onSelectType();
};

ImportConf.prototype.onSelect = function () {
    $$("conf_edit_detail").value = this.mTree.getColumnValue(2);
    $$('conf_edit_item').value = this.mTree.getColumnValue(3);
    $$('conf_edit_default').checked = (Number(this.mTree.getColumnValue(5)) === 1);
    $$("conf_edit_internal").value = this.mTree.getColumnValue(6);
        
};

ImportConf.prototype.initImportTypeList = function () {
    $$('km_import_select_type').removeAllItems();
    
    $$('km_import_select_type').appendItem(km_getLStr("import.none"), 0);

    this.mDb.selectQuery("select A.rowid, A.type from km_source A");
    var records = this.mDb.getRecords();
    for (var i = 0; i < records.length; i++) {
        $$('km_import_select_type').appendItem(records[i][1], records[i][0]);
    }
    $$("km_import_select_type").selectedIndex = 0;

};
ImportConf.prototype.onSelectType = function () {
    
    var type = $$("km_import_select_type").value;
    
    if (type === 0) {
        return;
    }
    
    this.mDb.selectQuery("select A.rowid, A.source_type, A.detail, A.item_id,"
                         + "B.name, A.default_id, A.internal, A.permission "
                         + "from km_import A "
                         + "inner join km_item B "
                         + "on A.item_id = B.rowid "
                         + "where A.source_type = " + type);
    
    var records = this.mDb.getRecords();
    var types = this.mDb.getRecordTypes();
    var columns = this.mDb.getColumns();
  
    this.mTree.PopulateTableData(records, columns, types);
    this.mTree.ShowTable(true);
};
ImportConf.prototype.initItemList = function (itemMap) {
    $$('conf_edit_item').removeAllItems();
    for (var key in itemMap) {
        $$('conf_edit_item').appendItem(key, itemMap[key]);
    }
    $$('conf_edit_item').selectedIndex = 0;
};
ImportConf.prototype.initInternalList = function () {
    $$('conf_edit_internal').removeAllItems();
    $$('conf_edit_internal').appendItem(km_getLStr("internal.none"), 0);
    $$('conf_edit_internal').appendItem(km_getLStr("internal.self"), 1);
    $$('conf_edit_internal').appendItem(km_getLStr("internal.family"), 2);
    $$('conf_edit_internal').selectedIndex = 0;
};
