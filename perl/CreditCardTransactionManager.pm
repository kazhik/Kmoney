package CreditCardTransactionManager;
use Any::Moose;
use DatabaseManager;
use CreditCardTransaction;
use base 'TransactionManager';

has 'tableName' => (
	is => 'ro',
	default => 'km_creditcard_trns'
	);

sub getRowId
{
	my $self = shift(@_);
	my $transactionDate = shift(@_);
	my $expense = shift(@_);
	my $cardId = shift(@_);
	my $userId = shift(@_);

	my $field = "rowid";
	my %where = (
		transaction_date => $transactionDate,
		expense => $expense,
		card_id => $cardId,
		user_id => $userId);

	my $dbMgr = DatabaseManager->new;
	$dbMgr->open();
	my $hashRef = $dbMgr->execSelectOneRow($self->tableName(),
		$field, \%where);
	$dbMgr->close();
	if (!defined($hashRef)) {
		return 0;
	}
	my %row = %$hashRef;
	return $row{'rowid'};
}
sub addTransactionData
{
	my $self = shift(@_);
	my $transactionDate = shift(@_);
	my $itemId = shift(@_);
	my $detail = shift(@_);
	my $expense = shift(@_);
	my $cardId = shift(@_);
	my $source = shift(@_);
	my $userId = shift(@_);

	my $trns = CreditCardTransaction->new
		(transactionDate => $transactionDate,
		itemId => $itemId,
		detail => $detail,
		expense => $expense,
		cardId => $cardId,
		source => $source,
		userId => $userId);

	$self->pushTransactionData($trns);

}
sub clear
{
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
			expense => $trns_data->expense(),
			card_id => $trns_data->cardId(),
			user_id => $trns_data->userId(),
			source => $trns_data->source(),
			last_update_date => \["DATETIME('now', 'localtime')"]
			);

		$dbMgr->execInsert($self->tableName(), %trns);
	}

	$dbMgr->close();

}
sub clearDB
{
	my $self = shift(@_);
	my %where = ();

	my $dbMgr = DatabaseManager->new;
	$dbMgr->open();
	$dbMgr->execDelete($self->tableName(), %where);
	$dbMgr->close();
}
1;
