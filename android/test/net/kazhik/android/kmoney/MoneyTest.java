package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Locale;

import android.test.AndroidTestCase;

public class MoneyTest extends AndroidTestCase {

	
	public void testToString() {
		String symbol;
		String strValue;
		
		Money.setLocale(Locale.US);
		symbol = Money.getSymbol();
		strValue = Money.toString(new BigDecimal("90.021"));
		assertEquals(symbol + "90.02", strValue);

		strValue = Money.toString(new BigDecimal("4002323.2"));
		assertEquals(symbol + "4,002,323.2", strValue);
		
		strValue = Money.toString(new BigDecimal("70002"));
		assertEquals(symbol + "70,002", strValue);

		Money.setLocale(Locale.JAPAN);
		symbol = Money.getSymbol();
		strValue = Money.toString(new BigDecimal("90.021"));
		assertEquals(symbol + "90", strValue);

	}

	public void testToBigDecimal() {
		Money.setLocale(Locale.US);
		String symbol = Money.getSymbol();
		BigDecimal moneyValue;
		try {
			moneyValue = Money.toBigDecimal("234,090");
			assertEquals(0, moneyValue.compareTo(new BigDecimal("234090")));

			moneyValue = Money.toBigDecimal(symbol + "234,090");
			assertEquals(0, moneyValue.compareTo(new BigDecimal("234090")));
			
			moneyValue = Money.toBigDecimal(symbol + "300.033");
			assertEquals(0, moneyValue.compareTo(new BigDecimal("300.033")));
		} catch (ParseException e) {
			fail(e.getMessage());
			e.printStackTrace();
		}
	}
	public void testAdd() {
		String symbol;
		char separator;
		
		try {
			Money.setLocale(Locale.US);
			symbol = Money.getSymbol();
			
			String str = Money.add(symbol + "872,323", "2");
			assertEquals(symbol + "8,723,232", str);
			
			str = Money.add(symbol + "233", ".");
			assertEquals(symbol + "233.", str);
			
			str = Money.add(symbol + "1.22", "3");
			assertEquals(symbol + "1.22", str);
			
			str = Money.add(symbol + "1.22", "6");
			assertEquals(symbol + "1.22", str);
			
			Money.setLocale(Locale.FRANCE);
			symbol = Money.getSymbol();
			separator = Money.getSeparator();
			
			String str1 = Money.toString(new BigDecimal("33.3"));
			System.out.println(str1);
			str = Money.add(symbol + "33,", "3");
			assertEquals(symbol + "33,3", str);
		} catch (ParseException e) {
			fail(e.getMessage());
			e.printStackTrace();
		}
	}
	public void testBackspace() {
		String symbol;
		try {
			Money.setLocale(Locale.US);
			symbol = Money.getSymbol();
			String str = Money.backspace(symbol + "7,900.65");
			assertEquals(symbol + "7,900.6", str);
			str = Money.backspace(symbol + "12.1");
			assertEquals(symbol + "12.", str);
		} catch (ParseException e) {
			fail(e.getMessage());
			e.printStackTrace();
		}
		
	}

}
