package CreditCardTransaction;
use Any::Moose;
use base 'Transaction';

has cardId => (is => 'rw');

1;
