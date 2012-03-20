package ItemInfo;
use Any::Moose;
use DatabaseManager;

has 'itemList' => (
	traits => ['Array'],
	is => 'ro',
	isa => 'ArrayRef',
	default => sub {[]},
	handles => {
		pushItem => 'push',
	}
);

sub load
{
	my $self = shift(@_);

	my $dbMgr = DatabaseManager->new;

	$dbMgr->open();
	my $sth = $dbMgr->execSelect('km_item', 'rowid', 'name');
	my $rs;
	while ($rs = $dbMgr->execFetch($sth)) {
		$self->pushItem($rs);
	}
	$dbMgr->close();

}
sub list
{
	my $self = shift(@_);

	my $itemArrayRef = $self->itemList();
	my $itemHashRef;
	foreach $itemHashRef (@$itemArrayRef) {
		my %item = %$itemHashRef;
		print "$item{'rowid'}:$item{'name'}\n";
	}
	
}
sub getItemId
{
	my $self = shift(@_);
	my $itemName = shift(@_);

	my $itemArrayRef = $self->itemList();
	for (my $i = 0; $i < @$itemArrayRef; $i++) {
		my %item = %{$$itemArrayRef[$i]};
		if ($item{'name'} eq $itemName) {
			return $item{'rowid'};
		}

	}
	return 0;
}
sub getItemName
{
	my $self = shift(@_);
	my $itemId = shift(@_);

	my $itemArrayRef = $self->itemList();
	for (my $i = 0; $i < @$itemArrayRef; $i++) {
		my %item = %{$$itemArrayRef[$i]};
		if ($item{'rowid'} eq $itemId) {
			return $item{'name'};
		}

	}
	return "";
}

1;
