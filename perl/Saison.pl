use strict;
use warnings;
use IO::File;
use CreditCardPaymentManager;

use encoding "utf-8";

my $cardId = 2;
my $cardMgr = CreditCardPaymentManager->new;

my $filename = shift(@ARGV);
my $infile = IO::File->new($filename, 'r') or die $!;
# セゾンカードのファイルはSJISでCSV
$infile->binmode(':encoding(shiftjis)');
my $paymonth;
while (not $infile->eof()) {
	my $readbuff = $infile->getline();
	my @rowdata = split(',', $readbuff);
	if (!defined($rowdata[0])) {
		next;
	}
	if ($rowdata[0] =~ /(\d{4}\/\d{2}\/\d{2})/) {
		my $trn_date = $rowdata[0];
		$trn_date =~ s/\//-/g;
		my $bought = $rowdata[5];
		my $amount = $rowdata[6];
		$amount =~ tr/０１２３４５６７８９/0123456789/;
		$amount =~ s/[，円]//g;
		$amount =~ s/割引対象優待後金額：//;
		my $remainingBalance;
		# 一回払でない場合はどういうデータになるのか不明
		if ($rowdata[3] eq "１回") {
			$remainingBalance = 0;
		}
		$cardMgr->addPaymentData(
			$trn_date,
			$rowdata[1],
			$paymonth,
			$bought,
			$amount,
			$remainingBalance,
			$cardId,
			1);
	} elsif (@rowdata > 6 && $rowdata[6] =~ /割引除外金額　　　：(\w+)円/) {
		my $amount = $1;
		$amount =~ tr/０１２３４５６７８９/0123456789/;
		$cardMgr->updateLastPayAmount($amount);
	} elsif ($rowdata[0] eq "お支払日") {
		$rowdata[1] =~ /(\d{4}\/\d{2})\/\d{2}/;
		$paymonth = $1;
		$paymonth =~ s/\//-/g;
	}
}
$infile->close();

$cardMgr->writeDB();

