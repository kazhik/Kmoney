"use strict";

var importDialog;
    
function ImportDialog() {
    this.listeners = [];

    this.mDb = window.arguments[0];
    this.importTypeList = window.arguments[1];
    this.users = window.arguments[2];
    this.retVals = window.arguments[3];

    this.populateUserList();
    this.populateImportTypeList();

    this.addEventListeners();  
};

function openImportDialog() {
    importDialog = new ImportDialog();
};


ImportDialog.prototype.onAccept = function () {
    this.removeEventListeners();
};

ImportDialog.prototype.onCancel = function () {
    this.retVals['importtype'] = null;
    this.retVals['file'] = null;
    this.retVals['user'] = null;
    this.retVals['name'] = null;

    this.removeEventListeners();
};

ImportDialog.prototype.addEventListeners = function () {
    this.listeners['km_button_importfrom.command'] = this.selectFile.bind(this);
    $$('km_button_importfrom').addEventListener("command",
        this.listeners['km_button_importfrom.command']);

    this.listeners['km_list_importtype.command'] = this.onSelectImportType.bind(this);
    $$('km_list_importtype').addEventListener("command",
        this.listeners['km_list_importtype.command']);
    
    this.listeners['km_list_user.command'] = this.onSelectUser.bind(this);
    $$('km_list_user').addEventListener("command",
        this.listeners['km_list_user.command']);
    
    this.listeners['km_list_source.command'] = this.onSelectSource.bind(this);
    $$('km_list_source').addEventListener("command",
        this.listeners['km_list_source.command']);

    this.listeners['km_dialog_import.dialogaccept'] = this.onAccept.bind(this);
    $$('km_dialog_import').addEventListener("dialogaccept",
        this.listeners['km_dialog_import.dialogaccept']);

    this.listeners['km_dialog_import.dialogcancel'] = this.onCancel.bind(this);
    $$('km_dialog_import').addEventListener("dialogcancel",
        this.listeners['km_dialog_import.dialogcancel']);

};

ImportDialog.prototype.removeEventListeners = function () {
    $$('km_button_importfrom').removeEventListener("command",
        this.listeners['km_button_importfrom.command']);

    $$('km_list_importtype').removeEventListener("command",
        this.listeners['km_list_importtype.command']);
    
    $$('km_list_user').removeEventListener("command",
        this.listeners['km_list_user.command']);
    
    $$('km_list_source').removeEventListener("command",
        this.listeners['km_list_source.command']);

    $$('km_dialog_import').removeEventListener("dialogaccept",
        this.listeners['km_dialog_import.dialogaccept']);

    $$('km_dialog_import').removeEventListener("dialogcancel",
        this.listeners['km_dialog_import.dialogcancel']);
};
ImportDialog.prototype.populateSourceList = function () {
    var importType = $$("km_list_importtype").value;

    var nameList = [];
    if (importType === km_getLStr("import.bank")) {
        nameList = this.mDb.bankInfo.getBankList(this.retVals['user']);
    } else if (importType === km_getLStr("import.emoney")) {
        nameList = this.mDb.emoneyInfo.getMoneyList(this.retVals['user']);
    } else if (importType === km_getLStr("import.creditcard")) {
        nameList = this.mDb.creditCardInfo.getCardList(this.retVals['user']);
    }
    if (nameList.length > 0) {
        $$("km_list_source").hidden = false;
        
        $$("km_list_source").removeAllItems();
        for (var i = 0; i < nameList.length; i++) {
            $$("km_list_source").appendItem(nameList[i][1], nameList[i][1]);
        }
        $$("km_list_source").selectedIndex = 0;
        this.retVals['name'] = $$("km_list_source").value;
    } else {
        $$("km_list_source").hidden = true;
        this.retVals['name'] = importType;
    }
};
ImportDialog.prototype.onSelectImportType = function () {
    this.retVals['importtype'] = $$("km_list_importtype").value;
    this.populateSourceList();    
};
ImportDialog.prototype.onSelectUser = function () {
    this.retVals['user'] = $$("km_list_user").value;
    this.populateSourceList();    
};
ImportDialog.prototype.onSelectSource = function () {
    this.retVals['name'] = $$("km_list_source").value;
};
ImportDialog.prototype.selectFile = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("import.title"), nsIFilePicker.modeOpen);
    
    var importType = this.importTypeList[this.retVals["importtype"]];
    fp.appendFilter(
        importType["label"] + "(" + importType["ext"] + ")",
        importType["ext"]);
    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        this.retVals['file'] = fp.file;
        $$('km_textbox_importfrom').value = fp.file.path;
    }
};

ImportDialog.prototype.populateImportTypeList = function () {
    $$("km_list_importtype").removeAllItems();

    for (var key in this.importTypeList) {
        $$("km_list_importtype").appendItem(this.importTypeList[key]['label'], key);
    }
    $$('km_list_importtype').selectedIndex = 0;
    this.onSelectImportType();
};
ImportDialog.prototype.populateUserList = function () {
    $$('km_list_user').removeAllItems();

    for (var key in this.users) {
        $$('km_list_user').appendItem(key, this.users[key]);
    }
    
    $$('km_list_user').selectedIndex = 0;
    this.onSelectUser();
};
