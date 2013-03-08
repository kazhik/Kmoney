package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Currency;
import java.util.Locale;

public class Money {
	private String str;
	private BigDecimal value;
	private NumberFormat currencyFormat;
	private int fractionDigits;
	private char decimalSeparator;
	private String symbol;

	public Money() {
		this.setLocale(Locale.getDefault());
	}
	public Money(Locale locale) {
		this.setLocale(locale);
	}
	public void setLocale(Locale locale) {
		this.currencyFormat = NumberFormat.getCurrencyInstance(locale);
		this.currencyFormat.setMinimumFractionDigits(0);
		
		this.value = new BigDecimal("0");
		this.value.setScale(this.fractionDigits, RoundingMode.DOWN);
		
		this.str = "0";
		
		this.fractionDigits =
				Currency.getInstance(locale).getDefaultFractionDigits();
	
		DecimalFormatSymbols dfs = new DecimalFormatSymbols(locale);
		this.decimalSeparator = dfs.getDecimalSeparator();

		this.symbol = dfs.getCurrencySymbol();
		
		
	}
	public char getDecimalMark() {
		return this.decimalSeparator;
	}
	public String getSymbol() {
		return this.symbol;
	}
	public int getFractionDigits() {
		return this.fractionDigits;
	}
	public String addDecimalMark() throws ParseException {
		return this.addChar(this.decimalSeparator);
	}
	public String addChar(char newChar) throws ParseException {
		if (this.str.equals("0")) {
			this.str = "";
		}
		if (newChar == this.decimalSeparator) {
			if (this.str.indexOf('.') == -1) {
				this.str += '.';
			}
		} else {
			this.str += newChar;
		}
		
		if (newChar != this.decimalSeparator) {
			this.value = new BigDecimal(this.str);
		}
		return this.currencyFormat.format(this.value);
	}
	public String setValue(String valueStr) {
		this.str = valueStr;
		this.value = new BigDecimal(this.str);
		return this.currencyFormat.format(this.value);
		
	}
	public boolean isZero() {
		return (this.value.compareTo(new BigDecimal(0)) == 0);
	}
	public BigDecimal getValue() {
		return this.value;
	}
	public String backspace() {
		if (!this.str.equals("0")) {
			if (this.str.length() == 1) {
				this.str = "0";
			} else {
				this.str = this.str.substring(0, this.str.length() - 1);
			}
			
		}
		String valStr = this.str;
		if (valStr.charAt(valStr.length() - 1) == '.') {
			valStr = valStr.substring(0, valStr.length() - 1);
		}
		this.value = new BigDecimal(valStr);

		return this.currencyFormat.format(this.value);

	}
	

}
