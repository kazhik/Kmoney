
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
    ['食材・生活用品', 1],
    ['外食', 1],
    ['交通費', 1],
    ['ATM', 1],
    ['交際費', 1]
  ];
  for (var i = 0; i < items.length; i++) {
    sql = ["insert into km_item ("
      + "name, "
      + "sum_include "
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
    'CREATE TABLE "km_bank_info" ("id" INTEGER PRIMARY KEY,"name" TEXT,"user_id" INTEGER)',
    'CREATE TABLE "km_bank_trns" (' +
      '"id" INTEGER PRIMARY KEY,' +
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
      '"id" INTEGER PRIMARY KEY,' +
      '"name" TEXT,' +
      '"bank_id" INTEGER,' +
      '"user_id" INTEGER)',
    'CREATE TABLE "km_creditcard_payment" (' +
      '"id" INTEGER PRIMARY KEY,' +
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
      '"id" INTEGER PRIMARY KEY,' +
      '"transaction_date" DATETIME,' +
      '"detail" TEXT,' +
      '"expense" INTEGER,' +
      '"card_id" INTEGER,' +
      '"last_update_date" DATETIME,' +
      '"item_id" INTEGER,' +
      '"user_id" INTEGER,' +
      '"internal" BOOL,' +
      '"source" INTEGER)',
    'CREATE TABLE "km_emoney_info" (' +
      '"id" INTEGER PRIMARY KEY,' +
      '"name" TEXT,' +
      '"creditcard_id" INTEGER,' +
      '"user_id" INTEGER)',
    'CREATE TABLE "km_emoney_trns" (' +
      '"id" INTEGER PRIMARY KEY,' +
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
      '"id" INTEGER PRIMARY KEY,' +
      '"transaction_date" DATETIME NOT NULL ,' +
      '"income" INTEGER,' +
      '"expense" INTEGER,' +
      '"item_id" INTEGER,' +
      '"detail" TEXT,' +
      '"user_id" INTEGER,' +
      '"internal" BOOL,' +
      '"last_update_date" DATETIME,' +
      '"source" INTEGER)',
    'CREATE TABLE "km_item" ("id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT, "sum_include" BOOL)',
    'CREATE TABLE "km_source" ("id" INTEGER PRIMARY KEY NOT NULL, "type" INTEGER, "import" BOOL, "enabled" BOOL)',
    'CREATE TABLE "km_user" ("id" INTEGER PRIMARY KEY  NOT NULL , "name" TEXT)',
    'CREATE VIEW "kmv_transactions" AS   select ' +
    '   A.transaction_date, ' +
    '   A.item_id, ' +
    '   B.name as item_name, ' +
    '   B.sum_include as sum_include, ' +
    '   A.detail, ' +
    '   A.income, ' +
    '   A.expense, ' +
    '   A.user_id, ' +
    '   C.name as user_name, ' +
    '   A.internal, ' +
    '   A.type, ' +
    '   A.id ' +
    'from ( ' +
    'select ' +
    '   transaction_date, ' +
    '   item_id, ' +
    '   detail, ' +
    '   0 as income, ' +
    '   expense, ' +
    '   user_id, ' +
    '   internal, ' +
    '   "emoney" as type, ' +
    '   id ' +
    'from km_emoney_trns ' +
    'union ' +
    'select ' +
    '   transaction_date, ' +
    '   item_id, ' +
    '   detail, ' +
    '   0 as income, ' +
    '   expense, ' +
    '   user_id, ' +
    '   internal, ' +
    '   "creditcard" as type, ' +
    '   id ' +
    'from km_creditcard_trns ' +
    'union ' +
    'select ' +
    '   transaction_date, ' +
    '   item_id, ' +
    '   detail, ' +
    '   income, ' +
    '   expense, ' +
    '   user_id, ' +
    '   internal, ' +
    '   "realmoney" as type, ' +
    '   id ' +
    'from km_realmoney_trns ' +
    'union ' +
    'select ' +
    '   transaction_date, ' +
    '   item_id, ' +
    '   detail, ' +
    '   income, ' +
    '   expense, ' +
    '   user_id, ' +
    '   internal, ' +
    '   "bank" as type, ' +
    '   id ' +
    'from km_bank_trns ' +
    ') A ' +
    'inner join km_item B ' +
    'on A.item_id = B.id ' +
    'inner join km_user C ' +
    'on A.user_id = C.id '
  ];
  this.mDb.executeTransaction(sql);
};

