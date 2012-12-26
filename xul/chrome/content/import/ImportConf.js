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
    this.listeners['km_button_importconf_add.command'] = this.addRecord.bind(this);
    $$('km_button_importconf_add').addEventListener("command",
        this.listeners['km_button_importconf_add.command']);

    this.listeners['km_button_importconf_update.command'] = this.updateRecord.bind(this);
    $$('km_button_importconf_update').addEventListener("command",
        this.listeners['km_button_importconf_update.command']);

    this.listeners['km_button_importconf_delete.command'] = this.deleteRecord.bind(this);
    $$('km_button_importconf_delete').addEventListener("command",
        this.listeners['km_button_importconf_delete.command']);
        
    this.listeners['km_button_importconf_close.command'] = this.close.bind(this);
    $$('km_button_importconf_close').addEventListener("command",
        this.listeners['km_button_importconf_close.command']);

    this.listeners['km_list_importconf_type.command'] = this.onSelectType.bind(this);
    $$('km_list_importconf_type').addEventListener("command",
        this.listeners['km_list_importconf_type.command']);
    
    this.listeners['km_tree_import_conf.select'] = this.onSelect.bind(this);
    $$('km_tree_import_conf').addEventListener("select",
        this.listeners['km_tree_import_conf.select']);
    
};
ImportConf.prototype.removeEventListeners = function () {
    $$('km_button_importconf_add').removeEventListener("command",
        this.listeners['km_button_importconf_add.command']);

    $$('km_button_importconf_update').removeEventListener("command",
        this.listeners['km_button_importconf_update.command']);

    $$('km_button_importconf_delete').removeEventListener("command",
        this.listeners['km_button_importconf_delete.command']);
        
    $$('km_button_importconf_close').removeEventListener("command",
        this.listeners['km_button_importconf_close.command']);

    $$('km_list_importconf_type').removeEventListener("command",
        this.listeners['km_list_importconf_type.command']);

    $$('km_tree_import_conf').removeEventListener("select",
        this.listeners['km_tree_import_conf.select']);
};
ImportConf.prototype.addRecord = function () {
    function insertCallback(id) {
        this.onSelectType();
    }
    var params = {
        "sourceType": $$("km_list_importconf_type").value,
        "detail": $$("km_textbox_importconf_detail").value,
        "itemId": $$('km_list_importconf_item').value,
        "defaultId": ($$('km_checkbox_importconf_default').checked)? 1: 0,
        "internal": $$("km_list_importconf_internal").value
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
        "detail": $$("km_textbox_importconf_detail").value,
        "itemId": $$('km_list_importconf_item').value,
        "defaultId": ($$('km_checkbox_importconf_default').checked)? 1: 0,
        "internal": $$("km_list_importconf_internal").value
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
    if (parseInt(permission) === 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.cannotDelete"));
    }
    
    var id = this.mTree.getSelectedRowValue("import_conf_id");
    if (id === "") {
        return;
    }
    this.mDb.import.delete(id, deleteCallback.bind(this));
    
};

ImportConf.prototype.onSelect = function () {
    $$("km_textbox_importconf_detail").value =
        this.mTree.getSelectedRowValue("import_conf_detail");
    $$('km_list_importconf_item').value =
        this.mTree.getSelectedRowValue("import_conf_itemid");
    $$('km_checkbox_importconf_default').checked =
        (Number(this.mTree.getSelectedRowValue("import_conf_default")) === 1);
    $$("km_list_importconf_internal").value =
        this.mTree.getSelectedRowValue("import_conf_internal");
        
};

ImportConf.prototype.initImportTypeList = function () {
    function loadCallback(records) {
        $$('km_list_importconf_type').removeAllItems();
        for (var i = 0; i < records.length; i++) {
            $$('km_list_importconf_type').appendItem(records[i][1], records[i][0]);
        }
    }
    this.mDb.source.load(loadCallback.bind(this));
};
ImportConf.prototype.onSelectType = function () {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    var type = $$("km_list_importconf_type").value;
    
    if (parseInt(type) === 0) {
        return;
    }
    this.mDb.import.loadConf(type, loadCallback.bind(this));
  
};
ImportConf.prototype.initItemList = function (itemMap) {
    $$('km_list_importconf_item').removeAllItems();
    for (var key in itemMap) {
        $$('km_list_importconf_item').appendItem(key, itemMap[key]);
    }
    $$('km_list_importconf_item').selectedIndex = 0;
};
ImportConf.prototype.populateInternalList = function () {
    $$('km_list_importconf_internal').removeAllItems();
    $$('km_list_importconf_internal').appendItem(km_getLStr("internal.none"), 0);
    $$('km_list_importconf_internal').appendItem(km_getLStr("internal.self"), 1);
    $$('km_list_importconf_internal').appendItem(km_getLStr("internal.family"), 2);
    $$('km_list_importconf_internal').selectedIndex = 0;
};
