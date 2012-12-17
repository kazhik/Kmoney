function AllTransaction() {
    Transaction.call(this, "km_tree_all");
    this.listeners = [];
}
AllTransaction.prototype = Object.create(Transaction.prototype);

AllTransaction.prototype.initialize = function (db) {
    Transaction.prototype.initialize.call(this, db);

    this.listeners['km_tree_all.select'] = this.onSelect.bind(this);
    $$('km_tree_all').addEventListener("select", this.listeners['km_tree_all.select']);

};

AllTransaction.prototype.terminate = function () {
    $$('km_tree_all').removeEventListener("select", this.listeners['km_tree_all.select']);

};

AllTransaction.prototype.getTransactionInfo = function(callback) {
    var id = this.mTree.getSelectedRowValue('id');
    var trnsType = this.mTree.getSelectedRowValue('type_id');
    
    callback(trnsType, id);
}

AllTransaction.prototype.onSelect = function () {
    // 選択行の収支を計算してステータスバーに表示
    this.showSumOfSelectedRows();

};

AllTransaction.prototype.load = function (sortParams) {

    km_debug("AllTransaction.load start");
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        queryParams.push(param);
    }
    
    this.mDb.transactions.load(sortParams, queryParams, this.loadCallback.bind(this));

    km_debug("AllTransaction.load end");

};