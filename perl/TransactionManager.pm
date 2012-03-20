package TransactionManager;
use Any::Moose;

has 'trnsDataList' => (
	traits => ['Array'],
	is => 'ro',
	isa => 'ArrayRef',
	default => sub {[]},
	handles => {
		pushTransactionData => 'push',
		popTransactionData => 'shift',
	}
);


1;
