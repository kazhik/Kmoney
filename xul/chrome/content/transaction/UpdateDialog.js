"use strict";

var updateDialog;

function UpdateDialog() {
    this.listeners = [];

    this.retVals = window.arguments[2];
    this.type = window.arguments[0];

    this.addEventListeners();  

    this.populateItemList(this.type, window.arguments[1]);
};

function openUpdateDialog() {
    updateDialog = new UpdateDialog();
};

UpdateDialog.prototype.onAccept = function () {
    if (this.type === "detail") {
        this.retVals['newValue'] = $$('km_update_textbox').value;
    } else {
        this.retVals['newValue'] = $$('km_update_menulist').value;
    }
    this.removeEventListeners();
};

UpdateDialog.prototype.onCancel = function () {
    this.retVals['newValue'] = null;

    this.removeEventListeners();
};


UpdateDialog.prototype.addEventListeners = function () {
    this.listeners['km_dialog_update.dialogaccept'] = this.onAccept.bind(this);
    $$('km_dialog_update').addEventListener("dialogaccept",
        this.listeners['km_dialog_update.dialogaccept']);

    this.listeners['km_dialog_update.dialogcancel'] = this.onCancel.bind(this);
    $$('km_dialog_update').addEventListener("dialogcancel",
        this.listeners['km_dialog_update.dialogcancel']);

};
UpdateDialog.prototype.removeEventListeners = function () {

    $$('km_dialog_update').removeEventListener("dialogaccept",
        this.listeners['km_dialog_update.dialogaccept']);

    $$('km_dialog_update').removeEventListener("dialogcancel",
        this.listeners['km_dialog_update.dialogcancel']);
};

UpdateDialog.prototype.populateItemList = function (type, categoryList) {
    if (type === "detail") {
        hideElements(["menulistbox"]);
        showElements(["textbox"]);
        $$('update_text').value = km_getLStr("query_condition.detail");
        $$('km_update_textbox').value = "";

    } else {
        showElements(["menulistbox"]);
        hideElements(["textbox"]);
        if (type === "category") {
            $$('update_menulist').value = km_getLStr("query_condition.category");
        } else if (type === "user") {
            $$('update_menulist').value = km_getLStr("query_condition.user");
        } else if (type === "bank") {
            $$('update_menulist').value = km_getLStr("query_condition.bank");
        } else if (type === "creditcard") {
            $$('update_menulist').value = km_getLStr("query_condition.creditcard");
        } else if (type === "emoney") {
            $$('update_menulist').value = km_getLStr("query_condition.emoney");
        }

        $$('km_update_menulist').removeAllItems();
    
        for (var i = 0; i < categoryList.length; i++) {
            $$('km_update_menulist').appendItem(categoryList[i].label, categoryList[i].value);
        }
        
        $$('km_update_menulist').selectedIndex = 0;
    }
};
