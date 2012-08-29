
function BankImport(db, bankTbl) {
  AbstractImport.call(this, db);
  
  this.bankTable = bankTbl;
  this.bankId = 0;
}
BankImport.prototype = Object.create(AbstractImport.prototype);




