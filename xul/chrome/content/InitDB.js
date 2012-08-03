
function InitDB() {
  this.mDb = null;
};
InitDB.prototype.execute = function(db) {
  this.mDb = db;
  this.createTables();
  this.setInitialRecords();
};
InitDB.prototype.setInitialRecords = function() {
  var sql;
  var sqlArray = [];
  // km_user
  // TODO: i18n
  var users = ['お父さん','お母さん'];
  for (var i = 0; i < users.length; i++) {
    sql = ["insert into km_user ("
      + "name "
      + ") values ( "
      + "'" + users[i] + "') "];
    sqlArray.push(sql);
  }
  this.mDb.executeTransaction(sqlArray);
  sqlArray.splice(0);
  
  var items = [
    ['食材・生活用品', 0],
    ['外食', 0],
    ['交通費', 0],
    ['ATM', 1],
    ['交際費', 0]
  ];
  for (var i = 0; i < items.length; i++) {
    sql = ["insert into km_item ("
      + "name, "
      + "internal "
      + ") values ( "
      + "'" + items[i][0] + "',"
      + items[i][1] + ")"];
    sqlArray.push(sql);
  }
  this.mDb.executeTransaction(sqlArray);
  sqlArray.splice(0);
  
  // km_bank_info
  // km_creditcard_info
  // km_emoney_info
  
};
InitDB.prototype.createTables = function() {
  var sql = [
    'CREATE TABLE "km_bank_info" ("name" TEXT,"user_id" INTEGER)',
    'CREATE TABLE "km_bank_trns" (' +
      '"transaction_date" DATETIME,' +
      '"income" INTEGER,' +
      '"expense" INTEGER,' +
      '"detail" TEXT,' +
      '"bank_id" INTEGER,' +
      '"internal" INTEGER DEFAULT (0) ,' +
      '"last_update_date" DATETIME,' +
      '"item_id" INTEGER,' +
      '"user_id" INTEGER,' +
      '"source" INTEGER)',
    'CREATE TABLE "km_creditcard_info" (' +
      '"name" TEXT,' +
      '"bank_id" INTEGER,' +
      '"user_id" INTEGER)',
    'CREATE TABLE "km_creditcard_payment" (' +
      '"transaction_id" INTEGER,' +
      '"pay_month" DATETIME,' +
      '"pay_amount" INTEGER,' +
      '"remaining_balance" INTEGER,' +
      '"detail" TEXT,' +
      '"card_id" INTEGER,' +
      '"user_id" INTEGER,' +
      '"transaction_date" DATETIME,' +
      '"last_update_date" DATETIME,' +
      '"bought_amount" INTEGER)',
    'CREATE TABLE "km_creditcard_trns" (' +
      '"transaction_date" DATETIME,' +
      '"detail" TEXT,' +
      '"expense" INTEGER,' +
      '"card_id" INTEGER,' +
      '"last_update_date" DATETIME,' +
      '"item_id" INTEGER,' +
      '"user_id" INTEGER,' +
      '"source" INTEGER)',
    'CREATE TABLE "km_emoney_info" (' +
      '"name" TEXT,' +
      '"creditcard_id" INTEGER,' +
      '"user_id" INTEGER)',
    'CREATE TABLE "km_emoney_trns" (' +
      '"transaction_date" DATETIME,' +
      '"expense" INTEGER,' +
      '"detail" TEXT,' +
      '"money_id" INTEGER,' +
      '"last_update_date" DATETIME,' +
      '"item_id" INTEGER,' +
      '"user_id" INTEGER,' +
      '"source" INTEGER,' +
      '"internal" BOOL,' +
      '"income" INTEGER)',
    'CREATE TABLE "km_realmoney_trns" (' +
      '"transaction_date" DATETIME NOT NULL ,' +
      '"income" INTEGER,' +
      '"expense" INTEGER,' +
      '"item_id" INTEGER,' +
      '"detail" TEXT,' +
      '"user_id" INTEGER,' +
      '"internal" BOOL,' +
      '"last_update_date" DATETIME,' +
      '"source" INTEGER)',
    'CREATE TABLE "km_item" ("name" TEXT, "internal" INTEGER DEFAULT 0)',
    'CREATE TABLE "km_source" ("type" INTEGER)',
    'CREATE TABLE "km_user" ("id" INTEGER PRIMARY KEY  NOT NULL , "name" TEXT)'
  ];
  this.mDb.executeTransaction(sql);
};

