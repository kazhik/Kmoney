package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Currency;
import java.util.Locale;

public class Money {
	static private int fractionDigits;
	static private NumberFormat currencyFormat;
	static private DecimalFormat numFormat;
	static private char decimalSeparator;
	static private String symbol;
	
	static {
		setLocale(Locale.getDefault());
	}
	public static void setLocale(Locale locale) {
		fractionDigits =
				Currency.getInstance(locale).getDefaultFractionDigits();
		
		currencyFormat = NumberFormat.getCurrencyInstance(locale);
		currencyFormat.setMinimumFractionDigits(0);
		
		numFormat = (DecimalFormat)NumberFormat.getInstance(locale);
		numFormat.setParseBigDecimal(true);
		
		String str = currencyFormat.format(0);
		symbol = str.substring(0, str.length() - 1);

		DecimalFormatSymbols dfs = new DecimalFormatSymbols(locale);
		decimalSeparator = dfs.getDecimalSeparator();
	}
	public static String getSymbol() {
		return symbol;
	}
	public static char getSeparator() {
		return decimalSeparator;
	}

	public static String toString(BigDecimal moneyValue) {
		return currencyFormat.format(
				moneyValue.setScale(fractionDigits, RoundingMode.DOWN));
	}
	public static int getDefaultFractionDigits() {
		return fractionDigits;
	}
	
	public static BigDecimal toBigDecimal(String moneyValue) throws ParseException {
		Number num = currencyFormat.parse(moneyValue);
		return new BigDecimal(num.toString());
		
	}
	public static String add(String currentValue, String newNumber) throws ParseException {
		String plainStr = "";
		if (currentValue.length() > 0) {
			plainStr = Money.toBigDecimal(currentValue).toPlainString();
			if (currentValue.charAt(currentValue.length() - 1) == decimalSeparator ) {
				plainStr += decimalSeparator;
			}
		}
		String formatted = Money.toString(Money.toBigDecimal(plainStr + newNumber));
		if (newNumber.equals(Character.toString(decimalSeparator))) {
			formatted += newNumber;
		}
		return formatted;
	}
	public static String backspace(String currentValue) throws ParseException {
		String plainStr = Money.toBigDecimal(currentValue).toPlainString();
		plainStr = plainStr.substring(0,  plainStr.length() - 1);
		if (plainStr.length() == 0) {
			return "";
		}
		String formatted = Money.toString(new BigDecimal(plainStr));
		if (plainStr.charAt(plainStr.length() - 1) == decimalSeparator ) {
			formatted += decimalSeparator;
		}
		
		return formatted;
	}

}
