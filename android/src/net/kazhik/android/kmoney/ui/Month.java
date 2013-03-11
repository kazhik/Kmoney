package net.kazhik.android.kmoney.ui;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

import net.kazhik.android.kmoney.R;
import android.content.Context;


public class Month {
	private Calendar month;
	private Context context;
	
	public Month(Context context) {
		this.context = context;
		this.month = Calendar.getInstance();
	}
	
	public void set(int year, int month) {
		this.month.set(Calendar.YEAR, year);
		this.month.set(Calendar.MONTH, month - 1);
	}
	public int getYear() {
		return this.month.get(Calendar.YEAR);
	}
	public int getMonth() {
		return this.month.get(Calendar.MONTH) + 1;
	}
	public void prevMonth() {
		this.shiftMonth(-1);
	}
	public void nextMonth() {
		this.shiftMonth(1);
	}
	public void thisMonth() {
		this.month = Calendar.getInstance();

	}
	private void shiftMonth(int shift) {
		this.month.add(Calendar.MONTH, shift);
		
	}
	public String getText() {
		// 月名
		SimpleDateFormat sdfMonthName = new SimpleDateFormat("MMM",
				Locale.getDefault());

		String monthFormat = this.context.getString(R.string.month_format);

		return String.format(monthFormat,
				this.month.get(Calendar.YEAR),
				this.month.get(Calendar.MONTH) + 1,
				sdfMonthName.format(this.month.getTime()));

	}
	
}
