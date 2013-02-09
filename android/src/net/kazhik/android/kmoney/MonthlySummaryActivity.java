package net.kazhik.android.kmoney;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;

import net.kazhik.android.kmoney.bean.TransactionSummary;
import net.kazhik.android.kmoney.db.KmvTransactions;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.SimpleAdapter;
import android.widget.TextView;

public class MonthlySummaryActivity extends Activity {
	private Month currentMonth;

	private SimpleAdapter listAdapter;
	private ArrayList<HashMap<String, String>> mapList = new ArrayList<HashMap<String, String>>();


	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.monthly_summary);

		// MonthlyActivityから渡されるidを取得
		Intent i = this.getIntent();
		if (i == null) {
			return;
		}
		Bundle b = i.getExtras();
		if (b == null) {
			return;
		}

		int year = b.getInt("year");
		int month = b.getInt("month");
		this.currentMonth = new Month(this);
		this.currentMonth.set(year, month);

		this.initEntryButton();
		this.initListButton();
		this.initMonthButton();
		this.initMonthText(year, month);

		this.loadList(year, month);

	}

	private void initEntryButton() {
		class EntryButtonClickListener implements View.OnClickListener {

			@Override
			public void onClick(View v) {
				startActivity(new Intent(MonthlySummaryActivity.this,
						KmoneyActivity.class));
				finish();

			}

		}
		Button btn = (Button) findViewById(R.id.buttonEntry);
		btn.setOnClickListener(new EntryButtonClickListener());

	}

	private void initListButton() {
		class ListButtonClickListener implements View.OnClickListener {

			@Override
			public void onClick(View v) {
				finish();

			}

		}

		Button btn = (Button) findViewById(R.id.buttonList);
		btn.setOnClickListener(new ListButtonClickListener());

	}

	private void initMonthButton() {
		class MonthButtonClickListener implements View.OnClickListener {
			private String direction;

			public MonthButtonClickListener(String direction) {
				this.direction = direction;

			}

			@Override
			public void onClick(View v) {
				MonthlySummaryActivity.this.changeMonth(this.direction);
			}

		}

		Button btnPrev = (Button) findViewById(R.id.buttonPrev);
		btnPrev.setOnClickListener(new MonthButtonClickListener("prev"));

		Button btnNext = (Button) findViewById(R.id.buttonNext);
		btnNext.setOnClickListener(new MonthButtonClickListener("next"));

	}

	private void initMonthText(int year, int month) {
		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.formatMonth(year, month));

	}

	private void loadList(int year, int month) {
		// DBからデータを読み込む
		KmvTransactions trns = new KmvTransactions(this);
		trns.open(true);
		List<TransactionSummary> trnList = trns.getSummary(year, month + 1);
		trns.close();

		// 読み込んだデータをHashMapに保持
		Money amount = new Money();
		this.mapList.clear();
		Iterator<TransactionSummary> it = trnList.iterator();
		while (it.hasNext()) {
			TransactionSummary tv = it.next();

			HashMap<String, String> map = new HashMap<String, String>();
			map.put("category_name", tv.getCategoryName());
			map.put("sum", amount.setValue(tv.getSum().toPlainString()));
			this.mapList.add(map);
		}

		// 画面上のリストに表示
		this.listAdapter = new SimpleAdapter(this, this.mapList,
				R.layout.monthly_summary_row, new String[] { "category_name",
						"sum" }, new int[] { R.id.textViewCategory,
						R.id.textViewSum });
		ListView lv = (ListView) findViewById(R.id.listViewMonthlySummary);
		lv.setAdapter(this.listAdapter);
	}

	private String formatMonth(int year, int month) {
		Calendar calToday = Calendar.getInstance();
		calToday.set(Calendar.YEAR, year);
		calToday.set(Calendar.MONTH, month);

		// 月名
		SimpleDateFormat sdfMonthName = new SimpleDateFormat("MMM",
				Locale.getDefault());

		String monthFormat = getString(R.string.month_format);

		return String.format(monthFormat, year, month + 1,
				sdfMonthName.format(calToday.getTime()));

	}

	private void changeMonth(String direction) {
		if (direction.equals("prev")) {
			this.currentMonth.prevMonth();
		} else {
			this.currentMonth.nextMonth();
		}
		int year = this.currentMonth.getYear();
		int month = this.currentMonth.getMonth();

		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.formatMonth(year, month));

		this.loadList(year, month);
	}

}
