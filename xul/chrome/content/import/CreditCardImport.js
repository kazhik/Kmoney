
function CreditCardImport(db) {
  AbstractImport.call(this, db, km_getLStr("import.creditcard"));
  
}
CreditCardImport.prototype = Object.create(AbstractImport.prototype);




