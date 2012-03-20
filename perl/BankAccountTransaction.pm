package BankAccountTransaction;
use Any::Moose;
use base 'Transaction';

has bankId => (is => 'rw');
has internal => (is => 'rw');

1;
