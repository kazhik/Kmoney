package RealMoneyTransaction;
use Any::Moose;
use base 'Transaction';

has internal => (is => 'rw');


1;
