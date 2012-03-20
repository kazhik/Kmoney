#!/usr/bin/perl
# Viewカード利用明細(HTML)をCSV形式に変換

use strict;
use warnings;
use Encode;
use LWP::UserAgent;
use HTML::TreeBuilder;

use encoding "utf-8";

if (@ARGV < 1) {
	print "Usage: perl ViewCard.pl <file>\n";
	exit;
}
my $readdata = "";
while (<>) {
	$readdata .= decode("sjis", $_);
}

my $tree = HTML::TreeBuilder->new;
$tree->parse($readdata);

my $paydate = $tree->look_down("id", "LblPayDte");
print "支払日:".$paydate->as_text."\n";
my $payamount = $tree->look_down("id", "LblMemPayMon")->as_text;
$payamount =~ s/,//g;
print "支払金額:".$payamount."\n";
my $tabledata = $tree->look_down("class", "listtable2");

my @rowdata = $tabledata->find_by_tag_name("tr");
my $i;
my @columndat;
my $price;
my $detail;
my $pay_type;
my $pay_amount;
my $expense;
my $str;
for ($i = 0; $i < @rowdata; $i++) {
	$str = $rowdata[$i]->look_down("id", qr/RtUseInfoList__ctl[\d]+_LblUseDte/);
	# 一段目
	if (defined($str)) {
		print $str->as_text.",";
		@columndat = $rowdata[$i]->find_by_tag_name("td");
		# なぜか「今回ご請求額」はthになっている。バグ？
		$price = $rowdata[$i]->find_by_tag_name("th")->as_text;
		$price =~ s/,//g;
		$detail = $columndat[2]->as_text;
		print $detail.",";
		$pay_type = $columndat[5]->as_text;
		print $pay_type.",";
		print $price."\n";
	# 二段目
	} else {
		@columndat = $rowdata[$i]->find_by_tag_name("td");
		if (@columndat > 0) {
			$expense = $columndat[0]->as_text;
			print $expense."\n";
		}
	}
}

