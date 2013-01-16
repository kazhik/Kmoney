package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.ParseException;

public class Money {

	public static String toString(BigDecimal moneyValue) {
		NumberFormat nf = NumberFormat.getCurrencyInstance();
		nf.setMinimumFractionDigits(0);
		return nf.format(moneyValue);
	}
	
	public static BigDecimal toBigDecimal(String moneyValue) throws ParseException {
		NumberFormat nf = NumberFormat.getCurrencyInstance();
		
		return new BigDecimal(nf.parse(moneyValue).toString());
		/*

		NumberFormat nf = NumberFormat.getCurrencyInstance();
		String str = moneyValue.replace(nf.getCurrency().getSymbol(), "");
		str = str.replace(",", "");
		return new BigDecimal(str);
		*/
	}
	public static String add(String currentValue, String newNumber) throws ParseException {
		String plainStr = "";
		if (currentValue.length() > 0) {
			plainStr = Money.toBigDecimal(currentValue).toPlainString();
		}
		return Money.toString(new BigDecimal(plainStr + newNumber));
	}
	public static String backspace(String currentValue) throws ParseException {
		String plainStr = Money.toBigDecimal(currentValue).toPlainString();
		plainStr = plainStr.substring(0,  plainStr.length() - 1);
		if (plainStr.length() == 0) {
			return "";
		}
		return Money.toString(new BigDecimal(plainStr));
	}

}
