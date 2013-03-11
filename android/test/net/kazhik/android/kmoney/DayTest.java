package net.kazhik.android.kmoney;

import java.util.Calendar;
import java.util.Locale;

import net.kazhik.android.kmoney.ui.Day;

import android.test.AndroidTestCase;

public class DayTest extends AndroidTestCase {
	
	public void testDay() {
		Day day = new Day(this.getContext());
		
		day.set(2013, 2, 10);
		assertEquals(2013, day.getYear());
		assertEquals(2, day.getMonth());
		assertEquals(10, day.getDay());
		
		day.set(2013, 2, 28);
		day.nextDay();
		assertEquals(2013, day.getYear());
		assertEquals(3, day.getMonth());
		assertEquals(1, day.getDay());

		day.set(2014, 1, 1);
		day.prevDay();
		assertEquals(2013, day.getYear());
		assertEquals(12, day.getMonth());
		assertEquals(31, day.getDay());
		
		day.today();
		Calendar calToday = Calendar.getInstance();
		assertEquals(calToday.get(Calendar.YEAR), day.getYear());
		assertEquals(calToday.get(Calendar.MONTH) + 1, day.getMonth());
		assertEquals(calToday.get(Calendar.DAY_OF_MONTH), day.getDay());
	}
	public void testText() {
		Day day = new Day(this.getContext());
		day.set(2013, 2, 10);
		if (Locale.getDefault().equals(Locale.JAPAN)) {
			assertEquals("2013年2月10日(日)", day.getText());
		} else if (Locale.getDefault().equals(Locale.US)) {
			assertEquals("Sun, Feb 10, 2013", day.getText());
		}
	
	}
}
