"use strict";

var selectDbDialog;

function SelectDbDialog() {
    this.listeners = [];
    this.retVals = window.arguments[0];
    this.addEventListeners();  
};

function openSelectDbDialog() {
    selectDbDialog = new SelectDbDialog();
};

SelectDbDialog.prototype.addEventListeners = function () {
    this.listeners['km_dialog_selectdb.dialogaccept'] = this.onAccept.bind(this);
    $$('km_dialog_selectdb').addEventListener("dialogaccept",
        this.listeners['km_dialog_selectdb.dialogaccept']);

    this.listeners['km_dialog_selectdb.dialogcancel'] = this.onCancel.bind(this);
    $$('km_dialog_selectdb').addEventListener("dialogcancel",
        this.listeners['km_dialog_selectdb.dialogcancel']);

};
SelectDbDialog.prototype.removeEventListeners = function () {

    $$('km_dialog_selectdb').removeEventListener("dialogaccept",
        this.listeners['km_dialog_selectdb.dialogaccept']);

    $$('km_dialog_selectdb').removeEventListener("dialogcancel",
        this.listeners['km_dialog_selectdb.dialogcancel']);
};

SelectDbDialog.prototype.onAccept = function () {
    this.retVals["db"] = $$("km_radgroup_db").selectedItem.value;
    this.removeEventListeners();
};

SelectDbDialog.prototype.onCancel = function () {
    this.retVals["db"] = null;
    this.removeEventListeners();
};

