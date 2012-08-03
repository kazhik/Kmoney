"use strict";

var importDialog;

var retVals = { file: null, importtype: null };

function ImportDialog() {
    this.mDb = null;
    this.importTypeList = {};

    this.importTypeList["bank"] =
        {"label": km_getLStr("import.bank"), "ext": "*.csv"};
    this.importTypeList["mizuho"] =
        {"label": km_getLStr("import.mizuho"), "ext": "*.ofx"};
    this.importTypeList["shinsei"] =
        {"label": km_getLStr("import.shinsei"), "ext": "*.csv"};
    this.importTypeList["creditcard"] =
        {"label": km_getLStr("import.creditcard"), "ext": "*.csv"};
    this.importTypeList["saison"] =
        {"label": km_getLStr("import.saison"), "ext": "*.csv"};
    this.importTypeList["uc"] =
        {"label": km_getLStr("import.uc"), "ext": "*.csv"};
    this.importTypeList["view"] =
        {"label": km_getLStr("import.view"), "ext": "*.html"};
    this.importTypeList["emoney"] =
        {"label": km_getLStr("import.emoney"), "ext": "*.csv"};
    this.importTypeList["suica"] =
        {"label": km_getLStr("import.suica"), "ext": "*.html"};
    this.importTypeList["kantan"] =
        {"label": km_getLStr("import.kantan"), "ext": "*.db"};
    
    this.listeners = [];

    this.mDb = window.arguments[0];
    retVals = window.arguments[1];

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
    return true;    
};
ImportDialog.prototype.addEventListeners = function () {
    this.listeners['km_button_importfrom.command'] = this.selectFile.bind(this);
    $$('km_button_importfrom').addEventListener("command",
        this.listeners['km_button_importfrom.command']);

    this.listeners['km_select_importtype.select'] = this.onSelectImportType.bind(this);
    $$('km_select_importtype').addEventListener("select",
        this.listeners['km_select_importtype.select']);
};
ImportDialog.prototype.onSelectImportType = function () {
    retVals['importtype'] = $$("km_select_importtype").value;
};
ImportDialog.prototype.selectFile = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("import.title"), nsIFilePicker.modeOpen);
    
    var importType = this.importTypeList[retVals["importtype"]];
    fp.appendFilter(
        importType["label"] + "(" + importType["ext"] + ")",
        importType["ext"]);
/*    
    fp.appendFilter(km_getLStr("import.suica") + " (*.html)", "*.html");
    fp.appendFilter(km_getLStr("import.saison") + " (*.csv)", "*.csv");
    fp.appendFilter(km_getLStr("import.uc") + " (*.csv)", "*.csv");
    fp.appendFilter(km_getLStr("import.kantan") + " (*.db)", "*.db");
*/
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
    $$("km_select_importtype").selectedIndex = 0;
    
};
ImportDialog.prototype.populateUserList = function () {
    $$('km_select_user').removeAllItems();

    this.mDb.selectQuery("select id, name from km_user");
    var records = this.mDb.getRecords();

    for (var i = 0; i < records.length; i++) {
        $$('km_select_user').appendItem(records[i][1], records[i][0]);
    }

    $$('km_select_user').selectedIndex = 0;

};
