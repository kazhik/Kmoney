
function EMoneyImport(db) {
  AbstractImport.call(this, db, km_getLStr("import.emoney"));
  
}
EMoneyImport.prototype = Object.create(AbstractImport.prototype);




