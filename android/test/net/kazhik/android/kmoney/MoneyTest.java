package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.ParseException;

import android.test.AndroidTestCase;

public class MoneyTest extends AndroidTestCase {

	public void testToString() {
		String symbol = NumberFormat.getCurrencyInstance().getCurrency().getSymbol();
		
		String strValue = Money.toString(new BigDecimal("90.021"));
		assertEquals(symbol + "90.02", strValue);
		
		strValue = Money.toString(new BigDecimal("4002323.2"));
		assertEquals(symbol + "4,002,323.2", strValue);
		
		strValue = Money.toString(new BigDecimal("70002"));
		assertEquals(symbol + "70,002", strValue);
	}

	public void testToBigDecimal() {
		String symbol = NumberFormat.getCurrencyInstance().getCurrency().getSymbol();
		BigDecimal moneyValue;
		try {
			moneyValue = Money.toBigDecimal("234,090");
			assertEquals(0, moneyValue.compareTo(new BigDecimal("234090")));

			moneyValue = Money.toBigDecimal(symbol + "234,090");
			assertEquals(0, moneyValue.compareTo(new BigDecimal("234090")));
			
			moneyValue = Money.toBigDecimal(symbol + "300.033");
			assertEquals(0, moneyValue.compareTo(new BigDecimal("300.033")));
		} catch (ParseException e) {
			e.printStackTrace();
		}
	}
	public void testAdd() {
		String symbol = NumberFormat.getCurrencyInstance().getCurrency().getSymbol();
		try {
			String str = Money.add(symbol + "872,323", "2");
			assertEquals(symbol + "8,723,232", str);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public void testBackspace() {
		String symbol = NumberFormat.getCurrencyInstance().getCurrency().getSymbol();
		try {
			String str = Money.backspace(symbol + "7,900.65");
			assertEquals(symbol + "7,900.6", str);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

}
