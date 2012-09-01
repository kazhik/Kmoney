
function EMoneyImport(db, emoneyTbl) {
  AbstractImport.call(this, db);
  
  this.emoneyTable = emoneyTbl;
  this.emoneyId = 0;
}
EMoneyImport.prototype = Object.create(AbstractImport.prototype);




