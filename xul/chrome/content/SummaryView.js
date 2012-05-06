function SummaryView() {
  this.mDb = null;
  this.mBankList = null;
  this.mGraph = null;
};
SummaryView.prototype.initialize = function(db) {
  this.mDb = db;
};

SummaryView.prototype.drawGraph = function() {
  var itemid = $$('km_summary_item').value;
  var sql = "select "
    + "year, "
    + "month, "
    + "expense - income "
    + "from kmv_sumpermonth ";
    
  if (itemid != 0) {
    sql += "where item_id = " + itemid;
  }
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

  KmGlobals.$empty($$('km_summary'));
  this.mGraph = new Ico.BarGraph(
      $$('km_summary'),
      { expense: valueArray},
      { colours: { expense: '#990000' },
        show_vertical_labels: false,
        labels: labelArray,
        max_bar_size: 20,
        bar_labels: true }
      );
}
