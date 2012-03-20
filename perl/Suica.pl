#!/usr/bin/perl

use strict;
use warnings;
use LWP::UserAgent;
use HTML::TreeBuilder;
use DateTime;
use IO::File;
use Encode;

use EMoneyTransactionManager;

use encoding "utf-8";

sub trim
{
	my $str = $_[0];
	$str =~ s/^\s+//g;
	$str =~ s/\s+$//g;
	return $str;
}

if (@ARGV < 1) {
	print "Usage: perl Suica.pl <file>\n";
	exit;
}
my $filename = shift(@ARGV);
my $infile = IO::File->new($filename, 'r') or die $!;
# SuicaのファイルはSJIS
$infile->binmode(':encoding(shiftjis)');
my $readdata = "";
while (not $infile->eof()) {
	$readdata .= $infile->getline();
}

my $tree = HTML::TreeBuilder->new;
$tree->parse($readdata);

my $tabledata = $tree->look_down("class", "grybg01");

my $currentDt = DateTime->now;

my $emoneyMgr = EMoneyTransactionManager->new;

my @rowdata = $tabledata->find_by_tag_name("tr");
binmode(STDOUT, ":utf8");
my $prevBalance = -1;
for (my $i = @rowdata-1; $i >= 0; $i--) {
	my @columndat = $rowdata[$i]->look_down("class", "whtbg");
	if (@columndat == 0) {
		next;
	}
	$columndat[0]->as_text =~ /(\d{2})\/(\d{2})/;
	my $month = $1;
	my $date = $2;
	my $year = $currentDt->year;
	if ($month > $currentDt->month) {
		$year--;
	}
	my $transactionDate = "$year-$month-$date";
	
	my $detail = trim($columndat[1]->as_text);

	my $itemId = 0;
	# 第4カラムがある場合は電車
	if ($columndat[4]->as_text ne "") {
		$detail .= ":";
		$detail .= trim($columndat[2]->as_text);
		$detail .= "-";
		$detail .= trim($columndat[3]->as_text);
		$detail .= ":";
		$detail .= trim($columndat[4]->as_text);
		$itemId = 5; # 交通費
	}
	my $balance = trim($columndat[5]->as_text);
	$balance =~ s/[,\\]//g;
	if ($detail eq "繰") {
		$prevBalance = $balance;
		next;
	}
	my $internal = 0;
	# 残高を前回と比べ、収入か支出かを判定
	my $expense = 0;
	my $income = 0;
	if ($prevBalance > $balance) {
		$expense = $prevBalance - $balance;
	} else {
		$internal = 1;
		$income = $balance - $prevBalance;
	}
	$emoneyMgr->addTransactionData(
		$transactionDate,
		$itemId,
		$detail,
		$income,
		$expense,
		$internal,
		1, # マネーID
		2, # 入力元: ファイル
		1 # UserID
		);
	$prevBalance = $balance;
}

$emoneyMgr->writeDB();
