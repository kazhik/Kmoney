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

  this.listeners['km_tree_master_item.select'] = this.onSelect.bind(this);
  $$('km_tree_master_item').addEventListener("select",
    this.listeners['km_tree_master_item.select']);
  
  this.load();
};
ItemMaster.prototype.load = function() {
  this.mDb.selectQuery("select rowid, name, sum_include from km_item");
  var records = this.mDb.getRecords();
  var types = this.mDb.getRecordTypes();
  var columns = this.mDb.getColumns();

  this.mItemList = this.mDb.getRecords();

  this.mTree.populateTableData(records, columns, types);
  this.mTree.showTable(true);
  
};
ItemMaster.prototype.addRecord = function() {
  var sumInclude = ($$('km_master_sum').checked)? 1: 0;
    
  var sql = ["insert into km_item ("
    + "name, "
    + "sum_include "
    + ") values ( "
    + "'" + $$('km_edit_name').value + "', "
    + sumInclude + ")"];
  this.mDb.executeTransaction(sql);
  this.load();
  
}
ItemMaster.prototype.updateRecord = function() {
  var sumInclude = ($$('km_master_sum').checked)? 1: 0;
 
  var rowid = this.mTree.getColumnValue(0);
  var sql = ["update km_item "
    + "set "
    + "name = '" + $$('km_edit_name').value + "', "
    + "sum_include = " + sumInclude + " "
    + "where rowid = " + rowid];
  km_log(sql);
  this.mDb.executeTransaction(sql);
  this.load();
  this.mTree.ensureRowIsVisible(0, rowid);
};

ItemMaster.prototype.deleteRecord = function() {
    var itemId = this.mTree.getSelectedRowValue('master_item_id');
    if (itemId === "") {
        return;
    }
    
    // 削除する費目のトランザクションデータ、インポート設定が存在するかどうかチェック
    var sql = "select count(*) from kmv_transactions where item_id = :item_id";
             
    var stmt = this.mDb.createStatement(sql);
    if (stmt === null) {
        return;
    }
    stmt.params["item_id"] = itemId;
    this.mDb.execSelect(stmt);
    var records = this.mDb.getRecords();
    if (parseInt(records[0][0]) === 0) {
        sql = "select count(*) from km_import where item_id = :item_id";
        stmt = this.mDb.createStatement(sql);
        if (stmt === null) {
            return;
        }
        stmt.params["item_id"] = itemId;
        this.mDb.execSelect(stmt);
        records = this.mDb.getRecords();
    }

    var stmtArray = [];
    var params = {
        "item_id": itemId,
        "new_item_id": 0
        };
    var execDelete = false;
    // トランザクションデータが存在する場合はマージ先を指定させる    
    if (parseInt(records[0][0]) > 0) {
        var retVals = { itemid: null };
        
        var mergeToList = [];
        for (var i = 0; i < this.mItemList.length; i++) {
            if (this.mItemList[i][0] != itemId) {
                mergeToList.push(this.mItemList[i]);
            }
        }
        window.openDialog("chrome://kmoney/content/master/MergeDialog.xul", "MergeDialog",
            "chrome, resizable, centerscreen, modal, dialog",
            this.mDb, mergeToList, retVals);
        
        // 削除する費目のトランザクションデータとインポート設定を変更
        if (retVals['itemid'] !== null) {
            var sqlArray = [
                "update km_realmoney_trns set item_id = :new_item_id where item_id = :item_id", 
                "update km_bank_trns set item_id = :new_item_id where item_id = :item_id", 
                "update km_creditcard_trns set item_id = :new_item_id where item_id = :item_id", 
                "update km_emoney_trns set item_id = :new_item_id where item_id = :item_id",
                "update km_import set item_id = :new_item_id where item_id = :item_id"
            ];
            params["new_item_id"] = retVals['itemid'];
            for (var i = 0; i < sqlArray.length; i++) {
                km_log(sqlArray[i]);
                var updateStatement = this.mDb.createStatementWithParams(sqlArray[i], params);
                stmtArray.push(updateStatement);
            }
            
            execDelete = true;     
        }
    } else {
        execDelete = true;
    }
    
    if (execDelete) {
        sql = "delete from km_item where rowid = :item_id";
        var deleteStatement = this.mDb.createStatementWithParams(sql, params);
        km_log(sql);
        stmtArray.push(deleteStatement);
        
        this.mDb.execTransaction(stmtArray);
    }
  
    this.load();
};

ItemMaster.prototype.onSelect = function() {
  $$('km_edit_name').value = this.mTree.getColumnValue(1);
  $$('km_master_sum').checked = (Number(this.mTree.getColumnValue(2)) === 1);
 
};

