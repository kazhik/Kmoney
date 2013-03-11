package net.kazhik.android.kmoney;


import java.text.ParseException;
import java.util.Locale;

import net.kazhik.android.kmoney.ui.Money;

import android.test.AndroidTestCase;

public class MoneyTest extends AndroidTestCase {

	public void testMoney2() {
	}

	public void testGetDecimalSeparator() {
	}

	public void testAddChar() {
		
		Money m = new Money();
		String result;
		
		try {
			m.setLocale(Locale.JAPAN);
			result = m.addChar('3');
			assertEquals(m.getSymbol() + "3", result);
			result = m.addChar('3');
			assertEquals(m.getSymbol() + "33", result);
			result = m.addChar('3');
			assertEquals(m.getSymbol() + "333", result);
			result = m.addChar('3');
			assertEquals(m.getSymbol() + "3,333", result);

			m.setLocale(Locale.US);
			result = m.addChar('4');
			result = m.addChar('3');
			result = m.addChar('2');
			result = m.addChar('1');
			result = m.addDecimalMark();
			assertEquals(m.getSymbol() + "4,321", result);
			result = m.addChar('9');
			assertEquals(m.getSymbol() + "4,321.9", result);
			
			m.setLocale(Locale.FRANCE);
			result = m.addChar('4');
			result = m.addChar('3');
			result = m.addChar('2');
			result = m.addChar('1');
			result = m.addDecimalMark();
			result = m.addChar('9');
			System.out.println(result);
		} catch (ParseException e) {
			fail(e.getMessage());
		}
	}
	
	public void testBackspace() {
		Money m = new Money();
		String result;
		String symbol;
		
		m.setLocale(Locale.JAPAN);
		symbol = m.getSymbol();

		m.setValue("12");
		result = m.backspace();
		assertEquals(symbol + "1", result);
		result = m.backspace();
		assertEquals(symbol + "0", result);
		
		m.setLocale(Locale.US);
		symbol = m.getSymbol();
		
		m.setValue("123.4");
		result = m.backspace();
		assertEquals(symbol + "123", result);
		result = m.backspace();
		assertEquals(symbol + "123", result);
		result = m.backspace();
		result = m.backspace();
		result = m.backspace();
		assertEquals(symbol + "0", result);
		
		
		
	}

}
