"use strict";

function CategoryMaster() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_master_category");
    this.mItemList = null;
    this.listeners = [];
};
CategoryMaster.prototype.initialize = function(db) {
    this.mDb = db;
    
    this.mTree.init(this, this.load.bind(this));
  
    this.listeners['km_tree_master_category.select'] = this.onSelect.bind(this);
    $$('km_tree_master_category').addEventListener("select",
      this.listeners['km_tree_master_category.select']);
    
    this.load();
};
CategoryMaster.prototype.terminate = function() {
    $$('km_tree_master_category').removeEventListener("select",
      this.listeners['km_tree_master_category.select']);
};
CategoryMaster.prototype.load = function() {
    function loadCallback(records, columns) {
        this.mItemList = records;
      
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    km_debug("CategoryMaster.load");
    this.mDb.category.loadMaster(loadCallback.bind(this));
};
CategoryMaster.prototype.addRecord = function() {
    function insertCallback(id) {
        this.load();
        this.mTree.ensureRowIsVisible('master_category_id', id);
    }
    
    var name = $$('km_textbox_name').value;
    var sumInclude = ($$('km_master_sum').checked)? 1: 0;
    this.mDb.category.insert(name, sumInclude, insertCallback.bind(this));
};

CategoryMaster.prototype.updateRecord = function() {
    function updateCallback() {
        this.load();
        this.mTree.ensureRowIsVisible('master_category_id', id);
    }
    var name = $$('km_textbox_name').value;
    var sumInclude = ($$('km_master_sum').checked)? 1: 0;
   
    var id = this.mTree.getSelectedRowValue('master_category_id');
    
    this.mDb.category.update(id, name, sumInclude, updateCallback.bind(this));
    
};

CategoryMaster.prototype.openMergeDialog = function(categoryId) {
    var retVals = { categoryid: null };
    
    var mergeToList = [];
    for (var i = 0; i < this.mItemList.length; i++) {
        if (this.mItemList[i][0] != categoryId) {
            mergeToList.push(this.mItemList[i]);
        }
    }
    window.openDialog("chrome://kmoney/content/master/MergeDialog.xul", "MergeDialog",
        "chrome, resizable, centerscreen, modal, dialog", mergeToList, retVals);
    return retVals['categoryid'];
};
CategoryMaster.prototype.deleteRecord = function() {
    function checkTrnsCallback(count) {
        function deleteCallback() {
            function deleteImportCallback() {
                this.load();
            }
            // インポート設定も削除
            this.mDb.import.deleteItem(categoryId, deleteImportCallback.bind(this));
        }
        
        var newItemId = null;
        // トランザクションデータが存在する場合はマージ先を指定させる
        if (count > 0) {
            newItemId = this.openMergeDialog(categoryId);
            if (newItemId === null) {
                return;
            }
        }
        this.mDb.category.delete(categoryId, newItemId, deleteCallback.bind(this));
    }                   
    var categoryId = this.mTree.getSelectedRowValue('master_category_id');
    if (categoryId === "") {
        return;
    }
    // 削除する費目のトランザクションデータが存在するかどうかチェック
    this.mDb.transactions.checkItem(categoryId, checkTrnsCallback.bind(this));

};

CategoryMaster.prototype.onSelect = function() {
    $$('km_textbox_name').value = this.mTree.getSelectedRowValue("master_category_name");
    $$('km_master_sum').checked =
        (Number(this.mTree.getSelectedRowValue("master_category_sum_value")) === 1);
 
};

