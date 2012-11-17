function AbstractImport(db, type) {
    this.mDb = db;
    this.type = type;
    this.importItemArray = [];
}

AbstractImport.prototype.loadImportConf = function (srcName, loadCallback) {
    function onLoadSourceType(sourceType) {
        function onLoad(records) {
            var importConf = [];
            for (var i = 0; i < records.length; i++) {
                var importItem = {
                    "detail": records[i][0],
                    "itemId": records[i][1],
                    "default": records[i][2],
                    "internal": records[i][3]
                }
                this.importItemArray.push(importItem);
            }
            loadCallback(sourceType, this.importItemArray);
        }
        this.mDb.import.load(sourceType, onLoad.bind(this));
    }
    this.mDb.source.loadSourceType(srcName, onLoadSourceType.bind(this));

};

AbstractImport.prototype.getItemInfo = function (detail) {
    var defaultItem = {};
    for (var i = 0; i < this.importItemArray.length; i++) {
        if (this.importItemArray[i]["default"] == 1) {
            defaultItem = this.importItemArray[i];
        } else if (detail.search(this.importItemArray[i]["detail"]) != -1) {
            return this.importItemArray[i];
        }
    }
    return defaultItem;

};

AbstractImport.prototype.getItemId = function (detail) {
    var itemInfo = this.getItemInfo(detail);
    return itemInfo["itemId"];

};