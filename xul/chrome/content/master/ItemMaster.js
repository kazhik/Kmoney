"use strict";

function ItemMaster() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_master_item");
    this.mItemList = null;
    this.listeners = [];
};
ItemMaster.prototype.initialize = function(db) {
    this.mDb = db;
    
    this.mTree.init(this, this.load.bind(this));
  
    this.listeners['km_tree_master_item.command'] = this.onSelect.bind(this);
    $$('km_tree_master_item').addEventListener("command",
      this.listeners['km_tree_master_item.command']);
    
    this.load();
};
ItemMaster.prototype.terminate = function() {
    $$('km_tree_master_item').removeEventListener("command",
      this.listeners['km_tree_master_item.command']);
};
ItemMaster.prototype.load = function() {
    function loadCallback(records, columns) {
        this.mItemList = records;
      
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    km_debug("ItemMaster.load");
    this.mDb.itemInfo.loadMaster(loadCallback.bind(this));
};
ItemMaster.prototype.addRecord = function() {
    function insertCallback(id) {
        this.load();
        this.mTree.ensureRowIsVisible('master_item_id', id);
    }
    
    var name = $$('km_edit_name').value;
    var sumInclude = ($$('km_master_sum').checked)? 1: 0;
    this.mDb.itemInfo.insert(name, sumInclude, insertCallback.bind(this));
};

ItemMaster.prototype.updateRecord = function() {
    function updateCallback() {
        this.load();
        this.mTree.ensureRowIsVisible('master_item_id', id);
    }
    var name = $$('km_edit_name').value;
    var sumInclude = ($$('km_master_sum').checked)? 1: 0;
   
    var id = this.mTree.getSelectedRowValue('master_item_id');
    
    this.mDb.itemInfo.update(id, name, sumInclude, updateCallback.bind(this));
    
};

ItemMaster.prototype.openMergeDialog = function() {
    var retVals = { itemid: null };
    
    var mergeToList = [];
    for (var i = 0; i < this.mItemList.length; i++) {
        if (this.mItemList[i][0] != itemId) {
            mergeToList.push(this.mItemList[i]);
        }
    }
    window.openDialog("chrome://kmoney/content/master/MergeDialog.xul", "MergeDialog",
        "chrome, resizable, centerscreen, modal, dialog", mergeToList, retVals);
    return retVals['itemid'];
};
ItemMaster.prototype.deleteRecord = function() {
    function checkTrnsCallback(count) {
        function checkImportCallback(count) {
            function deleteCallback() {
                this.load();
                
            }
            var newItemId = null;
            // トランザクションデータが存在する場合はマージ先を指定させる
            if (count > 0) {
                newItemId = this.openMergeDialog();
            }
            this.mDb.itemInfo.delete(itemId, newItemId, deleteCallback.bind(this));
        }
        if (count === 0) {
            this.mDb.import.checkItem(itemId, checkImportCallback.bind(this));
        }
        checkImportCallback(1);
    }                   
    var itemId = this.mTree.getSelectedRowValue('master_item_id');
    if (itemId === "") {
        return;
    }
    // 削除する費目のトランザクションデータ、インポート設定が存在するかどうかチェック
    this.mDb.transactions.checkItem(itemId, checkTrnsCallback.bind(this));

};

ItemMaster.prototype.onSelect = function() {
    $$('km_edit_name').value = this.mTree.getSelectedRowValue("master_item_name");
    $$('km_master_sum').checked =
        (Number(this.mTree.getSelectedRowValue("master_item_sum_value")) === 1);
 
};

