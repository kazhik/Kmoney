CREATE TABLE __sm_ext_mgmt (`id` integer primary key, `type` text not null , `value` text);
CREATE TABLE "km_bank_info" ("name" TEXT,"user_id" INTEGER);
CREATE TABLE "km_bank_trns" ("transaction_date" DATETIME,"income" INTEGER,"expense" INTEGER,"detail" TEXT,"bank_id" INTEGER,"internal" INTEGER DEFAULT (0) ,"last_update_date" DATETIME,"item_id" INTEGER,"user_id" INTEGER, "source" INTEGER);
CREATE TABLE "km_creditcard_info" ("name" TEXT,"bank_id" INTEGER,"user_id" INTEGER);
CREATE TABLE "km_creditcard_payment" ("transaction_id" INTEGER, "pay_month" DATETIME, "pay_amount" INTEGER, "remaining_balance" INTEGER, "detail" TEXT, "card_id" INTEGER, "user_id" INTEGER, "transaction_date" DATETIME, "last_update_date" DATETIME, "bought_amount" INTEGER);
CREATE TABLE "km_creditcard_trns" ("transaction_date" DATETIME,"detail" TEXT,"expense" INTEGER,"card_id" INTEGER,"last_update_date" DATETIME,"item_id" INTEGER,"user_id" INTEGER,"source" INTEGER);
CREATE TABLE "km_emoney_info" ("name" TEXT,"creditcard_id" INTEGER,"user_id" INTEGER);
CREATE TABLE "km_emoney_trns" ("transaction_date" DATETIME,"expense" INTEGER,"detail" TEXT,"money_id" INTEGER,"last_update_date" DATETIME,"item_id" INTEGER,"user_id" INTEGER,"source" INTEGER, "internal" BOOL, "income" INTEGER);
CREATE TABLE "km_item" ("name" TEXT, "internal" INTEGER DEFAULT 0);
CREATE TABLE "km_realmoney_trns" ("transaction_date" DATETIME NOT NULL ,"income" INTEGER,"expense" INTEGER,"item_id" INTEGER,"detail" TEXT,"user_id" INTEGER,"internal" BOOL,"last_update_date" DATETIME,"source" INTEGER);
CREATE TABLE "km_source" ("type" INTEGER);
CREATE TABLE "km_user" ("id" INTEGER PRIMARY KEY  NOT NULL , "name" TEXT);
CREATE VIEW "km_transactions" AS   select A.transaction_date as date,
   A.expense,
   A.detail,
   B.name as item
from km_emoney_trns A, km_item B
where A.item_id = B.rowid
union
 select A.transaction_date as date,
   A.expense,
   A.detail,
   B.name as item
from km_creditcard_trns A, km_item B
where A.item_id = B.rowid
union
select A.transaction_date as date,
  A.expense,
  A.detail,
  B.name as item
from km_realmoney_trns A, km_item B
where A.item_id = B.rowid
union
select A.transaction_date as date,
  A.expense,
  A.detail,
  B.name as item
from km_bank_trns A, km_item B
where A.item_id = B.rowid;
CREATE VIEW "kmv_sumpermonth" AS  SELECT
 transaction_month,
 item_id,
 item_name,
 sum(income) as income,
 sum(expense) as expense
FROM (
SELECT 
 strftime('%Y/%m', A.transaction_date) as transaction_month,
 A.item_id as item_id,
 B.name as item_name,
 A.income as income,
 A.expense as expense
FROM km_realmoney_trns A
inner join km_item B on A.item_id = B.rowid 
UNION
SELECT 
 strftime('%Y/%m', A.transaction_date) as transaction_month,
 A.item_id as item_id,
 B.name as item_name,
 A.income as income,
 A.expense as expense
FROM km_bank_trns A
inner join km_item B on A.item_id = B.rowid 
UNION
SELECT 
 strftime('%Y/%m', A.transaction_date) as transaction_month,
 A.item_id as item_id,
 B.name as item_name,
 0 as income, 
 A.expense as expense
FROM km_creditcard_trns A
inner join km_item B on A.item_id = B.rowid 
UNION
SELECT 
 strftime('%Y/%m', A.transaction_date) as transaction_month,
 A.item_id as item_id,
 B.name as item_name,
 A.income as income,
 A.expense as expense
FROM km_emoney_trns A
inner join km_item B on A.item_id = B.rowid
) SUMTABLE 
group by transaction_month, item_id;
