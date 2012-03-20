package DatabaseManager;
use Any::Moose;
use DBI;
use SQL::Abstract;
use Config::Pit;

has 'dbh' => (is => 'rw');
has 'sql' => (is => 'rw');

sub open
{
	my $self = shift(@_);
	my $db = shift(@_);
	if (!defined($db)) {
		my $conf = Config::Pit::get("localhost");
		$db = $conf->{kmoneydb};
	}
	my $data_source = "dbi:SQLite:dbname=$db";

	$self->dbh(DBI->connect($data_source));	

	$self->sql(SQL::Abstract->new());

	return $self->dbh();
}
sub close
{
	my $self = shift(@_);
	$self->dbh->disconnect();
}

sub ping
{
	my $self = shift(@_);
	if (!$self->dbh()->ping()) {
		return;
	}
}

sub execSelect
{
	my $self = shift(@_);
	my $tblname = shift(@_);
	my @fields = @_;

	my ($stmt, @bind) = $self->sql()->select($tblname, \@fields);
	my $sth = $self->dbh()->prepare($stmt);
	$sth->execute(@bind);

	return $sth;
}
sub execRawSelect
{
	my $self = shift(@_);
	my $stmt = shift(@_);

	my $sth = $self->dbh()->prepare($stmt);
	$sth->execute();

	return $sth;
}

sub execSelectOneRow
{
	my $self = shift(@_);
	my $tblname = shift(@_);
	my $fields = shift(@_);
	my $where = shift(@_);

	my ($stmt, @bind) = $self->sql()->select($tblname, $fields, $where);
	my $sth = $self->dbh()->prepare($stmt);
	$sth->execute(@bind);

	return $sth->fetchrow_hashref();
}

sub execFetch
{
	my $self = shift(@_);
	my $sth = shift(@_);

	return $sth->fetchrow_hashref();
}

sub execInsert
{
	my $self = shift(@_);
	my $tblname = shift(@_);
	my %trn_data = @_;

	my ($stmt, @bind) = $self->sql()->insert($tblname, \%trn_data);
	my $sth = $self->dbh()->prepare($stmt);
	$sth->execute(@bind);
}

sub execDelete
{
	my $self = shift(@_);
	my $tblname = shift(@_);
	my %where = @_;

	my ($stmt, @bind) = $self->sql()->delete($tblname, \%where);
	my $sth = $self->dbh()->prepare($stmt);
	$sth->execute(@bind);
}

1;
