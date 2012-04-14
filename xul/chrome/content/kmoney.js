Components.utils.import("chrome://kmoney/content/sqlite.js");
Components.utils.import("chrome://kmoney/content/tokenize.js");
Components.utils.import("chrome://kmoney/content/appInfo.js");

KmGlobals.disableChrome();

var kmoney;

function Kmoney() {
  this.mDb = null;
  this.cashTree = null;
  this.creditcardTree = null;
  this.bankTree = null;
  this.emoneyTree = null;
  this.maFileExt = [];
};

function Startup() {
  kmoney = new Kmoney();
  kmoney.Startup();
};
function Shutdown() {
  kmoney.Shutdown();
};

Kmoney.prototype.Startup = function() {
    this.mDb = new SQLiteHandler();
    this.maFileExt = [];
    this.cashTree = new CashTable();
    this.creditcardTree = new CreditCardTable();
    this.emoneyTree = new EMoneyTable();

    this.cashTree.initialize(this.mDb);
    this.creditcardTree.initialize(this.mDb);
    this.emoneyTree.initialize(this.mDb);

    this.addEventListeners();
    var bOpenLastDb = true;
    if (bOpenLastDb) {
      this.openLastDb();
    }
};
Kmoney.prototype.addEventListeners = function() {
  $$('kmc-openDb').addEventListener("command", function(){kmoney.openDatabase();});
  $$('km_tabs').addEventListener("select", function(){kmoney.onTabSelected();});
  $$('km_button_add').addEventListener("command", function(){kmoney.addRecord();});
  $$('km_tree_cash').addEventListener("select", function(){kmoney.onCashSelect();});
  $$('km_tree_creditcard').addEventListener("select", function(){kmoney.onCreditcardSelect();});
  $$('km_tree_emoney').addEventListener("select", function(){kmoney.onEMoneySelect();});
};
Kmoney.prototype.onCashSelect = function() {
  this.cashTree.onSelect();
}
Kmoney.prototype.onCreditcardSelect = function() {
  this.creditcardTree.onSelect();
}
Kmoney.prototype.onEMoneySelect = function() {
  this.emoneyTree.onSelect();
}
Kmoney.prototype.loadTable = function(tabId) {
  switch (tabId) {
    case 'km_tab_cash':
      this.cashTree.load();
      $$('bankbox').hidden = true;
      $$('creditcardbox').hidden = true;
      $$('emoneybox').hidden = true;
      break;
    case 'km_tab_bank':
      $$('bankbox').hidden = false;
      $$('creditcardbox').hidden = true;
      $$('emoneybox').hidden = true;
      break;
    case 'km_tab_creditcard':
      this.creditcardTree.load();
      $$('bankbox').hidden = true;
      $$('creditcardbox').hidden = false;
      $$('emoneybox').hidden = true;
      break;
    case 'km_tab_emoney':
      this.emoneyTree.load();
      $$('bankbox').hidden = true;
      $$('creditcardbox').hidden = true;
      $$('emoneybox').hidden = false;
      break;
  }
}
Kmoney.prototype.onTabSelected = function(e) {
  this.loadTable($$('km_tabbox').selectedTab.id);
};
Kmoney.prototype.openDatabaseFile = function(dbFile) {
  if(this.closeDatabase(false)) {
    try  {
       bConnected = this.mDb.openDatabase(dbFile, true);
    }
    catch (e)  {
      Components.utils.reportError('in function setDatabase - ' + e);
      km_message("Connect to '" + nsiFileObj.path + "' failed: " + e, 0x3);
      return false;
    }
    this.PopulateItemList();
    this.PopulateUserList();
    this.loadTable($$('km_tabbox').selectedTab.id);
    KmGlobals.mru.add(this.mDb.getFile().path);
    return true;
  }
  return false;
}
Kmoney.prototype.openDatabase = function() {
    const nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, km_getLStr("selectDb"), nsIFilePicker.modeOpen);
    var sExt = km_prefsBranch.getCharPref("sqliteFileExtensions");
    this.maFileExt = sExt.split(",");
    for (var iCnt = 0; iCnt < this.maFileExt.length; iCnt++) {
      sExt += "*." + this.maFileExt[iCnt] + ";";
    }
    fp.appendFilter(km_getLStr("sqliteDbFiles") + " (" + sExt + ")", sExt);
    fp.appendFilters(nsIFilePicker.filterAll);

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
      this.openDatabaseFile(fp.file);
    }
    return true;

}

Kmoney.prototype.openLastDb = function() {
    // opening with last used DB if preferences set to do so
    var bPrefVal = km_prefsBranch.getBoolPref("openWithLastDb");
    if(!bPrefVal)
      return;

    var sPath = KmGlobals.mru.getLatest();
    if(sPath == null)
      return;

    //Last used DB found, open this DB
    var newfile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    try {
      newfile.initWithPath(sPath);
    } catch (e) {
      kmPrompt.alert(null, km_getLStr("extName"), 'Failed to init local file using ' + sPath);
      return;
    }
    //if the last used file is not found, bail out
    if(!newfile.exists()) {
      kmPrompt.alert(null, km_getLStr("extName"), km_getLFStr("lastDbDoesNotExist",[sPath]));
      return;
    }

    bPrefVal = km_prefsBranch.getBoolPref("promptForLastDb");
    if(bPrefVal) {
      var check = {value: false}; // default the checkbox to false
      var result = kmPrompt.confirmCheck(null, km_getLStr("extName") + " - " + km_getLStr("promptLastDbTitle"), km_getLStr("promptLastDbAsk")+ "\n" + sPath + "?", km_getLStr("promptLastDbOpen"), check);

      if(!result)
        return;
      //update the promptForLastDb preference
      bPrefVal = km_prefsBranch.setBoolPref("promptForLastDb", !check.value);
    }
    //assign the new file (nsIFile) to the current database
    this.openDatabaseFile(newfile);
  };

Kmoney.prototype.PopulateItemList = function() {
    $$("item").removeAllItems();
    
    this.mDb.selectQuery("select rowid, name from km_item");
    var records = this.mDb.getRecords();
    
    for (var i = 0; i < records.length; i++) {
      $$("item").appendItem(records[i][1], records[i][0]);
    }
    
    $$("item").selectedIndex = 0;
    
  };
Kmoney.prototype.PopulateUserList = function() {
    $$("user").removeAllItems();
    
    this.mDb.selectQuery("select id, name from km_user");
    var records = this.mDb.getRecords();
    
    for (var i = 0; i < records.length; i++) {
      $$("user").appendItem(records[i][1], records[i][0]);
    }
    
    $$("user").selectedIndex = 0;
    
  };
Kmoney.prototype.newDatabase = function() {
  };
Kmoney.prototype.Shutdown = function() {
  
};
Kmoney.prototype.closeDatabase = function(bAlert) {
    //nothing to close if no database is already open
    if (!this.mDb.isConnected()) {
       if(bAlert)
        alert(km_getLStr("noOpenDb"));
      return true;
    }

     //if another file is already open, confirm before closing
     var answer = true;
     if(bAlert)
      answer = kmPrompt.confirm(null, km_getLStr("extName"), km_getLStr("confirmClose"));

    if(!answer)
      return false;


    //make the current database as null and
    //call setDatabase to do appropriate things
    this.mDb.closeConnection();
    return true;
  };
  
Kmoney.prototype.addRecord = function() {
    switch ($$('km_tabbox').selectedTab.id) {
      case 'km_tab_cash':
        this.cashTree.addRecord();
        break;
      case 'km_tab_bank':
        break;
      case 'km_tab_creditcard':
        this.creditcardTree.addRecord();
        break;
      case 'km_tab_emoney':
        this.emoneyTree.addRecord();
        break;
    }
};
Kmoney.prototype.updataRecord = function() {
  
};

//this object handles MRU using one preference 'jsonMruData'
KmGlobals.mru = {
  mbInit: false,
  mSize: 0,
  mList: [],
  mProfilePath: '',

  initialize: function() {
    try {
      this.convert();
    } catch (e) {}

    this.getPref();

    this.mProfilePath = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile).path;
    this.mbInit = true;
  },

  convert: function() {
    //use the two prefs and remove them; so, the following can happen only once.
    var sPref = km_prefsBranch.getComplexValue("mruPath.1", Ci.nsISupportsString).data;
    this.mList = sPref.split(",");
    this.mSize = km_prefsBranch.getIntPref("mruSize");

    km_prefsBranch.clearUserPref("mruPath.1");
    km_prefsBranch.clearUserPref("mruSize");

    this.setPref();
    return true;
  },

  add: function(sPath) {
    if (sPath.indexOf(this.mProfilePath) == 0)
      sPath = "[ProfD]" + sPath.substring(this.mProfilePath.length);

    var iPos = this.mList.indexOf(sPath);
    if (iPos >= 0) {
      //remove at iPos
      this.mList.splice(iPos, 1);
    }
    //add in the beginning
    this.mList.splice(0, 0, sPath);

    if (this.mList.length > this.mSize) {
      //remove the extra entries
      this.mList.splice(this.mSize, this.mList.length  - this.mSize);
    }

    this.setPref();
  },

  remove: function(sPath) {
    if (sPath.indexOf(this.mProfilePath) == 0)
      sPath = "[ProfD]" + sPath.substring(this.mProfilePath.length);

    var iPos = this.mList.indexOf(sPath);
    if (iPos >= 0) {
      //remove at iPos
      this.mList.splice(iPos, 1);
      this.setPref();
      return true;
    }
    return false;
  },

  getList: function() {
    if (!this.mbInit)
      this.initialize();

    var aList = [];
    for (var i = 0; i < this.mList.length; i++) {
      aList.push(this.getFullPath(this.mList[i]));
    }
    return aList;
  },

  getLatest: function() {
    if (!this.mbInit)
      this.initialize();

    if (this.mList.length > 0)
      return this.getFullPath(this.mList[0]);
    else
      return null;
  },

  getFullPath: function(sVal) {
    var sRelConst = "[ProfD]";
    if (sVal.indexOf(sRelConst) == 0)
      sVal = this.mProfilePath + sVal.substring(sRelConst.length);

    return sVal;
  },

  getPref: function() {
    try {
      var sPref = km_prefsBranch.getComplexValue("jsonMruData", Ci.nsISupportsString).data;
    } catch (e) {
      var sPref = km_prefsBranch.getCharPref("jsonMruData");
    }
    var obj = JSON.parse(sPref);
    this.mList = obj.list;
    this.mSize = obj.size;
  },

  setPref: function() {
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
