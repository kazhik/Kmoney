"use strict";

var mergeDialog;

function MergeDialog() {
    this.listeners = [];

    this.retVals = window.arguments[1];

    this.addEventListeners();  

    this.populateItemList(window.arguments[0]);
};

function openMergeDialog() {
    mergeDialog = new MergeDialog();
};

MergeDialog.prototype.onAccept = function () {
    this.removeEventListeners();
};

MergeDialog.prototype.onCancel = function () {
    this.retVals['itemid'] = null;

    this.removeEventListeners();
};


MergeDialog.prototype.addEventListeners = function () {
    this.listeners['km_merge_item.command'] = this.onSelectItem.bind(this);
    $$('km_merge_item').addEventListener("command",
        this.listeners['km_merge_item.command']);

    this.listeners['km_dialog_merge.dialogaccept'] = this.onAccept.bind(this);
    $$('km_dialog_merge').addEventListener("dialogaccept",
        this.listeners['km_dialog_merge.dialogaccept']);

    this.listeners['km_dialog_merge.dialogcancel'] = this.onCancel.bind(this);
    $$('km_dialog_merge').addEventListener("dialogcancel",
        this.listeners['km_dialog_merge.dialogcancel']);

};
MergeDialog.prototype.removeEventListeners = function () {
    $$('km_merge_item').removeEventListener("command",
        this.listeners['km_merge_item.command']);

    $$('km_dialog_merge').removeEventListener("dialogaccept",
        this.listeners['km_dialog_merge.dialogaccept']);

    $$('km_dialog_merge').removeEventListener("dialogcancel",
        this.listeners['km_dialog_merge.dialogcancel']);
};

MergeDialog.prototype.populateItemList = function (itemList) {
    $$('km_merge_item').removeAllItems();

    for (var i = 0; i < itemList.length; i++) {
        $$('km_merge_item').appendItem(itemList[i][1], itemList[i][0]);
    }
    
    $$('km_merge_item').selectedIndex = 0;
};
MergeDialog.prototype.onSelectItem = function () {
    this.retVals['itemid'] = $$("km_merge_item").value;
};