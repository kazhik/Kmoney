package CreditCardPayment;
use Any::Moose;

has transactionId => (is => 'ro');
has transactionDate => (is => 'ro');
has detail => (is => 'ro');
has boughtAmount => (is => 'ro');
has payAmount => (is => 'rw');
has payMonth => (is => 'ro');
has remainingBalance => (is => 'ro');
has cardId => (is => 'ro');
has userId => (is => 'ro');

1;
