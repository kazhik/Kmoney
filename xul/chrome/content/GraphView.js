function GraphView() {
  this.mDb = null;
  this.mBankList = null;
  this.mGraph = null;
};
GraphView.prototype.initialize = function(db) {
  this.mDb = db;
};

GraphView.prototype.load = function() {
  var sql = "select "
    + "year, "
    + "month, "
    + "expense - income "
    + "from kmv_sumpermonth "
    + "where item_id = 1 ";
  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var labelArray = [];
  var valueArray = [];
  for (var i = 0; i < records.length; i++) {
    labelArray.push(records[i][0] + "/" + records[i][1]);
    valueArray.push(records[i][2]);
    if (i > 9) {
      labelArray.shift();
      valueArray.shift();
    }
  }

  if (this.mGraph === null) {
    this.mGraph = new Ico.BarGraph(
        $$('km_graph'),
        { expense: valueArray},
        { colours: { expense: '#990000' },
          show_vertical_labels: false,
          labels: labelArray,
          bar_labels: true }
        );
  }
}
