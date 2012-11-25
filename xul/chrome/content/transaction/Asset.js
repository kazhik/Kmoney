function Asset() {
    Transaction.call(this, "km_tree_asset");
    this.listeners = [];
};
Asset.prototype = Object.create(Transaction.prototype);

Asset.prototype.initialize = function (db) {
    Transaction.prototype.initialize.call(this, db);

    this.listeners['km_tree_asset.select'] = this.onSelect.bind(this);
    $$('km_tree_asset').addEventListener("select", this.listeners['km_tree_asset.select']);
    
};
Asset.prototype.terminate = function () {
    $$('km_tree_asset').removeEventListener("select", this.listeners['km_tree_asset.select']);
    
};

Asset.prototype.load = function () {
    km_debug("Asset.load start");
    
    this.mDb.asset.load(this.loadCallback.bind(this));

    km_debug("Asset.load end");

};
Asset.prototype.onSelect = function () {

};
Asset.prototype.addRecord = function () {
    var params = {
        "name": $$('km_edit_assetName').value,
        "amount": $$('km_read_amount').value,
        "userId": $$('km_read_userId').value,
        "assetType": $$('km_edit_assetType').value,
        "transactionType": $$('km_read_transactionType').value,
        "transactionId": $$('km_read_transactionId').value
    };
    
    this.mDb.assetInsert(params, this.insertCallback.bind(this));    
};
Asset.prototype.updateRecord = function () {
    var params = {
        "name": $$('km_edit_assetName').value,
        "amount": $$('km_read_amount').value,
        "userId": $$('km_read_userId').value,
        "assetType": $$('km_edit_assetType').value,
        "transactionType": $$('km_read_transactionType').value,
        "transactionId": $$('km_read_transactionId').value
    };

    var id = this.mTree.getSelectedRowValue('id');
    if (id.length === 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.update.notSelected"));
        return;
    }
    this.mDb.assetUpdate(id, params, this.updateCallback.bind(this));    
};

Asset.prototype.deleteRecord = function () {
    var id = this.mTree.getSelectedRowValue('id');
    if (id.length === 0) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.delete.notSelected"));
        return;
    }
    this.mDb.assetDelete(id, this.deleteCallback.bind(this));

};
