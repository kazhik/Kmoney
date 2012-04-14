let EXPORTED_SYMBOLS = ["KmAppInfo"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var extId = "Kmoney@kazhik.net";

var KmAppInfo = {
  appInfo: Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo),
  extVersion: "",
  extCreator: "kazhik",

  webpages: {
    home: "https://github.com/kazhik/Kmoney/",
    issueNew: "http://code.google.com/p/sqlite-manager/issues/entry",
    sqliteHome: "http://www.sqlite.org/",
    sqliteLang: "http://www.sqlite.org/lang.html",
    mpl: "http://www.mozilla.org/MPL/MPL-1.1.html"
  },

  setVersion: function() {
    if (this.appInfo.ID == extId) {
      this.extVersion = this.appInfo.version;
    }
    else {
      try {
        Cu.import("resource://gre/modules/AddonManager.jsm");
        AddonManager.getAddonByID(extId, function(addon) {
          KmAppInfo.extVersion = addon.version;
        });
        //while (this.extVersion == "") {}      
      }
      catch (ex) {
        this.extVersion = "xxx";
      }
      //return this.extVersion;
    }
  },

  getVersion: function() {
    if (this.appInfo.ID == extId) {
      return this.appInfo.version;
    }
    else {
      return this.extVersion;
    }
  },

  getCreator: function() {
    if (this.appInfo.ID == extId) {
      return this.appInfo.vendor;
    }
    else {
      return this.extCreator;
    }
  }
};
