package net.kazhik.android.kmoney;

import java.util.Calendar;
import java.util.Locale;

import android.test.AndroidTestCase;

public class MonthTest extends AndroidTestCase {
	public void testMonth() {
		Month month = new Month(this.getContext());
		
		month.set(2013, 4);
		assertEquals(2013, month.getYear());
		assertEquals(4, month.getMonth());
		
		month.nextMonth();
		assertEquals(5, month.getMonth());
		month.prevMonth();
		assertEquals(4, month.getMonth());
		month.thisMonth();
		Calendar cal = Calendar.getInstance();
		assertEquals(cal.get(Calendar.YEAR), month.getYear());
		assertEquals(cal.get(Calendar.MONTH) + 1, month.getMonth());
	}
	public void testGetText() {
		Month month = new Month(this.getContext());
		month.set(2014, 9);
		if (Locale.getDefault().equals(Locale.JAPAN)) {
			assertEquals("2014年9月", month.getText());
		} else if (Locale.getDefault().equals(Locale.US)) {
			assertEquals("Sep 2014", month.getText());
		}
		
	}

}
