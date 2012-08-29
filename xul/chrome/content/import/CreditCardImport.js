
function CreditCardImport(db, cardTbl) {
  AbstractImport.call(this, db);
  
  this.cardTable = cardTbl;
  this.cardId = 0;
}
CreditCardImport.prototype = Object.create(AbstractImport.prototype);




