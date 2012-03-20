package EMoneyTransactionManager;
use Any::Moose;
use DatabaseManager;
use EMoneyTransaction;
use base 'TransactionManager';

has moneyId => (is => 'rw');

has 'tableName' => (
	is => 'ro',
	default => 'km_emoney_trns'
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
	my $moneyId = shift(@_);
	my $source = shift(@_);
	my $userId = shift(@_);

	my $trns = EMoneyTransaction->new
		(transactionDate => $transactionDate,
		itemId => $itemId,
		detail => $detail,
		income => $income,
		expense => $expense,
		internal => $internal,
		moneyId => $moneyId,
		source => $source,
		userId => $userId);

	$self->pushTransactionData($trns);

}
sub clear {
}

sub writeDB {
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
			internal => $trns_data->internal(),
			money_id => $trns_data->moneyId(),
			user_id => $trns_data->userId(),
			source => $trns_data->source(),
			last_update_date => \["DATETIME('now', 'localtime')"]
			);

		$dbMgr->execInsert($self->tableName(), %trns);
	}

	$dbMgr->close();

}
sub clearDB {
	my $self = shift;
	my %where = ();

	my $dbMgr = DatabaseManager->new;
	$dbMgr->open();
	$dbMgr->execDelete($self->tableName(), %where);
	$dbMgr->close();
}
1;
