package net.kazhik.android.kmoney;

import java.util.Calendar;


public class Month {
	private int year;
	private int month;
	
	public void set(int year, int month) {
		this.year = year;
		this.month = month;
	}
	public int getYear() {
		return year;
	}
	public int getMonth() {
		return month;
	}
	public void shiftMonth(int shift) {
		Calendar cal = Calendar.getInstance();
		cal.set(this.year, this.month, 1);
		cal.add(Calendar.MONTH, shift);
		
		this.year = cal.get(Calendar.YEAR);
		this.month = cal.get(Calendar.MONTH);
	}
}
