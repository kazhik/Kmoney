package RealMoneyTransactionManager;
use Any::Moose;
use DatabaseManager;
use RealMoneyTransaction;
use base 'TransactionManager';

has 'tableName' => (
	is => 'ro',
	default => 'km_realmoney_trns'
	);

sub addTransactionData
{
	my $self = shift(@_);
	my $transactionDate = shift(@_);
	my $itemId = shift(@_);
	my $detail = shift(@_);
	my $income = shift(@_);
	my $expense = shift(@_);
	my $internal = shift(@_);
	my $source = shift(@_);
	my $userId = shift(@_);

	my $trns = RealMoneyTransaction->new
		(transactionDate => $transactionDate,
		itemId => $itemId,
		detail => $detail,
		income => $income,
		expense => $expense,
		internal => $internal,
		source => $source,
		userId => $userId);

	$self->pushTransactionData($trns);

}
sub clear {
}

sub writeDB
{
	my $self = shift(@_);

	my $dbMgr = DatabaseManager->new;
	$dbMgr->open();

	my $trns_data;
	while ($trns_data = $self->popTransactionData()) {
		my %trns = (
			transaction_date => $trns_data->transactionDate(),
			detail => $trns_data->detail(),
			item_id => $trns_data->itemId(),
			income => $trns_data->income(),
			expense => $trns_data->expense(),
			user_id => $trns_data->userId(),
			internal => $trns_data->internal(),
			source => $trns_data->source(),
			last_update_date => \["DATETIME('now', 'localtime')"]
			);

		$dbMgr->execInsert($self->tableName(), %trns);
	}

	$dbMgr->close();

}
sub clearDB
{
	my $self = shift;
	my %where = ();

	my $dbMgr = DatabaseManager->new;
	$dbMgr->open();
	$dbMgr->execDelete($self->tableName(), %where);
	$dbMgr->close();
}
1;
