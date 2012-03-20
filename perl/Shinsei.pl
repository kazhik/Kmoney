use strict;
use warnings;
use IO::File;
use BankAccountTransactionManager;

use encoding "utf-8";

my $bankId = 2;
my $bankMgr = BankAccountTransactionManager->new;

my $filename = shift(@ARGV);
my $infile = IO::File->new($filename, 'r') or die $!;
# 新生銀行のファイルはUTF16でタブ区切り
$infile->binmode(':encoding(utf16)');
while (not $infile->eof()) {
	my $readbuff = $infile->getline();
	my @rowdata = split('\t', $readbuff);
	if ($rowdata[0] =~ /(\d{4}\/\d{2}\/\d{2})/) {
		if ($rowdata[2] !~ /振込手数料/) {
			my $trn_date = $rowdata[0];
			$trn_date =~ s/\//-/g;
			$bankMgr->addTransactionData(
				$trn_date,
				1,
				$rowdata[2],
				$rowdata[4],
				$rowdata[3],
				$bankId,
				0,
				2,
				1);
		}
	}
}
$infile->close();

$bankMgr->writeDB();
