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

ImportConf.prototype.initialize = function(db, categoryMap) {
    this.mDb = db;
    this.addEventListeners();

    this.mTree.init();

    this.initUserList();    
    this.initImportTypeList();
    this.populateInternalList();
    this.initItemList(categoryMap);
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

    this.listeners['km_list_import_user.command'] = this.onSelectUser.bind(this);
    $$('km_list_import_user').addEventListener("command",
        this.listeners['km_list_import_user.command']);

    this.listeners['km_list_import_sourcetype.command'] = this.onSelectType.bind(this);
    $$('km_list_import_sourcetype').addEventListener("command",
        this.listeners['km_list_import_sourcetype.command']);

    this.listeners['km_list_import_sourcename.command'] = this.onSelectName.bind(this);
    $$('km_list_import_sourcename').addEventListener("command",
        this.listeners['km_list_import_sourcename.command']);

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

    $$('km_list_import_user').removeEventListener("command",
        this.listeners['km_list_import_user.command']);

    $$('km_list_import_sourcetype').removeEventListener("command",
        this.listeners['km_list_import_sourcetype.command']);

    $$('km_list_import_sourcename').removeEventListener("command",
        this.listeners['km_list_import_sourcename.command']);

    $$('km_tree_import_conf').removeEventListener("select",
        this.listeners['km_tree_import_conf.select']);
};
ImportConf.prototype.addRecord = function () {
    function insertCallback(id) {
        this.onSelectCondition();
    }
    // 既定値の設定は一つだけ
    var defaultId = ($$('km_checkbox_importconf_default').checked)? 1: 0;
    var userId = $$("km_list_import_user").value;
    var sourceType = $$("km_list_import_sourcetype").value;
    var sourceName = $$("km_list_import_sourcename").value;
    if (defaultId === 1 &&
        this.mDb.import.getDefaultConfId(userId, sourceType, sourceName) != 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.import.default"));
        return;
    }
    
    var params = {
        "userId": userId,
        "sourceType": sourceType,
        "sourceName": sourceName,
        "detail": $$("km_textbox_importconf_detail").value,
        "categoryId": $$('km_list_importconf_category').value,
        "defaultId": defaultId,
        "internal": $$("km_list_importconf_internal").value
    };
    
    this.mDb.import.insert(params, insertCallback.bind(this));
    
};
ImportConf.prototype.updateRecord = function () {
    function updateCallback() {
        this.onSelectCondition();
    }

    if (this.mTree.checkSelected() === false) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
        return;
    }
    
    var confId = this.mTree.getSelectedRowValue("import_conf_id");
    // 既定値の設定は一つだけ
    var defaultId = ($$('km_checkbox_importconf_default').checked)? 1: 0;
    if (defaultId === 1) {
        var userId = $$("km_list_import_user").value;
        var sourceType = $$("km_list_import_sourcetype").value;
        var sourceName = $$("km_list_import_sourcename").value;
        var defaultConfId = this.mDb.import.getDefaultConfId(userId, sourceType, sourceName);
        if (defaultConfId != 0 && defaultConfId != confId ) {
            km_alert(km_getLStr("error.title"), km_getLStr("error.import.default"));
            return;
        }
        
    }
    var params = {
        "detail": $$("km_textbox_importconf_detail").value,
        "categoryId": $$('km_list_importconf_category').value,
        "defaultId": defaultId,
        "internal": $$("km_list_importconf_internal").value
    };
    
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
    this.mDb.import.update(confId, params, updateCallback.bind(this));
    
};
ImportConf.prototype.deleteRecord = function () {
    function deleteCallback() {
        this.onSelectCondition();
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
    $$('km_list_importconf_category').value =
        this.mTree.getSelectedRowValue("import_conf_categoryid");
    $$('km_checkbox_importconf_default').checked =
        (Number(this.mTree.getSelectedRowValue("import_conf_default")) === 1);
    $$("km_list_importconf_internal").value =
        this.mTree.getSelectedRowValue("import_conf_internal");
        
};
ImportConf.prototype.initUserList = function () {
    var userList = this.mDb.userInfo.mUserList;
    
    $$('km_list_import_user').removeAllItems();
    for (var i = 0; i < userList.length; i++) {
        $$('km_list_import_user').appendItem(userList[i][1], userList[i][0]);
    }
    $$('km_list_import_user').selectedIndex = 0;
};
ImportConf.prototype.initImportTypeList = function () {
    function loadCallback(records) {
        $$('km_list_import_sourcetype').removeAllItems();
        for (var i = 0; i < records.length; i++) {
            $$('km_list_import_sourcetype').appendItem(records[i][1], records[i][0]);
        }
    }
    this.mDb.source.load(loadCallback.bind(this));
};
ImportConf.prototype.onSelectUser = function () {
};
ImportConf.prototype.onSelectType = function () {
    this.populateImportSourceNameList();
    this.onSelectCondition();
};
ImportConf.prototype.onSelectName = function () {
    this.onSelectCondition();
};
ImportConf.prototype.onSelectCondition = function () {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    var userId = $$("km_list_import_user").value;
    var type = $$("km_list_import_sourcetype").value;
    var name = $$("km_list_import_sourcename").value;
    
    if (parseInt(type) === 0) {
        return;
    }
    this.mDb.import.loadConf(userId, type, name, loadCallback.bind(this));
  
};
ImportConf.prototype.initItemList = function (categoryMap) {
    $$('km_list_importconf_category').removeAllItems();
    for (var key in categoryMap) {
        $$('km_list_importconf_category').appendItem(key, categoryMap[key]);
    }
    $$('km_list_importconf_category').selectedIndex = 0;
};
ImportConf.prototype.populateInternalList = function () {
    $$('km_list_importconf_internal').removeAllItems();
    $$('km_list_importconf_internal').appendItem(km_getLStr("internal.none"), 0);
    $$('km_list_importconf_internal').appendItem(km_getLStr("internal.self"), 1);
    $$('km_list_importconf_internal').appendItem(km_getLStr("internal.family"), 2);
    $$('km_list_importconf_internal').selectedIndex = 0;
};
ImportConf.prototype.populateImportSourceNameList = function () {
    var userId = $$("km_list_import_user").value;
    var importType = $$("km_list_import_sourcetype").selectedItem.label;

    var nameList = [];
    if (importType === km_getLStr("import.bank")) {
        nameList = this.mDb.bankInfo.getBankList(userId);
    } else if (importType === km_getLStr("import.emoney")) {
        nameList = this.mDb.emoneyInfo.getMoneyList(userId);
    } else if (importType === km_getLStr("import.creditcard")) {
        nameList = this.mDb.creditCardInfo.getCardList(userId);
    }
    if (nameList.length > 0) {
        $$("km_list_import_sourcename").hidden = false;
        
        $$("km_list_import_sourcename").removeAllItems();
        for (var i = 0; i < nameList.length; i++) {
            $$("km_list_import_sourcename").appendItem(nameList[i][1], nameList[i][1]);
        }
        $$("km_list_import_sourcename").selectedIndex = 0;
    } else {
        $$("km_list_import_sourcename").hidden = true;
    }
};