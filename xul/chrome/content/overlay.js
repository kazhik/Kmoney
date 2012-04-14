//the advice given at http://blogger.ziesemer.com/2007/10/respecting-javascript-global-namespace.html has been followed
if(!net) var net={};
if(!net.kazhik) net.kazhik={};

// The only global object here.
net.kazhik.kmoney = function() {
  //the following are private variables.

  //public object returned by this function
  var pub = {};

  pub.kmChrome = "chrome://kmoney/content/";

  // Clean up
  pub.shutdown = function() {
    window.removeEventListener("load", net.kazhik.kmoney.start, false);
    window.removeEventListener("unload", net.kazhik.kmoney.shutdown, false);
  };

  //only for firefox
  pub.start = function() {
    var cc = Components.classes;
    var ci = Components.interfaces;
    var md = window.QueryInterface(ci.nsIInterfaceRequestor)
      .getInterface(ci.nsIWebNavigation)
      .QueryInterface(ci.nsIDocShellTreeItem).rootTreeItem
      .QueryInterface(ci.nsIInterfaceRequestor)
      .getInterface(ci.nsIDOMWindow).document;

    var prefService = cc["@mozilla.org/preferences-service;1"].getService(ci.nsIPrefService).getBranch("extensions.kmoney.");
    var iVal = prefService.getIntPref("posInTargetApp");
    if (iVal == 0)
      md.getElementById("menuitem-kmoney").setAttribute("hidden", true);
    if (iVal == 1)
      md.getElementById("menuitem-kmoney").setAttribute("hidden", false);
  };

  pub.open = function() {
    var iOpenMode = 1;
    try {
      var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.kmoney.");
      iOpenMode = prefService.getIntPref("openMode");
    }
    catch(e) {
    }

    //for disabling chrome in firefox
    try {
      var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
      var navWindow = wm.getMostRecentWindow("navigator:browser");
      if (navWindow.XULBrowserWindow) {
        navWindow.XULBrowserWindow.inContentWhitelist.push("chrome://kmoney/content/kmoney.xul");
      }
    } catch (e) {
      Components.utils.reportError("Exception thrown during attempt to include extension's URL in inContentWhitelist for hiding chrome. The exception message is as follows:\n" + e.message);
    }

    switch (iOpenMode) {
      case 1:      //open a chrome window
        this.openInOwnWindow();
        break;
      case 2:      //open in a new tab
        openUILinkIn(this.kmChrome,"tab");
        break;
    }
  };

  //Sb & Tb
  pub.openInOwnWindow = function() {
    window.open(this.kmChrome, "", "chrome,resizable,centerscreen");
    return;
  };

  //Ko
  pub.openKo = function() {
    var iOpenMode = 1;
    try {
      var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.kmoney.");
      iOpenMode = prefService.getIntPref("openMode");
    }
    catch(e) {
    }

    switch (iOpenMode) {
      case 1:      //open a chrome window
        this.openInOwnWindow();
        break;
      case 2:      //open in a new tab
        ko.views.manager.doFileOpenAsync(this.kmChrome, 'browser');
        break;
    }
  };

  return pub;
}();

// Register handlers to maintain extension life cycle.
//window.addEventListener("load", kmoney.start, false);
//window.addEventListener("unload", kmoney.shutdown, false);

