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
    github: "http://kazhik.github.com/Kmoney/"
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
