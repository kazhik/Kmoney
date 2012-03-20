package CreditCardInfo;
use Any::Moose;
use DatabaseManager;

has 'cardList' => (
	traits => ['Array'],
	is => 'ro',
	isa => 'ArrayRef',
	default => sub {[]},
	handles => {
		pushCardInfo => 'push',
	}
);

sub load
{
	my $self = shift(@_);

	my $dbMgr = DatabaseManager->new;

	$dbMgr->open();
	my $sth = $dbMgr->execSelect('km_creditcard_info', 'rowid', 'name');
	my $rs;
	while ($rs = $dbMgr->execFetch($sth)) {
		$self->pushCardInfo($rs);
	}
	$dbMgr->close();

}
sub list
{
	my $self = shift(@_);

	my $cardArrayRef = $self->cardList();
	my $cardHashRef;
	foreach $cardHashRef (@$cardArrayRef) {
		my %card = %$cardHashRef;
		print "$card{'rowid'}:$card{'name'}\n";
	}
	
}
sub getCardId
{
	my $self = shift(@_);
	my $cardName = shift(@_);

	my $cardArrayRef = $self->cardList();
	for (my $i = 0; $i < @$cardArrayRef; $i++) {
		my %card = %{$$cardArrayRef[$i]};
		if ($card{'name'} eq $cardName) {
			return $card{'rowid'};
		}

	}
	return 0;
}
sub getCardName
{
	my $self = shift(@_);
	my $cardId = shift(@_);

	my $cardArrayRef = $self->cardList();
	for (my $i = 0; $i < @$cardArrayRef; $i++) {
		my %card = %{$$cardArrayRef[$i]};
		if ($card{'rowid'} eq $cardId) {
			return $card{'name'};
		}

	}
	return "";
}

my $obj = CreditCardInfo->new;
$obj->load();
$obj->list();
