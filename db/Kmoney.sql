CREATE TABLE "km_bank_info" ("name" TEXT,"user_id" INTEGER);
CREATE TABLE "km_bank_trns" ("transaction_date" DATETIME,"income" INTEGER,"expense" INTEGER,"detail" TEXT,"bank_id" INTEGER,"internal" INTEGER DEFAULT (0) ,"last_update_date" DATETIME,"item_id" INTEGER,"user_id" INTEGER, "source" INTEGER);
CREATE TABLE "km_creditcard_info" ("name" TEXT,"bank_id" INTEGER,"user_id" INTEGER);
CREATE TABLE "km_creditcard_payment" ("transaction_id" INTEGER, "pay_month" DATETIME, "pay_amount" INTEGER, "remaining_balance" INTEGER, "detail" TEXT, "card_id" INTEGER, "user_id" INTEGER, "transaction_date" DATETIME, "last_update_date" DATETIME, "bought_amount" INTEGER);
CREATE TABLE "km_creditcard_trns" ("transaction_date" DATETIME,"detail" TEXT,"expense" INTEGER,"card_id" INTEGER,"last_update_date" DATETIME,"item_id" INTEGER,"user_id" INTEGER,"source" INTEGER, "internal" BOOL);
CREATE TABLE "km_emoney_info" ("name" TEXT,"creditcard_id" INTEGER,"user_id" INTEGER);
CREATE TABLE "km_emoney_trns" ("transaction_date" DATETIME,"expense" INTEGER,"detail" TEXT,"money_id" INTEGER,"last_update_date" DATETIME,"item_id" INTEGER,"user_id" INTEGER,"source" INTEGER, "internal" BOOL, "income" INTEGER);
CREATE TABLE "km_import" ("source_type" INTEGER,"source_id" INTEGER,"detail" TEXT,"item_id" INTEGER,"default_id" BOOL,"permission" BOOL,"internal" INTEGER);
CREATE TABLE "km_item" ("name" TEXT, "internal" INTEGER DEFAULT 0);
CREATE TABLE "km_realmoney_trns" ("transaction_date" DATETIME NOT NULL ,"income" INTEGER,"expense" INTEGER,"item_id" INTEGER,"detail" TEXT,"user_id" INTEGER,"internal" BOOL,"last_update_date" DATETIME,"source" INTEGER);
CREATE TABLE "km_source" ("type" INTEGER,"import" BOOL,"enabled" BOOL);
CREATE TABLE "km_user" ("id" INTEGER PRIMARY KEY  NOT NULL , "name" TEXT);
CREATE VIEW "kmv_transactions" AS select
   A.transaction_date,
   A.item_id,
   B.name as item_name,
   A.detail,
   A.income,
   A.expense,
   A.user_id,
   C.name as user_name,
   A.internal,
   A.type,
   A.rowid
from (
select
   transaction_date,
   item_id,
   detail,
   0 as income,
   expense,
   user_id,
   internal,
   'emoney' as type,
   rowid
from km_emoney_trns
union
select
   transaction_date,
   item_id,
   detail,
   0 as income,
   expense,
   user_id,
   internal,
   'creditcard' as type,
   rowid
from km_creditcard_trns
union
select
   transaction_date,
   item_id,
   detail,
   income,
   expense,
   user_id,
   internal,
   'realmoney' as type,
   rowid
from km_realmoney_trns
union
select
   transaction_date,
   item_id,
   detail,
   income,
   expense,
   user_id,
   internal,
   'bank' as type,
   rowid
from km_bank_trns
) A
inner join km_item B
on A.item_id = B.rowid
inner join km_user C
on A.user_id = C.id;
