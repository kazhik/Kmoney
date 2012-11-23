"use strict";

function CardMaster() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_master_creditcard");
    this.listeners = [];
};
CardMaster.prototype.initialize = function (db) {
    this.mDb = db;

    this.mTree.init(this, this.load.bind(this));

    this.listeners['km_tree_master_creditcard.select'] = this.onSelect.bind(this);
    $$('km_tree_master_creditcard').addEventListener("select",
    this.listeners['km_tree_master_creditcard.select']);

    this.load();
};
CardMaster.prototype.terminate = function () {
    $$('km_tree_master_creditcard').removeEventListener("select",
        this.listeners['km_tree_master_creditcard.select']);
};

CardMaster.prototype.load = function () {
    function loadCallback(records, columns) {
        this.mTree.populateTableData(records, columns);
        this.mTree.showTable(true);
    }
    km_debug("CardMaster.load");
    this.mDb.creditCardInfo.loadMaster(loadCallback.bind(this));

};
CardMaster.prototype.addRecord = function () {
    function onCompleted(id) {
        this.load();
        this.mTree.ensureRowIsVisible('master_creditcard_id', id);
    }
    var params = {
        "name": $$('km_edit_name').value,
        "userId": $$('km_edit_user').value,
        "bankId": $$('km_edit_bank').value
    };
    
    this.mDb.creditCardInfo.insert(params, onCompleted.bind(this));

}
CardMaster.prototype.updateRecord = function () {
    function onCompleted() {
        this.load();
        this.mTree.ensureRowIsVisible('master_creditcard_id', id);
    }
    var params = {
        "name": $$('km_edit_name').value,
        "userId": $$('km_edit_user').value,
        "bankId": $$('km_edit_bank').value
    };
    var id = this.mTree.getSelectedRowValue('master_creditcard_id');
    this.mDb.creditCardInfo.update(id, params, onCompleted.bind(this));

};

CardMaster.prototype.deleteRecord = function () {
    function onCompleted() {
        this.load();
        this.mTree.ensurePreviousRowIsVisible();
    }
    var id = this.mTree.getSelectedRowValue('master_creditcard_id');
    if (id === "") {
      return;
    }
    this.mDb.creditCardInfo.delete(id, onCompleted.bind(this));
};

CardMaster.prototype.onSelect = function () {
    $$('km_edit_name').value = this.mTree.getSelectedRowValue('master_creditcard_name');
    $$('km_edit_user').value = this.mTree.getSelectedRowValue('master_creditcard_userid');
    $$('km_edit_bank').value = this.mTree.getSelectedRowValue('master_creditcard_bankid');
};