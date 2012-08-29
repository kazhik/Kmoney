
function AbstractImport(db) {
  this.mDb = db;
  this.userId = 0;
  
  this.sourceType = 0;
  this.importItemArray = [];
}

AbstractImport.prototype.loadSourceType = function(srcName) {
    this.mDb.selectQuery("select rowid from km_source where type = '" + srcName + "'" );
    var records = this.mDb.getRecords();
    if (records.length === 1) {
      this.sourceType = records[0][0];
    }
};

AbstractImport.prototype.loadImportConf = function() {
    this.mDb.selectQuery("select detail, item_id, default_id, internal "
                         + "from km_import "
                         + "where source_type = " + this.sourceType);
    
    var records = this.mDb.getRecords();

    for (var i = 0; i < records.length; i++) {
      var importItem = {
        "detail": records[i][0],
        "itemId": records[i][1],
        "default" : records[i][2],
        "internal": records[i][3]
      }
      this.importItemArray.push(importItem);
    }
};

AbstractImport.prototype.getItemInfo = function(detail) {
  var defaultItem = {};
  for (var i in this.importItemArray) {
    if (this.importItemArray[i]["default"] == 1) {
      defaultItem = this.importItemArray[i];
    } else if (detail.search(this.importItemArray[i]["detail"]) != -1) {
      return this.importItemArray[i];
    }
  }
  return defaultItem;

};


