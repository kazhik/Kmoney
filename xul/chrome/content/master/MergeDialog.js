"use strict";

var mergeDialog;

var retVals = { itemid: null };

function MergeDialog() {
    this.listeners = [];

    this.mDb = window.arguments[0];
    retVals = window.arguments[2];

    this.addEventListeners();  

    this.populateItemList(window.arguments[1]);
};

function openMergeDialog() {
    mergeDialog = new MergeDialog();
};

function onAccept() {
    return true;    
};
function onCancel() {
    retVals['itemid'] = null;
    return true;    
};
MergeDialog.prototype.addEventListeners = function () {
    this.listeners['km_merge_item.command'] = this.onSelectItem.bind(this);
    $$('km_merge_item').addEventListener("command",
        this.listeners['km_merge_item.command']);
};
MergeDialog.prototype.populateItemList = function (itemList) {
    $$('km_merge_item').removeAllItems();

    for (var i = 0; i < itemList.length; i++) {
        $$('km_merge_item').appendItem(itemList[i][1], itemList[i][0]);
    }
    
    $$('km_merge_item').selectedIndex = 0;
};
MergeDialog.prototype.onSelectItem = function () {
    retVals['itemid'] = $$("km_merge_item").value;
};