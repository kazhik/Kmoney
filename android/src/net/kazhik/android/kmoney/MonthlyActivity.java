package net.kazhik.android.kmoney;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;

import net.kazhik.android.kmoney.Constants.ContextMenuItem;
import net.kazhik.android.kmoney.bean.TransactionView;
import net.kazhik.android.kmoney.db.KmBankTrns;
import net.kazhik.android.kmoney.db.KmCashTrns;
import net.kazhik.android.kmoney.db.KmCreditCardTrns;
import net.kazhik.android.kmoney.db.KmEMoneyTrns;
import net.kazhik.android.kmoney.db.KmvTransactions;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.ContextMenu;
import android.view.ContextMenu.ContextMenuInfo;
import android.view.GestureDetector;
import android.view.GestureDetector.SimpleOnGestureListener;
import android.view.Menu;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.widget.AdapterView;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.Button;
import android.widget.ListView;
import android.widget.SimpleAdapter;
import android.widget.TextView;

public class MonthlyActivity extends Activity implements OnItemClickListener {
	private GestureDetector gestureDetector;
	private View.OnTouchListener gestureListener;
	private Month currentMonth = new Month();

	private SimpleAdapter listAdapter;
	private ArrayList<HashMap<String, String>> mapList = new ArrayList<HashMap<String, String>>();

	class SwipeDetector extends SimpleOnGestureListener {
		private int swipeMinDistance;
		private int swipeThresholdVerocity;

		public SwipeDetector(int minDistance, int thresholdVerocity) {
			this.swipeMinDistance = minDistance;
			this.swipeThresholdVerocity = thresholdVerocity;
		}

		@Override
		public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX,
				float velocityY) {
			try {
				if (Math.abs(velocityX) <= this.swipeThresholdVerocity) {
					return false;
				}
				// right to left swipe
				if (e1.getX() - e2.getX() > this.swipeMinDistance) {
					MonthlyActivity.this.changeMonth("next");
				} else if (e2.getX() - e1.getX() > this.swipeMinDistance) {
					MonthlyActivity.this.changeMonth("prev");
				} else {
					Log.d(Constants.APPNAME, "fail");
				}
			} catch (Exception e) {
				// nothing
			}
			return false;
		}

	}

	private class EntryButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
//			startActivity(new Intent(MonthlyActivity.this, KmoneyActivity.class));
			setResult(RESULT_OK);
			finish();

		}

	}

	private class SumButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
			Intent i = new Intent(MonthlyActivity.this,
					MonthlySummaryActivity.class);
			Month m = MonthlyActivity.this.currentMonth;
			i.putExtra("year", m.getYear());
			i.putExtra("month", m.getMonth());
			startActivity(i);

		}

	}

	private class MonthButtonClickListener implements View.OnClickListener {
		private String direction;

		public MonthButtonClickListener(String direction) {
			this.direction = direction;

		}

		@Override
		public void onClick(View v) {
			MonthlyActivity.this.changeMonth(this.direction);
		}

	}

	private class ConfirmDeleteListener implements
			DialogInterface.OnClickListener {
		private int position;

		public ConfirmDeleteListener(int position) {
			this.position = position;
		}

		@Override
		public void onClick(DialogInterface dialog, int which) {
			if (which == DialogInterface.BUTTON_POSITIVE) {
				MonthlyActivity.this.deleteTransaction(this.position);
			}

		}
	}

	private class TouchListener implements View.OnTouchListener {

		@Override
		public boolean onTouch(View v, MotionEvent event) {
			return MonthlyActivity.this.gestureDetector.onTouchEvent(event);
		}

	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		try {
			setContentView(R.layout.monthly);
		} catch (Exception e) {
			Log.e(Constants.APPNAME, e.getMessage());
		}

		this.initEntryButton();
		this.initSumButton();
		this.initMonthButton();
		this.initMonthText();

		this.loadList(this.currentMonth.getYear(), this.currentMonth.getMonth());

		ViewConfiguration vc = ViewConfiguration.get(this);
		SwipeDetector swipeDetector = new SwipeDetector(
				vc.getScaledPagingTouchSlop(),
				vc.getScaledMinimumFlingVelocity());
		this.gestureDetector = new GestureDetector(this, swipeDetector);
		this.gestureListener = new TouchListener();

		ListView lv = (ListView) findViewById(R.id.listViewMonthly);
		lv.setOnItemClickListener(this);
		lv.setOnTouchListener(this.gestureListener);
		lv.setSelection(lv.getCount() - 1);

		registerForContextMenu(lv);

	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.monthly, menu);
		return true;
	}

	private void initEntryButton() {
		Button btn = (Button) findViewById(R.id.buttonEntry);
		btn.setOnClickListener(new EntryButtonClickListener());

	}

	private void initSumButton() {
		Button btn = (Button) findViewById(R.id.buttonSum);
		btn.setOnClickListener(new SumButtonClickListener());

	}

	private void initMonthButton() {
		Button btnPrev = (Button) findViewById(R.id.buttonPrev);
		btnPrev.setOnClickListener(new MonthButtonClickListener("prev"));

		Button btnNext = (Button) findViewById(R.id.buttonNext);
		btnNext.setOnClickListener(new MonthButtonClickListener("next"));

	}

	private void initMonthText() {
		// 今月をセット
		Calendar calToday = Calendar.getInstance();

		int year = calToday.get(Calendar.YEAR);
		int month = calToday.get(Calendar.MONTH);

		this.currentMonth.set(year, month);
		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.formatMonth(year, month));

	}

	private String formatTransactionDate(String trnsDate) throws ParseException {
		SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd",
				Locale.getDefault());
		sdfDate.parse(trnsDate).getTime();

		Calendar cal = Calendar.getInstance();
		cal.setTime(sdfDate.parse(trnsDate));

		// 曜日
		SimpleDateFormat sdfDayOfWeek = new SimpleDateFormat("E",
				Locale.getDefault());
		// 月名
		SimpleDateFormat sdfMonthName = new SimpleDateFormat("MMM",
				Locale.getDefault());

		return String.format(getString(R.string.day_format),
				cal.get(Calendar.DAY_OF_MONTH),
				sdfDayOfWeek.format(cal.getTime()),
				sdfMonthName.format(cal.getTime()));
	}

	private void loadList(int year, int month) {
		// DBからデータを読み込む
		KmvTransactions trns = new KmvTransactions(this);
		trns.open(true);
		List<TransactionView> trnList = trns.getList(year, month + 1);
		trns.close();

		// 読み込んだデータをHashMapに保持
		Money amount = new Money();
		this.mapList.clear();
		Iterator<TransactionView> it = trnList.iterator();
		while (it.hasNext()) {
			TransactionView tv = it.next();

			HashMap<String, String> map = new HashMap<String, String>();
			try {
				map.put("date",
						this.formatTransactionDate(tv.getTransactionDate()));
			} catch (ParseException e) {
				Log.e(Constants.APPNAME, e.getMessage());
				continue;
			}
			map.put("detail", tv.getDetail());
			map.put("amount", amount.setValue(tv.getExpense().toPlainString()));
			map.put("type", tv.getType());
			map.put("id", String.valueOf(tv.getId()));
			this.mapList.add(map);
		}

		// 画面上のリストに表示
		this.listAdapter = new SimpleAdapter(this, this.mapList,
				R.layout.monthly_row,
				new String[] { "date", "detail", "amount" }, new int[] {
						R.id.textViewDate, R.id.textViewDetail,
						R.id.textViewAmount });
		ListView lv = (ListView) findViewById(R.id.listViewMonthly);
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
			this.currentMonth.shiftMonth(-1);
		} else {
			this.currentMonth.shiftMonth(1);
		}
		int year = this.currentMonth.getYear();
		int month = this.currentMonth.getMonth();

		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.formatMonth(year, month));

		this.loadList(year, month);
	}

	public void onCreateContextMenu(ContextMenu menu, View view,
			ContextMenuInfo menuInfo) {
		super.onCreateContextMenu(menu, view, menuInfo);

		AdapterContextMenuInfo info = (AdapterContextMenuInfo) menuInfo;

		HashMap<String, String> map = this.mapList.get(info.position);

		menu.setHeaderTitle(map.get("date") + " " + map.get("detail"));
		menu.add(Menu.NONE, ContextMenuItem.DELETE.ordinal(), Menu.NONE,
				R.string.delete);
	}

	public void deleteTransaction(int position) {

		// 画面上から削除
		HashMap<String, String> removed = this.mapList.remove(position);
		this.listAdapter.notifyDataSetChanged();

		// DBから削除
		String type = removed.get("type");
		int id = Integer.parseInt(removed.get("id"));
		if (type.equals(TransactionView.CASH)) {
			KmCashTrns cashTrn = new KmCashTrns(this);
			cashTrn.open(false);
			cashTrn.delete(id);
			cashTrn.close();
		} else if (type.equals(TransactionView.BANK)) {
			KmBankTrns bankTrn = new KmBankTrns(this);
			bankTrn.open(false);
			bankTrn.delete(id);
			bankTrn.close();
		} else if (type.equals(TransactionView.CREDITCARD)) {
			KmCreditCardTrns cardTrn = new KmCreditCardTrns(this);
			cardTrn.open(false);
			cardTrn.delete(id);
			cardTrn.close();
		} else if (type.equals(TransactionView.EMONEY)) {
			KmEMoneyTrns emoneyTrn = new KmEMoneyTrns(this);
			emoneyTrn.open(false);
			emoneyTrn.delete(id);
			emoneyTrn.close();
		}

	}

	public boolean onContextItemSelected(MenuItem item) {
		AdapterContextMenuInfo info = (AdapterContextMenuInfo) item
				.getMenuInfo();

		if (item.getItemId() == ContextMenuItem.DELETE.ordinal()) {
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			// Add the buttons
			builder.setPositiveButton(android.R.string.ok,
					new ConfirmDeleteListener(info.position));
			builder.setNegativeButton(android.R.string.cancel,
					new ConfirmDeleteListener(info.position));
			builder.setTitle(R.string.confirm_delete);
			AlertDialog dialog = builder.create();
			dialog.show();

		}
		return true;
	}

	@Override
	public void onItemClick(AdapterView<?> items, View view, int position,
			long id) {
		ListView listView = (ListView) items;
		@SuppressWarnings("unchecked")
		HashMap<String, String> map = (HashMap<String, String>) listView
				.getItemAtPosition(position);

		Intent i = new Intent(MonthlyActivity.this, KmoneyActivity.class);
		i.putExtra("id", map.get("id"));
		i.putExtra("type", map.get("type"));
		
		setResult(RESULT_OK, i);
		finish();

		// Toast.makeText(getApplicationContext(), map.get("id"),
		// Toast.LENGTH_SHORT).show();

	}

}