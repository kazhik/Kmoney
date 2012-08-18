"use strict";

var importDialog;

var retVals = { file: null, importtype: null, user: null };

function ImportDialog() {
    this.listeners = [];

    this.mDb = window.arguments[0];
    this.importTypeList = window.arguments[1];
    this.users = window.arguments[2];
    retVals = window.arguments[3];

    this.populateImportTypeList();
    this.populateUserList();

    this.addEventListeners();  
};

function openImportDialog() {
    importDialog = new ImportDialog();
};


function onAccept() {
    return true;    
};
function onCancel() {
    retVals['importtype'] = null;
    retVals['file'] = null;
    retVals['user'] = null;
    return true;    
};
ImportDialog.prototype.addEventListeners = function () {
    this.listeners['km_button_importfrom.command'] = this.selectFile.bind(this);
    $$('km_button_importfrom').addEventListener("command",
        this.listeners['km_button_importfrom.command']);

    this.listeners['km_select_importtype.select'] = this.onSelectImportType.bind(this);
    $$('km_select_importtype').addEventListener("select",
        this.listeners['km_select_importtype.select']);
    
    this.listeners['km_select_user.select'] = this.onSelectUser.bind(this);
    $$('km_select_user').addEventListener("select",
        this.listeners['km_select_user.select']);
};
ImportDialog.prototype.onSelectImportType = function () {
    retVals['importtype'] = $$("km_select_importtype").value;
};
ImportDialog.prototype.onSelectUser = function () {
    retVals['user'] = $$("km_select_user").value;
};
ImportDialog.prototype.selectFile = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("import.title"), nsIFilePicker.modeOpen);
    
    var importType = this.importTypeList[retVals["importtype"]];
    fp.appendFilter(
        importType["label"] + "(" + importType["ext"] + ")",
        importType["ext"]);
    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        retVals['file'] = fp.file;
        $$('km_edit_importfrom').value = fp.file.path;
    }
};

ImportDialog.prototype.populateImportTypeList = function () {
    $$("km_select_importtype").removeAllItems();

    for (var key in this.importTypeList) {
        $$("km_select_importtype").appendItem(this.importTypeList[key]['label'], key);
    }
    $$('km_select_importtype').selectedIndex = 0;
    this.onSelectImportType();
};
ImportDialog.prototype.populateUserList = function () {
    $$('km_select_user').removeAllItems();

    for (var key in this.users) {
        $$('km_select_user').appendItem(this.users[key], key);
    }
    
    $$('km_select_user').selectedIndex = 0;
    this.onSelectUser();
};
