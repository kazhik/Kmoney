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
    this.populateInternalList();
    this.initItemList(itemMap);
};
ImportConf.prototype.close = function () {
    this.removeEventListeners();
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

    this.listeners['km_import_select_type.command'] = this.onSelectType.bind(this);
    $$('km_import_select_type').addEventListener("command",
        this.listeners['km_import_select_type.command']);
    
    this.listeners['km_tree_import_conf.select'] = this.onSelect.bind(this);
    $$('km_tree_import_conf').addEventListener("select",
        this.listeners['km_tree_import_conf.select']);
    
};
ImportConf.prototype.removeEventListeners = function () {
    $$('import_conf_add').removeEventListener("command",
        this.listeners['import_conf_add.command']);

    $$('import_conf_update').removeEventListener("command",
        this.listeners['import_conf_update.command']);

    $$('import_conf_delete').removeEventListener("command",
        this.listeners['import_conf_delete.command']);
        
    $$('import_conf_close').removeEventListener("command",
        this.listeners['import_conf_close.command']);

    $$('km_import_select_type').removeEventListener("command",
        this.listeners['km_import_select_type.command']);

    $$('km_tree_import_conf').removeEventListener("select",
        this.listeners['km_tree_import_conf.select']);
};
ImportConf.prototype.addRecord = function () {
    function insertCallback(id) {
        this.onSelectType();
    }
    var params = {
        "sourceType": $$("km_import_select_type").value,
        "detail": $$("conf_edit_detail").value,
        "itemId": $$('conf_edit_item').value,
        "defaultId": ($$('conf_edit_default').checked)? 1: 0,
        "internal": $$("conf_edit_internal").value
    };
    
    this.mDb.import.insert(params, insertCallback.bind(this));
    
};
ImportConf.prototype.updateRecord = function () {
    function updateCallback() {
        this.onSelectType();
    }

    if (this.mTree.checkSelected() === false) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
        return;
    }
    
    var params = {
        "detail": $$("conf_edit_detail").value,
        "itemId": $$('conf_edit_item').value,
        "defaultId": ($$('conf_edit_default').checked)? 1: 0,
        "internal": $$("conf_edit_internal").value
    };
    var id = this.mTree.getSelectedRowValue("import_conf_id");
    
    // permissionがなければdetailは変更不可
    var permission = this.mTree.getSelectedRowValue("import_conf_permission");
    var orgDetail = "";
    if (parseInt(permission) !== 0) {
        orgDetail = this.mTree.getSelectedRowValue("import_conf_detail");
        if (params["detail"] !== orgDetail) {
            km_alert(km_getLStr("error.title"), km_getLStr("error.update.cannotUpdate"));
            return;
        }
    }
    this.mDb.import.update(id, params, updateCallback.bind(this));
    
};
ImportConf.prototype.deleteRecord = function () {
    function deleteCallback() {
        this.onSelectType();
    }

    if (this.mTree.checkSelected() === false) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.delete.notSelected"));
        return;
    }

    // 削除不可
    var permission = this.mTree.getSelectedRowValue("import_conf_permission");
    if (parseInt(permission) !== 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.cannotDelete"));
    }
    
    var id = this.mTree.getSelectedRowValue("import_conf_id");
    if (id === "") {
        return;
    }
    this.mDb.import.delete(id, deleteCallback.bind(this));
    
};

ImportConf.prototype.onSelect = function () {
    $$("conf_edit_detail").value =
        this.mTree.getSelectedRowValue("import_conf_detail");
    $$('conf_edit_item').value =
        this.mTree.getSelectedRowValue("import_conf_itemid");
    $$('conf_edit_default').checked =
        (Number(this.mTree.getSelectedRowValue("import_conf_default")) === 1);
    $$("conf_edit_internal").value =
        this.mTree.getSelectedRowValue("import_conf_internal");
        
};

ImportConf.prototype.initImportTypeList = function () {
    function loadCallback(records) {
        $$('km_import_select_type').removeAllItems();
        for (var i = 0; i < records.length; i++) {
            $$('km_import_select_type').appendItem(records[i][1], records[i][0]);
        }
    }
    this.mDb.source.load(loadCallback.bind(this));
};
ImportConf.prototype.onSelectType = function () {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    var type = $$("km_import_select_type").value;
    
    if (parseInt(type) === 0) {
        return;
    }
    this.mDb.import.loadConf(type, loadCallback.bind(this));
  
};
ImportConf.prototype.initItemList = function (itemMap) {
    $$('conf_edit_item').removeAllItems();
    for (var key in itemMap) {
        $$('conf_edit_item').appendItem(key, itemMap[key]);
    }
    $$('conf_edit_item').selectedIndex = 0;
};
ImportConf.prototype.populateInternalList = function () {
    $$('conf_edit_internal').removeAllItems();
    $$('conf_edit_internal').appendItem(km_getLStr("internal.none"), 0);
    $$('conf_edit_internal').appendItem(km_getLStr("internal.self"), 1);
    $$('conf_edit_internal').appendItem(km_getLStr("internal.family"), 2);
    $$('conf_edit_internal').selectedIndex = 0;
};
