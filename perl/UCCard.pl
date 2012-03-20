use strict;
use warnings;
use IO::File;
use CreditCardPaymentManager;

use encoding "utf-8";

my $cardId = 1;
my $cardMgr = CreditCardPaymentManager->new;

my $filename = shift(@ARGV);
my $infile = IO::File->new($filename, 'r') or die $!;
# UCカードのファイルはSJISでCSV
$infile->binmode(':encoding(shiftjis)');
my $paymonth;
while (not $infile->eof()) {
	my $readbuff = $infile->getline();
	my @rowdata = split(',', $readbuff);
	if (!defined($rowdata[0])) {
		next;
	}
	if (@rowdata > 1 && $rowdata[1] =~ /(\d{4}\/\d{2}\/\d{2})/) {
		my $trn_date = $rowdata[1];
		$trn_date =~ s/\//-/g;
		my $bought = $rowdata[6];
		my $amount = $rowdata[7];
		my $remainingBalance;
		# 一回払でない場合はどういうデータになるのか不明
		if ($rowdata[0] eq "１回払い") {
			$remainingBalance = 0;
		}
		$cardMgr->addPaymentData(
			$trn_date,
			$rowdata[3],
			$paymonth,
			$bought,
			$amount,
			$remainingBalance,
			$cardId,
			1);
	} elsif ($rowdata[0] eq "お支払日") {
		$rowdata[1] =~ /(\d{4})年(\d{2})月/;
		$paymonth = $1."-".$2;
	}
}
$infile->close();

$cardMgr->writeDB();

