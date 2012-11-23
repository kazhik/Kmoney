"use strict";

function UserMaster() {
    this.mDb = null;
    this.mUserList = null;
    this.mTree = new TreeViewController("km_tree_master_user");
    this.listeners = [];
};
UserMaster.prototype.initialize = function (db) {
    km_debug("UserMaster.initialize start");
    this.mDb = db;

    this.mTree.init(this, this.load.bind(this));

    this.listeners['km_tree_master_user.select'] = this.onSelect.bind(this);
    $$('km_tree_master_user').addEventListener("select",
        this.listeners['km_tree_master_user.select']);

    this.load();
    km_debug("UserMaster.initialize end");
};
UserMaster.prototype.terminate = function () {
    $$('km_tree_master_user').removeEventListener("select",
        this.listeners['km_tree_master_user.select']);
};

UserMaster.prototype.load = function () {
    function loadCallback(records, columns) {
        this.mUserList = records;
    
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    km_debug("UserMaster.load");
    this.mDb.userInfo.load(loadCallback.bind(this));
};
UserMaster.prototype.addRecord = function () {
    function insertCallback() {
        this.load();
    }
    var name = $$('km_edit_name').value;
    this.mDb.userInfo.insert(name, insertCallback.bind(this));

}
UserMaster.prototype.updateRecord = function () {
    function updateCallback() {
        this.load();
        this.mTree.ensureRowIsVisible("master_user_id", id);
    }
    var id = this.mTree.getSelectedRowValue("master_user_id");
    var name = $$('km_edit_name').value;
    this.mDb.userInfo.update(id, name, updateCallback.bind(this));
};

UserMaster.prototype.deleteRecord = function () {
    function updateCallback() {
        this.load();
    }
    var id = this.mTree.getSelectedRowValue("master_user_id");
    if (id === "") {
        return;
    }
    this.mDb.userInfo.delete(id, deleteCallback.bind(this));
};

UserMaster.prototype.onSelect = function () {
    $$('km_edit_name').value = this.mTree.getSelectedRowValue("master_user_name");

};