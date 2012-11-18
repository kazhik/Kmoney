"use strict";

var switchUserDialog;

function SwitchUserDialog() {
    this.listeners = [];

    this.addEventListeners();  

    this.currentUser = window.arguments[1];

    this.populateUserList(window.arguments[0]);
};

function openSwitchUserDialog() {
    switchUserDialog = new SwitchUserDialog();
};

SwitchUserDialog.prototype.onAccept = function () {
    this.currentUser['user'] = $$('km_user_menulist').value;
    this.removeEventListeners();
};

SwitchUserDialog.prototype.onCancel = function () {

    this.removeEventListeners();
};


SwitchUserDialog.prototype.addEventListeners = function () {
    this.listeners['km_dialog_user.dialogaccept'] = this.onAccept.bind(this);
    $$('km_dialog_user').addEventListener("dialogaccept",
        this.listeners['km_dialog_user.dialogaccept']);

    this.listeners['km_dialog_user.dialogcancel'] = this.onCancel.bind(this);
    $$('km_dialog_user').addEventListener("dialogcancel",
        this.listeners['km_dialog_user.dialogcancel']);

};
SwitchUserDialog.prototype.removeEventListeners = function () {

    $$('km_dialog_user').removeEventListener("dialogaccept",
        this.listeners['km_dialog_user.dialogaccept']);

    $$('km_dialog_user').removeEventListener("dialogcancel",
        this.listeners['km_dialog_user.dialogcancel']);
};

SwitchUserDialog.prototype.populateUserList = function (users) {
    $$('km_user_menulist').removeAllItems();

    var idx = 0;
    var userNameList = Object.keys(users);
    for (var i = 0; i < userNameList.length; i++) {
        var userName = userNameList[i];
        if (users[userName] == this.currentUser['user']) {
            idx = i;
        }
        $$('km_user_menulist').appendItem(userName, users[userName]);
    }
    
    $$('km_user_menulist').selectedIndex = idx;
};
