
function SummaryView() {
  this.mDb = null;
  this.mBankList = null;
  this.mGraph = null;
  this.listeners = [];
};
SummaryView.prototype.initialize = function(db) {
  this.mDb = db;

  $$('km_summary_period').appendItem(km_getLStr("summary.period.6months"), 6);
  $$('km_summary_period').appendItem(km_getLStr("summary.period.1year"), 12);

  $$('km_summary_period').selectedIndex = 0;
  
  this.listeners['km_summary_item.command'] = this.onGraphItemChanged.bind(this);
  $$('km_summary_item').addEventListener("command", this.listeners['km_summary_item.command']);
  
  this.listeners['km_summary_period.command'] = this.onGraphItemChanged.bind(this);
  $$('km_summary_period').addEventListener("command", this.listeners['km_summary_period.command']);
};
SummaryView.prototype.terminate = function() {
  $$('km_summary_item').removeEventListener("command", this.listeners['km_summary_item.command']);
  $$('km_summary_period').removeEventListener("command", this.listeners['km_summary_period.command']);
}
SummaryView.prototype.onGraphItemChanged = function() {
    this.drawGraph();
}

SummaryView.prototype.getDateYYYYMM = function(dateObj) {
  var retStr = dateObj.getFullYear();
  retStr += "/";
  var month = dateObj.getMonth() + 1;
  if (month < 10) {
    retStr += "0";
  }
  retStr += month;
  
  return retStr;
};

SummaryView.prototype.drawGraph = function() {
  var month = $$('km_summary_period').value;
  var startDate = new Date();
  startDate.setDate(1); // あとで月の計算をするため
  startDate.setMonth(startDate.getMonth() - month + 1);

  var itemid = $$('km_summary_item').value;
 
  var sql;   
  var startYearMonth = this.getDateYYYYMM(startDate);
  if (itemid != 0) {
    sql = "select "
      + " transaction_month, "
      + " abs(income - expense) "
      + " from kmv_sumpermonth "
      + " where item_id = " + itemid
      + " and transaction_month >= '" + startYearMonth + "'"
 } else {
    sql = "select "
      + " transaction_month, "
      + " abs(sum(income - expense)) "
      + " from kmv_sumpermonth "
      + " where transaction_month >= '" + startYearMonth + "'"
      + " group by transaction_month ";
  }

  this.mDb.selectQuery(sql);
  var records = this.mDb.getRecords();
  var labelArray = [];
  var valueArray = [];

  var labelDate = startDate;
  var idx = 0;
  for (var i = 0; i < month; i++) {
    var dateStr = this.getDateYYYYMM(labelDate);
    labelArray.push(dateStr);
    
    if (records[idx] != undefined && records[idx][0] === dateStr) {
      valueArray.push(records[idx][1]);
      idx++;
    } else {
      valueArray.push(0);
    }
    labelDate.setMonth(labelDate.getMonth() + 1);
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
