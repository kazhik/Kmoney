use strict;
use warnings;
use DatabaseManager;
use ItemInfo;
use RealMoneyTransactionManager;

my $dbname = shift(@ARGV);

if (!defined($dbname)) {
	die "Usage: perl KantanKakeibo.pl <database file>";
}

my $kantanDb = DatabaseManager->new;
my $realMgr = RealMoneyTransactionManager->new;
my $itemInfo = ItemInfo->new;

$itemInfo->load();

$kantanDb->open($dbname);

my $sql = "select A.date_time,";
$sql .= "A.balance_type, ";
$sql .= "B.item_name,";
$sql .= "C.detail_name, A.cash_value, A.information ";
$sql .= "from cash_flow A, balance_item B ";
$sql .= "left join item_detail C ";
$sql .= "on A.item_detail_id = C._id ";
$sql .= "where A.balance_item_id = B._id ";
$sql .= "order by A.date_time, A.time";

my $sth = $kantanDb->execRawSelect($sql);
my $rs;
while ($rs = $kantanDb->execFetch($sth)) {
	my %result = %$rs;
	my $transactionDate = $result{'date_time'};
	my $income;
	my $expense;
	if ($result{'balance_type'} == 0) {
		$expense = $result{'cash_value'};
	} else {
		$income = $result{'cash_value'};
	}
	my $itemName = $result{'item_name'};
	my $itemId = $itemInfo->getItemId($itemName);
	my $detail = "";
	# 内訳とメモが両方存在する場合、メモをカッコに入れる
	if (defined($result{'detail_name'})) {
		$detail = $result{'detail_name'};
		if ($result{'information'} ne "") {
			$detail = "($result{'information'})";
		}
	} else {
		$detail = $result{'information'};
	}

	$realMgr->addTransactionData(
		$transactionDate,
		$itemId,
		$detail,
		$income,
		$expense,
		0, # 内部フラグ
		3, # 入力元=外部DB
		1);
}
$kantanDb->close();

$realMgr->writeDB();
