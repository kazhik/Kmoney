"use strict";

var importDialog;

var retVals = { file: null, importtype: null };

function ImportDialog() {
    
    this.listeners = [];

    this.itemList = [
      {'label': km_getLStr("import.bank"),  'value': 'bank'},
      {'label': km_getLStr("import.mizuho"),  'value': 'mizuho'},
      {'label': km_getLStr("import.shinsei"),  'value': 'shinsei'},

      {'label': km_getLStr("import.creditcard"),  'value': 'creditcard'},
      {'label': km_getLStr("import.saison"),  'value': 'saison'},
      {'label': km_getLStr("import.uc"),  'value': 'uc'},
      {'label': km_getLStr("import.view"),  'value': 'view'},

      {'label': km_getLStr("import.emoney"),  'value': 'emoney'},
      {'label': km_getLStr("import.suica"),  'value': 'suica'},

      {'label': km_getLStr("import.kantan"),  'value': 'kantan'}
    ];
    
    $$("km_select_importtype").removeAllItems();

    for (var i = 0; i < this.itemList.length; i++) {
        $$("km_select_importtype").appendItem(this.itemList[i]['label'],
            this.itemList[i]['value']);
    }
    $$("km_select_importtype").selectedIndex = 0;
    
    retVals = window.arguments[0];

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
