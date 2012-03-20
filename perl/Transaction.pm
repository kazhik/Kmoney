package Transaction;
use Any::Moose;

has transactionDate => (is => 'rw');
has income => (is => 'rw');
has expense => (is => 'rw');
has itemId => (is => 'rw');
has detail => (is => 'rw');
has userId => (is => 'rw');
has source => (is => 'rw');
has memo => (is => 'rw');

1;
