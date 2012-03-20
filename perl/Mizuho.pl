use Finance::OFX::Parse::Simple;

use BankAccountTransactionManager;

my $filename = shift(@ARGV);

#みずほ銀行はOFX形式
my $parser = Finance::OFX::Parse::Simple->new;
my $arrayRef = $parser->parse_file($filename);

my $bankMgr = BankAccountTransactionManager->new;

my @array = @$arrayRef;
for ($i = 0; $i < @array; $i++) {
	my @trnsArray = ${$array[$i]}{'transactions'};
	for ($j = 0; $j < @trnsArray; $j++) {
		my @trns = @{$trnsArray[$j]};
		for ($k = 0; $k < @trns; $k++) {
			my %hdat = %{$trns[$k]};
			my $transactionDate = $hdat{'date'};
			my $detail = $hdat{'memo'};
			my $amount = $hdat{'amount'};
			my $income = 0;
			my $expense = 0;
			if ($amount < 0) {
				$expense = abs($amount);
			} else {
				$income = $amount;
			}
			print "$transactionDate,$detail,$income,$expense\n";
			$bankMgr->addTransactionData(
				$transactionDate,
				0, # item id
				$detail,
				$income,
				$expense,
				1, # bank id
				0, # internal
				2, # source
				1  # user id
				);
		}
	}
}
$bankMgr->writeDB();
