package UserInfo;
use Any::Moose;
use DatabaseManager;

has 'userList' => (
	traits => ['Array'],
	is => 'ro',
	isa => 'ArrayRef',
	default => sub {[]},
	handles => {
		pushUser => 'push',
	}
);

sub load
{
	my $self = shift(@_);

	my $dbMgr = DatabaseManager->new;

	$dbMgr->open();
	my $sth = $dbMgr->execSelect('km_user', 'id', 'name');
	my $rs;
	while ($rs = $dbMgr->execFetch($sth)) {
		$self->pushUser($rs);
	}
	$dbMgr->close();

}
sub list
{
	my $self = shift(@_);

	my $userArrayRef = $self->userList();
	my $userHashRef;
	foreach $userHashRef (@$userArrayRef) {
		my %user = %$userHashRef;
		print "$user{'id'}:$user{'name'}\n";
	}
	
}
sub getUserId
{
	my $self = shift(@_);
	my $userName = shift(@_);

	my $userArrayRef = $self->userList();
	for (my $i = 0; $i < @$userArrayRef; $i++) {
		my %user = %{$$userArrayRef[$i]};
		if ($user{'name'} eq $userName) {
			return $user{'id'};
		}

	}
	return 0;
}
sub getUserName
{
	my $self = shift(@_);
	my $userId = shift(@_);

	my $userArrayRef = $self->userList();
	for (my $i = 0; $i < @$userArrayRef; $i++) {
		my %user = %{$$userArrayRef[$i]};
		if ($user{'id'} eq $userId) {
			return $user{'name'};
		}

	}
	return "";
}

1;
