package EMoneyTransaction;
use Any::Moose;
use base 'Transaction';

has moneyId => (is => 'ro');

has internal => (is => 'ro');

1;
