function GraphView() {
  this.mDb = null;
  this.mBankList = null;
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
  new Ico.BarGraph(
      $$('km_graph'),
      { expense: valueArray},
      { colours: { expense: '#990000' },
        show_vertical_labels: false,
        labels: labelArray,
        bar_labels: true }
      );
/*
new Ico.LineGraph($$('drawerea'), {
    one: [30, 5, 1, 10, 15, 18, 20, 25, 1],
    two: [10, 9, 3, 30, 1, 10, 5, 33, 33],
    three: [5, 4, 10, 1, 30, 11, 33, 12, 22]
  }, {
    markers: 'circle',
    colours: { one: '#990000', two: '#009900', three: '#000099'},
    labels: ['one', 'two', 'three', 'four',
             'five', 'six', 'seven', 'eight', 'nine'],
    meanline: true,
    grid: true
  }
  );
*/
}
