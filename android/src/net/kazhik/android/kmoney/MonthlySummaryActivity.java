package net.kazhik.android.kmoney;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.bean.TransactionSummary;
import net.kazhik.android.kmoney.db.KmvTransactions;
import net.kazhik.android.kmoney.ui.Money;
import net.kazhik.android.kmoney.ui.Month;
import net.kazhik.android.kmoney.ui.PieChart;

import org.achartengine.GraphicalView;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
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
				Intent i = new Intent(MonthlySummaryActivity.this,
						MonthlyActivity.class);
				Month m = MonthlySummaryActivity.this.currentMonth;
				i.putExtra("year", m.getYear());
				i.putExtra("month", m.getMonth());
				setResult(RESULT_OK, i);
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
		tv.setText(this.currentMonth.getText());

	}

	private void loadList(int year, int month) {
		// DBからデータを読み込む
		KmvTransactions trns = new KmvTransactions(this);
		trns.open(true);
		List<TransactionSummary> trnList = trns.getSummary(year, month);
		TransactionSummary total = trns.getTotal(year, month);
		trns.close();

		// リスト用のデータとグラフ用のデータを作成
		PieChart pieChart = new PieChart(this);
		Money amount = new Money();
		this.mapList.clear();
		Iterator<TransactionSummary> it = trnList.iterator();
		while (it.hasNext()) {
			TransactionSummary tv = it.next();

			HashMap<String, String> map = new HashMap<String, String>();
			map.put("category_name", tv.getCategoryName());
			map.put("sum", amount.setValue(tv.getSum().toPlainString()));
			this.mapList.add(map);
			
			pieChart.addValue(tv.getCategoryName(), tv.getSum());
		}
		
		TextView categoryText = (TextView)findViewById(R.id.textViewTotal);
		categoryText.setText(total.getCategoryName());
		TextView sumText = (TextView)findViewById(R.id.textViewTotalValue);
		sumText.setText(amount.setValue(total.getSum().toPlainString()));

		// グラフを表示
		GraphicalView v = pieChart.getPieChartView();
		LinearLayout layoutChart = (LinearLayout) findViewById(R.id.pieChart);
		layoutChart.removeAllViews();
		layoutChart.addView(v);
		
		// リストを表示
		this.listAdapter = new SimpleAdapter(this, this.mapList,
				R.layout.monthly_summary_row, new String[] { "category_name",
						"sum" }, new int[] { R.id.textViewCategory,
						R.id.textViewSum });
		ListView lv = (ListView) findViewById(R.id.listViewMonthlySummary);
		lv.setAdapter(this.listAdapter);
	}

	private void changeMonth(String direction) {
		if (direction.equals("prev")) {
			this.currentMonth.prevMonth();
		} else {
			this.currentMonth.nextMonth();
		}

		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.currentMonth.getText());

		int year = this.currentMonth.getYear();
		int month = this.currentMonth.getMonth();
		this.loadList(year, month);
	}

}
