package CreditCardPaymentManager;
use Any::Moose;
use DatabaseManager;
use CreditCardPayment;
use CreditCardTransactionManager;

has 'tableName' => (
	is => 'ro',
	default => 'km_creditcard_payment'
	);

has 'paymentDataList' => (
	traits => ['Array'],
	is => 'ro',
	isa => 'ArrayRef',
	default => sub {[]},
	handles => {
		pushBack => 'push',
		popBack => 'pop',
		popFront => 'shift',
	}
);

sub updateLastPayAmount
{
	my $self = shift(@_);
	my $amount = shift(@_);

	my $trns_data = $self->popBack();
	$amount += $trns_data->payAmount();
	$trns_data->payAmount($amount);
	$trns_data->payAmount();
	$self->pushBack($trns_data);
}
sub addPaymentData
{
	my $self = shift(@_);
	my $transactionDate = shift(@_);
	my $detail = shift(@_);
	my $payMonth = shift(@_);
	my $bought = shift(@_);
	my $payAmount = shift(@_);
	my $remainingBalance = shift(@_);
	my $cardId = shift(@_);
	my $userId = shift(@_);

	my $trns = CreditCardPayment->new
		(transactionDate => $transactionDate,
		detail => $detail,
		boughtAmount => $bought,
		payAmount => $payAmount,
		payMonth => $payMonth,
		remainingBalance => $remainingBalance,
		cardId => $cardId,
		userId => $userId);

	$self->pushBack($trns);

}
sub clear
{
}

sub writeDB
{
	my $self = shift(@_);

	my $dbMgr = DatabaseManager->new;
	my $trnMgr = CreditCardTransactionManager->new;

	$dbMgr->open();
	my $rowId;
	my $trns_data;
	while ($trns_data = $self->popFront()) {
		$rowId = $trnMgr->getRowId(
			$trns_data->transactionDate(),
			$trns_data->boughtAmount(),
			$trns_data->cardId(),
			$trns_data->userId());
		my %trns = (
			transaction_id => $rowId,
			transaction_date => $trns_data->transactionDate(),
			detail => $trns_data->detail(),
			pay_month => $trns_data->payMonth(),
			bought_amount => $trns_data->boughtAmount(),
			pay_amount => $trns_data->payAmount(),
			remaining_balance => $trns_data->remainingBalance(),
			card_id => $trns_data->cardId(),
			user_id => $trns_data->userId(),
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
