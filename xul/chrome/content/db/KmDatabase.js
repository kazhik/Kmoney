Components.utils.import("chrome://kmoney/content/db/sqlite.js");

function KmDatabase() {
    km_debug("KmDatabase start");
    this.mDb = new SQLiteHandler();
    this.maFileExt = km_prefsBranch.getCharPref("sqliteFileExtensions").split(",");
    
    this.cashTrns = new KmCashTrns(this.mDb);
    
    this.bankInfo = new KmBankInfo(this.mDb);
    this.bankTrns = new KmBankTrns(this.mDb);
    
    this.creditCardInfo = new KmCreditCardInfo(this.mDb);
    this.creditCardTrns = new KmCreditCardTrns(this.mDb);
    
    this.emoneyInfo = new KmEMoneyInfo(this.mDb);
    this.emoneyTrns = new KmEMoneyTrns(this.mDb);
    
    this.userInfo = new KmUserInfo(this.mDb);
    this.itemInfo = new KmItemInfo(this.mDb);
    this.source = new KmSource(this.mDb);
    this.import = new KmImport(this.mDb);
    this.importHistory = new KmImportHistory(this.mDb);
    this.transactions = new KmvTransactions(this.mDb);
}
KmDatabase.prototype.isConnected = function () {
    return this.mDb.isConnected();
};

KmDatabase.prototype.newDatabase = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("newdatabase.title"), nsIFilePicker.modeSave);
    fp.defaultString = km_getLStr("extName") + "." + this.maFileExt[0];

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        try {
            this.mDb.openDatabase(fp.file, true);
        } catch (e) {
            Components.utils.reportError('in function newDatabase - ' + e);
            km_message("Connect to '" + fp.file.path + "' failed: " + e, 0x3);
            return false;
        }
        KmGlobals.mru.add(this.mDb.getFile().path);

        this.initialize();
    }
    return true;
};
KmDatabase.prototype.closeDatabase = function (bAlert) {
    //nothing to close if no database is already open
    if (!this.mDb.isConnected()) {
        if (bAlert) alert(km_getLStr("db.noOpenDb"));
        return true;
    }

    //if another file is already open, confirm before closing
    var answer = true;
    if (bAlert) answer = kmPrompt.confirm(null, km_getLStr("extName"), km_getLStr("db.confirmClose"));

    if (!answer) return false;


    //make the current database as null and
    //call setDatabase to do appropriate things
    this.mDb.closeConnection();
    return true;
};

KmDatabase.prototype.openDatabase = function () {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("db.select"), nsIFilePicker.modeOpen);
    
    var sExt = "";
    for (var iCnt = 0; iCnt < this.maFileExt.length; iCnt++) {
        sExt += "*." + this.maFileExt[iCnt] + ";";
    }
    fp.appendFilter(km_getLStr("db.dbFiles") + " (" + sExt + ")", sExt);
    fp.appendFilters(nsIFilePicker.filterAll);

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        this.openDatabaseFile(fp.file);
    }
    return true;

};

KmDatabase.prototype.openLastDb = function () {
    // opening with last used DB if preferences set to do so
    var bPrefVal = km_prefsBranch.getBoolPref("openWithLastDb");
    if (!bPrefVal) return;

    var sPath = KmGlobals.mru.getLatest();
    if (sPath == null) return;

    //Last used DB found, open this DB
    var newfile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    try {
        newfile.initWithPath(sPath);
    } catch (e) {
        kmPrompt.alert(null, km_getLStr("extName"), 'Failed to init local file using ' + sPath);
        return;
    }
    //if the last used file is not found, bail out
    if (!newfile.exists()) {
        kmPrompt.alert(null, km_getLStr("extName"), km_getLFStr("db.lastDbDoesNotExist", [sPath]));
        return;
    }

    bPrefVal = km_prefsBranch.getBoolPref("promptForLastDb");
    if (bPrefVal) {
        var check = {
            value: false
        }; // default the checkbox to false
        var result = kmPrompt.confirmCheck(null,
            km_getLStr("extName") + " - " + km_getLStr("db.promptLastDbTitle"),
            km_getLStr("db.promptLastDbAsk") + "\n" + sPath + "?",
            km_getLStr("db.promptLastDbOpen"),
            check);

        if (!result) return;
        //update the promptForLastDb preference
        bPrefVal = km_prefsBranch.setBoolPref("promptForLastDb", !check.value);
    }
    //assign the new file (nsIFile) to the current database
    this.openDatabaseFile(newfile);
    
};
KmDatabase.prototype.openDatabaseFile = function (dbFile) {
    if (this.closeDatabase(false)) {
        try {
            //create backup before opening
            this.createTimestampedBackup(dbFile);
            this.mDb.openDatabase(dbFile, true);
        } catch (e) {
            Components.utils.reportError('in function openDatabaseFile - ' + e);
            km_message("Connect to '" + dbFile.path + "' failed: " + e, 0x3);
            return false;
        }
        KmGlobals.mru.add(this.mDb.getFile().path);
        return true;
    }
    return false;
};

KmDatabase.prototype.createTimestampedBackup = function (nsiFileObj) {
    if (!nsiFileObj.exists()) //exit if no such file
    return false;

    switch (km_prefsBranch.getCharPref("autoBackup")) {
        case "off":
            return false;
        case "on":
            break;
        case "prompt":
            var bAnswer = kmPrompt.confirm(null,
                                           km_getLStr("extName"),
                                           km_getLStr("db.confirmBackup"));
            if (!bAnswer) return false;
            break;
        default:
            return false;
    }

    //construct a name for the new file as originalname_timestamp.ext
    //    var dt = new Date();
    //    var sTimestamp = dt.getFullYear() + dt.getMonth() + dt.getDate();
    var sTimestamp = KmGlobals.getISODateTimeFormat(null, "", "s"); //Date.now();
    var sFileName = nsiFileObj.leafName;
    var sMainName = sFileName,
        sExt = "";
    var iPos = sFileName.lastIndexOf(".");
    if (iPos > 0) {
        sMainName = sFileName.substr(0, iPos);
        sExt = sFileName.substr(iPos);
    }
    var sBackupFileName = sMainName + "_" + sTimestamp + sExt;

    //copy the file in the same location as the original file
    try {
        nsiFileObj.copyTo(null, sBackupFileName);
    } catch (e) {
        alert(sm_getLFStr("db.backup.failed", [sBackupFileName, e.message]));
    }
    return true;
};

KmDatabase.prototype.initialize = function () {
    this.createTables();
    this.setInitialRecords();
    
};
KmDatabase.prototype.setInitialRecords = function() {
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

KmDatabase.prototype.cashInsert = function(params, callback) {
    function insertCallback(id) {
        this.dropTrigger("km_realmoney_trns_insert");
        callback(id);
    }
    this.createTriggerOnInsert("km_realmoney_trns", "km_realmoney_trns_insert");
    this.createTransactionId();
    this.cashTrns.insert(params, insertCallback.bind(this));
    
};
KmDatabase.prototype.cashUpdate = function(id, params, callback) {
    function updateCallback(id) {
        this.dropTrigger("km_realmoney_trns_update");
        callback();
    }
    
    this.createTriggerOnUpdate("km_realmoney_trns", "km_realmoney_trns_update");
    this.createTransactionId();
    this.cashTrns.update(id, params, updateCallback.bind(this));
};
KmDatabase.prototype.cashDelete = function(idList, callback) {
    function deleteCallback() {
        this.dropTrigger("km_realmoney_trns_delete");
        callback();
    }
    
    this.createTriggerOnDelete("km_realmoney_trns", "km_realmoney_trns_delete");
    this.createTransactionId();
    this.cashTrns.delete(idList, deleteCallback.bind(this));
};

KmDatabase.prototype.bankInsert = function(params, callback) {
    function insertCallback(id) {
        this.dropTrigger("km_bank_trns_insert");
        callback(id);
    }
    this.createTriggerOnInsert("km_bank_trns", "km_bank_trns_insert");
    this.createTransactionId();
    this.bankTrns.insert(params, insertCallback.bind(this));
    
};
KmDatabase.prototype.bankUpdate = function(id, params, callback) {
    function updateCallback(id) {
        this.dropTrigger("km_bank_trns_update");
        callback();
    }
    
    this.createTriggerOnUpdate("km_bank_trns", "km_bank_trns_update");
    this.createTransactionId();
    this.bankTrns.update(id, params, updateCallback.bind(this));
};
KmDatabase.prototype.bankDelete = function(idList, callback) {
    function deleteCallback() {
        this.dropTrigger("km_bank_trns_delete");
        callback();
    }
    
    this.createTriggerOnDelete("km_bank_trns", "km_bank_trns_delete");
    this.createTransactionId();
    this.bankTrns.delete(idList, deleteCallback.bind(this));
};

KmDatabase.prototype.emoneyInsert = function(params, callback) {
    function insertCallback(id) {
        this.dropTrigger("km_emoney_trns_insert");
        callback(id);
    }
    this.createTriggerOnInsert("km_emoney_trns", "km_emoney_trns_insert");
    this.createTransactionId();
    this.emoneyTrns.insert(params, insertCallback.bind(this));
    
};
KmDatabase.prototype.emoneyUpdate = function(id, params, callback) {
    function updateCallback(id) {
        this.dropTrigger("km_emoney_trns_update");
        callback();
    }
    
    this.createTriggerOnUpdate("km_emoney_trns", "km_emoney_trns_update");
    this.createTransactionId();
    this.emoneyTrns.update(id, params, updateCallback.bind(this));
};

KmDatabase.prototype.emoneyDelete = function(idList, callback) {
    function deleteCallback() {
        this.dropTrigger("km_emoney_trns_delete");
        callback();
    }
    
    this.createTriggerOnDelete("km_emoney_trns", "km_emoney_trns_delete");
    this.createTransactionId();
    this.emoneyTrns.delete(idList, deleteCallback.bind(this));
};

KmDatabase.prototype.creditCardInsert = function(params, callback) {
    function insertCallback(id) {
        this.dropTrigger("km_creditcard_trns_insert");
        callback(id);
    }
    this.createTriggerOnInsert("km_creditcard_trns", "km_creditcard_trns_insert");
    this.createTransactionId();
    this.creditCardTrns.insert(params, insertCallback.bind(this));
    
};
KmDatabase.prototype.creditCardUpdate = function(id, params, callback) {
    function updateCallback(id) {
        this.dropTrigger("km_creditcard_trns_update");
        callback();
    }
    
    this.createTriggerOnUpdate("km_creditcard_trns", "km_creditcard_trns_update");
    this.createTransactionId();
    this.creditCardTrns.update(id, params, updateCallback.bind(this));
};

KmDatabase.prototype.creditCardDelete = function(idList, callback) {
    function deleteCallback() {
        this.dropTrigger("km_creditcard_trns_delete");
        callback();
    }
    
    this.createTriggerOnDelete("km_creditcard_trns", "km_creditcard_trns_delete");
    this.createTransactionId();
    this.creditCardTrns.delete(idList, deleteCallback.bind(this));
};

KmDatabase.prototype.undo = function() {
    var sql = ["select undo_sql from km_sys_undo",
               "where db_transaction_id = (select max(db_transaction_id) from km_sys_undo)"].join(" ");

    this.mDb.selectQuery(sql);
    var records = this.mDb.getRecords();
    km_log(records[0][0]);
    this.mDb.executeTransaction([records[0][0]]);
    
};
KmDatabase.prototype.createTransactionId = function() {
    var sql = "insert into km_sys_transaction (execution_date) values(datetime('now', 'localtime'))";
    this.mDb.executeTransaction([sql]);
};

KmDatabase.prototype.dropTrigger = function(triggerName) {
    var sql = "drop trigger " + triggerName;
    km_log(sql);
    this.mDb.executeTransaction([sql]);
};

KmDatabase.prototype.createTriggerOnInsert = function(tableName, triggerName) {
    var sql = ["create temporary trigger",
               triggerName,
               "after insert on " + tableName,
               "begin",
               "insert into km_sys_undo",
               "(db_transaction_id, undo_sql)",
               "values (",
               "(select max(id) from km_sys_transaction),",
               "'",
               "delete from " + tableName,
               "where id='" + "||new.id",
               ");",
               "end"].join(" ");
    km_log(sql);
    this.mDb.executeTransaction([sql]);
};

KmDatabase.prototype.createTriggerOnUpdate = function(tableName, triggerName) {
    var tableInfo = this.mDb.getTableInfo(tableName, "");
    
    var setList = [];
    for (var i = 0; i < tableInfo.length; i++) {
        if (tableInfo[i]["pk"] == 1) {
            continue;
        }
        setList.push(tableInfo[i]["name"] + " = '||quote(old." + tableInfo[i]["name"] + ")||'")
    }
    
    var sql = ["create temporary trigger ",
               triggerName,
               "after update on " + tableName,
               "begin",
               "insert into km_sys_undo",
               "(db_transaction_id, undo_sql)",
               "values (",
               "(select max(id) from km_sys_transaction),",
               "'",
               "update " + tableName,
               "set ",
               setList.join(","),
               "');",
               "end"].join(" ");

    km_log(sql);
    this.mDb.executeTransaction([sql]);
};

KmDatabase.prototype.createTriggerOnDelete = function(tableName, triggerName) {
    var tableInfo = this.mDb.getTableInfo(tableName, "");
    
    var colList = [];
    var valList = [];
    for (var i = 0; i < tableInfo.length; i++) {
        if (tableInfo[i]["pk"] == 1) {
            continue;
        }
        colList.push(tableInfo[i]["name"]);
        valList.push("'||quote(old." + tableInfo[i]["name"] + ")||'");
    }
    
    var sql = ["create temporary trigger ",
               triggerName,
               "after delete on " + tableName,
               "begin",
               "insert into km_sys_undo",
               "(db_transaction_id, undo_sql)",
               "values (",
               "(select max(id) from km_sys_transaction),",
               "'",
               "insert into " + tableName,
               "(" + colList.join(",") + ")",
               "values",
               "(" + valList.join(",") + ")",
               "');",
               "end"].join(" ");

    km_log(sql);
    this.mDb.executeTransaction([sql]);
};

KmDatabase.prototype.createTables = function() {
  var sql = [
    'CREATE TABLE "km_bank_info" (' +
        '"id" INTEGER PRIMARY KEY,' +
        '"name" TEXT,"user_id" INTEGER)',
    'CREATE TABLE "km_bank_trns" (' +
      '"id" INTEGER PRIMARY KEY,' +
      '"transaction_date" DATETIME,' +
      '"income" REAL,' +
      '"expense" REAL,' +
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
      '"pay_amount" REAL,' +
      '"remaining_balance" REAL,' +
      '"detail" TEXT,' +
      '"card_id" INTEGER,' +
      '"user_id" INTEGER,' +
      '"transaction_date" DATETIME,' +
      '"last_update_date" DATETIME,' +
      '"bought_amount" REAL)',
    'CREATE TABLE "km_creditcard_trns" (' +
      '"id" INTEGER PRIMARY KEY,' +
      '"transaction_date" DATETIME,' +
      '"detail" TEXT,' +
      '"expense" REAL,' +
      '"card_id" INTEGER,' +
      '"last_update_date" DATETIME,' +
      '"item_id" INTEGER,' +
      '"user_id" INTEGER,' +
      '"internal" BOOL,' +
      '"source" INTEGER)',
    'CREATE TABLE "km_emoney_info" (' +
      '"id" INTEGER PRIMARY KEY,' +
      '"name" TEXT,' +
      '"user_id" INTEGER)',
    'CREATE TABLE "km_emoney_trns" (' +
      '"id" INTEGER PRIMARY KEY,' +
      '"transaction_date" DATETIME,' +
      '"expense" REAL,' +
      '"detail" TEXT,' +
      '"money_id" INTEGER,' +
      '"last_update_date" DATETIME,' +
      '"item_id" INTEGER,' +
      '"user_id" INTEGER,' +
      '"source" INTEGER,' +
      '"internal" BOOL,' +
      '"income" REAL)',
    'CREATE TABLE "km_realmoney_trns" (' +
      '"id" INTEGER PRIMARY KEY,' +
      '"transaction_date" DATETIME NOT NULL ,' +
      '"income" REAL,' +
      '"expense" REAL,' +
      '"item_id" INTEGER,' +
      '"detail" TEXT,' +
      '"user_id" INTEGER,' +
      '"internal" BOOL,' +
      '"last_update_date" DATETIME,' +
      '"source" INTEGER)',
    'CREATE TABLE "km_item" (' +
        '"id" INTEGER PRIMARY KEY NOT NULL,' +
        '"name" TEXT, ' +
        '"sum_include" BOOL)',
    'CREATE TABLE "km_source" (' +
        '"id" INTEGER PRIMARY KEY NOT NULL,' +
        '"type" TEXT, ' +
        '"import" BOOL, ' +
        '"enabled" BOOL)',
    'CREATE TABLE "km_user" (' +
        '"id" INTEGER PRIMARY KEY  NOT NULL ,' +
        '"name" TEXT)',
    'CREATE TABLE "km_import" (' +
        '"id" INTEGER PRIMARY KEY ,' +
        '"source_type" INTEGER,' +
        '"detail" TEXT,' +
        '"item_id" INTEGER,' +
        '"default_id" BOOL,' +
        '"permission" BOOL,' +
        '"internal" INTEGER)',
    'CREATE TABLE "km_import_history" (' +
        '"id" INTEGER PRIMARY KEY  NOT NULL ,' +
        '"source_type" INTEGER,' +
        '"source_url" TEXT,' +
        '"period_from" DATETIME,' +
        '"period_to" DATETIME,' +
        '"import_date" DATETIME)',
    'CREATE TABLE "km_sys_transaction" (' +
        '"id" INTEGER PRIMARY KEY  NOT NULL , "execution_date" DATETIME)',
    'CREATE TABLE "km_sys_undo" (' +
        '"id" INTEGER PRIMARY KEY  NOT NULL ,"undo_sql" TEXT,"db_transaction_id" INTEGER)',
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
    '   income, ' +
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
    
//this object handles MRU using one preference 'jsonMruData'
KmGlobals.mru = {
    mbInit: false,
    mSize: 0,
    mList: [],
    mProfilePath: '',

    initialize: function () {
        try {
            this.convert();
        } catch (e) {}

        this.getPref();

        this.mProfilePath = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile).path;
        this.mbInit = true;
    },

    convert: function () {
        //use the two prefs and remove them; so, the following can happen only once.
        var sPref = km_prefsBranch.getComplexValue("mruPath.1", Ci.nsISupportsString).data;
        this.mList = sPref.split(",");
        this.mSize = km_prefsBranch.getIntPref("mruSize");

        km_prefsBranch.clearUserPref("mruPath.1");
        km_prefsBranch.clearUserPref("mruSize");

        this.setPref();
        return true;
    },

    add: function (sPath) {
        if (sPath.indexOf(this.mProfilePath) == 0) sPath = "[ProfD]" + sPath.substring(this.mProfilePath.length);

        var iPos = this.mList.indexOf(sPath);
        if (iPos >= 0) {
            //remove at iPos
            this.mList.splice(iPos, 1);
        }
        //add in the beginning
        this.mList.splice(0, 0, sPath);

        if (this.mList.length > this.mSize) {
            //remove the extra entries
            this.mList.splice(this.mSize, this.mList.length - this.mSize);
        }

        this.setPref();
    },

    remove: function (sPath) {
        if (sPath.indexOf(this.mProfilePath) == 0) sPath = "[ProfD]" + sPath.substring(this.mProfilePath.length);

        var iPos = this.mList.indexOf(sPath);
        if (iPos >= 0) {
            //remove at iPos
            this.mList.splice(iPos, 1);
            this.setPref();
            return true;
        }
        return false;
    },

    getList: function () {
        if (!this.mbInit) this.initialize();

        var aList = [];
        for (var i = 0; i < this.mList.length; i++) {
            aList.push(this.getFullPath(this.mList[i]));
        }
        return aList;
    },

    getLatest: function () {
        if (!this.mbInit) this.initialize();

        if (this.mList.length > 0) return this.getFullPath(this.mList[0]);
        else return null;
    },

    getFullPath: function (sVal) {
        var sRelConst = "[ProfD]";
        if (sVal.indexOf(sRelConst) == 0) sVal = this.mProfilePath + sVal.substring(sRelConst.length);

        return sVal;
    },

    getPref: function () {
        try {
            var sPref = km_prefsBranch.getComplexValue("jsonMruData", Ci.nsISupportsString).data;
        } catch (e) {
            var sPref = km_prefsBranch.getCharPref("jsonMruData");
        }
        var obj = JSON.parse(sPref);
        this.mList = obj.list;
        this.mSize = obj.size;
    },

    setPref: function () {
        try {
            var sPref = km_prefsBranch.getComplexValue("jsonMruData", Ci.nsISupportsString).data;
        } catch (e) {
            var sPref = km_prefsBranch.getCharPref("jsonMruData");
        }
        var obj = JSON.parse(sPref);
        obj.list = this.mList;
        obj.size = this.mSize;
        sPref = JSON.stringify(obj);
        km_setUnicodePref("jsonMruData", sPref);
    }
};
