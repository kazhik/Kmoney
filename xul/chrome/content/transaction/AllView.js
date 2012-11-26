function AllView() {
    Transaction.call(this, "km_tree_all");
    this.listeners = [];
}
AllView.prototype = Object.create(Transaction.prototype);

AllView.prototype.initialize = function (db) {
    Transaction.prototype.initialize.call(this, db);

    this.listeners['km_tree_all.select'] = this.onSelect.bind(this);
    $$('km_tree_all').addEventListener("select", this.listeners['km_tree_all.select']);

};

AllView.prototype.terminate = function () {
    $$('km_tree_all').removeEventListener("select", this.listeners['km_tree_all.select']);

};

AllView.prototype.getTransactionInfo = function(callback) {
    var id = this.mTree.getSelectedRowValue('id');
    var trnsType = this.mTree.getSelectedRowValue('type_id');
    
    callback(trnsType, id);
}

AllView.prototype.onSelect = function () {
    // 選択行の収支を計算してステータスバーに表示
    this.showSumOfSelectedRows();

};

AllView.prototype.load = function (sortParams) {

    km_debug("AllView.load start");
    if (sortParams === undefined) {
        sortParams = this.mTree.getCurrentSortParams();
    }
    
    var queryParams = [];
    for (var i = 1; i <= 2; i++) {
        var param = this.getCommonQueryParam(i);
        queryParams.push(param);
    }
    
    this.mDb.transactions.load(sortParams, queryParams, this.loadCallback.bind(this));

    km_debug("AllView.load end");

};