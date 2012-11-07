
function BankImport(db) {
  AbstractImport.call(this, db, km_getLStr("import.bank"));
  
}
BankImport.prototype = Object.create(AbstractImport.prototype);





