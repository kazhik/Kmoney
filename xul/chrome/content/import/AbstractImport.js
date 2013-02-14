function AbstractImport(db, type) {
    this.mDb = db;
    this.type = type;
    this.importItemArray = [];
}

AbstractImport.prototype.loadImportConf = function (userId, srcName, loadCallback) {
    function onLoadSourceType(sourceType) {
        function onLoad(records) {
            var importConf = [];
            for (var i = 0; i < records.length; i++) {
                var importItem = {
                    "detail": records[i][0],
                    "categoryId": records[i][1],
                    "default": records[i][2],
                    "internal": records[i][3]
                }
                this.importItemArray.push(importItem);
            }
            loadCallback(sourceType);
        }
        this.mDb.import.load(userId, sourceType, srcName, onLoad.bind(this));
    }
    this.mDb.source.loadSourceType(this.type, onLoadSourceType.bind(this));

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
    var category = this.getItemInfo(detail);
    return category["categoryId"];

};