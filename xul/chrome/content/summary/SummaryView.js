
function SummaryView() {
  this.mDb = null;
  this.mBankList = null;
  this.mGraph = null;
};
SummaryView.prototype.initialize = function(db) {
  this.mDb = db;
};

SummaryView.prototype.drawGraph = function(month) {
  month = 6;
  var startMonth = new Date();
  var currMonth = startMonth;
  startMonth.setMonth(startMonth.getMonth() - month);

  var itemid = $$('km_summary_item').value;
 
  var sql;   
  if (itemid != 0) {
    sql = "select "
      + " transaction_month, "
      + " income - expense "
      + " from kmv_sumpermonth "
      + " where item_id = " + itemid
      + " and transaction_month >= " + startMonth.getFullYear() + "/" + (startMonth.getMonth() + 1)
 } else {
    sql = "select "
      + " transaction_month, "
      + " sum(income - expense) "
      + " from kmv_sumpermonth "
      + " where transaction_month >= " + startMonth.getFullYear() + "/" + (startMonth.getMonth() + 1)
      + " group by transaction_month ";
  }

  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var labelArray = [];
  var valueArray = [];

 
  //TODO: レコード0件の月を考慮
  for (var i = 0; i < records.length; i++) {
    labelArray.push(records[i][0]);
    valueArray.push(records[i][1]);
    if (i >= month) {
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
