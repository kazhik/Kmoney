
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
  
  this.listeners['km_summary_user.command'] = this.onGraphItemChanged.bind(this);
  $$('km_summary_user').addEventListener("command", this.listeners['km_summary_user.command']);

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

SummaryView.prototype.drawGraph = function() {
  var month = $$('km_summary_period').value;
  var startDate = new Date();
  startDate.setDate(1); // あとで月の計算をするため
  startDate.setMonth(startDate.getMonth() - month + 1);

  var itemid = parseInt($$('km_summary_item').value);
  var userid = parseInt($$('km_summary_user').value);
 
  var startYearMonth = convDateToYYYYMM(startDate, "/");

    var params = {};
    params['startYearMonth'] = startYearMonth;
  var sqlArray = ["select",
                "strftime('%Y/%m', transaction_date) as transaction_month,",
                "sum(expense - income) as sumpermonth",
                "from kmv_transactions",
                "where transaction_month >= :startYearMonth"];
  if (userid !== 0 && itemid !== 0) {
    sqlArray.push("and user_id = :user_id",
                "and internal <> 1",
                "and item_id = :item_id");
    params['user_id'] = userid;
    params['item_id'] = itemid;
  } else if (userid !== 0 && itemid === 0) {
    sqlArray.push("and user_id = :user_id",
                "and internal <> 1");
    params['user_id'] = userid;
  } else if (userid === 0 && itemid !== 0) {
    sqlArray.push("and item_id = :item_id",
                "and internal = 0");
    params['item_id'] = itemid;
  } else {
    sqlArray.push("and internal = 0");
  }
  sqlArray.push("group by transaction_month");
  
  var sql = sqlArray.join(" ");
  km_log(sql);
  this.mDb.selectWithParams(sql, params);
  var records = this.mDb.getRecords();
  var labelArray = [];
  var valueArray = [];

  var labelDate = startDate;
  var idx = 0;
  for (var i = 0; i < month; i++) {
    var dateStr = convDateToYYYYMM(labelDate, "/");
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
