package net.kazhik.android.kmoney;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import android.content.Context;

public class Day {
	private Calendar day;
	private Context context;
	
	public Day(Context context) {
		this.context = context;
		this.day = Calendar.getInstance();
	}
	public void today() {
		this.day = Calendar.getInstance();
	}
	public void prevDay() {
		this.day.add(Calendar.DATE, -1);
	}
	public void nextDay() {
		this.day.add(Calendar.DATE, 1);
	}
	
	public Date getDate() {
		return day.getTime();
	}
	public void set(Date date) {
		this.day.setTime(date);
	}
	public void set(int year, int month, int dayOfMonth) {
		this.day.set(Calendar.YEAR, year);
		this.day.set(Calendar.MONTH, month);
		this.day.set(Calendar.DAY_OF_MONTH, dayOfMonth);
	}
	public int getYear() {
		return this.day.get(Calendar.YEAR);
	}
	public int getMonth() {
		return this.day.get(Calendar.MONTH) + 1;
	}
	public int getDay() {
		return this.day.get(Calendar.DAY_OF_MONTH);
	}

	public String getText() {
		// 曜日
		SimpleDateFormat sdfDayOfWeek = new SimpleDateFormat("E",
				Locale.getDefault());
		// 月名
		SimpleDateFormat sdfMonthName = new SimpleDateFormat("MMM",
				Locale.getDefault());

		return String.format(
				this.context.getString(R.string.date_format),
				this.day.get(Calendar.YEAR),
				this.day.get(Calendar.MONTH) + 1,
				this.day.get(Calendar.DAY_OF_MONTH),
				sdfDayOfWeek.format(this.day.getTime()),
				sdfMonthName.format(this.day.getTime())
				);

	}

}
