package BankInfo;
use Any::Moose;
use DatabaseManager;

has 'bankList' => (
	traits => ['Array'],
	is => 'ro',
	isa => 'ArrayRef',
	default => sub {[]},
	handles => {
		pushBankInfo => 'push',
	}
);

sub load
{
	my $self = shift(@_);

	my $dbMgr = DatabaseManager->new;

	$dbMgr->open();
	my $sth = $dbMgr->execSelect(
		'km_bank_info', 'rowid', 'name', 'user_id');
	my $rs;
	while ($rs = $dbMgr->execFetch($sth)) {
		$self->pushBankInfo($rs);
	}
	$dbMgr->close();

}
sub list
{
	my $self = shift(@_);

	my $bankArrayRef = $self->bankList();
	my $bankHashRef;
	foreach $bankHashRef (@$bankArrayRef) {
		my %bank = %$bankHashRef;
		print "$bank{'rowid'}:$bank{'name'}:$bank{'user_id'}\n";
	}
	
}
sub getBankId
{
	my $self = shift(@_);
	my $bankName = shift(@_);

	my $bankArrayRef = $self->bankList();
	for (my $i = 0; $i < @$bankArrayRef; $i++) {
		my %bank = %{$$bankArrayRef[$i]};
		if ($bank{'name'} eq $bankName) {
			return $bank{'rowid'};
		}

	}
	return 0;
}
sub getBankName
{
	my $self = shift(@_);
	my $bankId = shift(@_);

	my $bankArrayRef = $self->bankList();
	for (my $i = 0; $i < @$bankArrayRef; $i++) {
		my %bank = %{$$bankArrayRef[$i]};
		if ($bank{'rowid'} eq $bankId) {
			return $bank{'name'};
		}

	}
	return "";
}

1;
