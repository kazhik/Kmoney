package net.kazhik.android.kmoney;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;

import net.kazhik.android.kmoney.bean.TransactionView;
import net.kazhik.android.kmoney.db.KmBankTrns;
import net.kazhik.android.kmoney.db.KmCashTrns;
import net.kazhik.android.kmoney.db.KmCreditCardTrns;
import net.kazhik.android.kmoney.db.KmEMoneyTrns;
import net.kazhik.android.kmoney.db.KmvTransactions;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.ContextMenu;
import android.view.ContextMenu.ContextMenuInfo;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.Button;
import android.widget.ListView;
import android.widget.SimpleAdapter;
import android.widget.TextView;

public class MonthlyActivity extends Activity implements OnItemClickListener {
	private Month currentMonth = new Month();

	private enum ContextMenuItem {
		DELETE
	}
	private SimpleAdapter listAdapter;
	private ArrayList<HashMap<String, String>> mapList = new ArrayList<HashMap<String, String>>();
	
	private class EntryButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
			startActivity(new Intent(MonthlyActivity.this, KmoneyActivity.class));

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

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.monthly);

		this.initEntryButton();
		this.initMonthButton();
		this.initMonthText();

		this.loadList();

		ListView lv = (ListView) findViewById(R.id.listViewMonthly);
		lv.setOnItemClickListener(this);

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
		SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
		sdfDate.parse(trnsDate).getTime();
		
		Calendar cal = Calendar.getInstance();
		cal.setTime(sdfDate.parse(trnsDate));
		
		// 曜日
		SimpleDateFormat sdfDayOfWeek = new SimpleDateFormat("E", Locale.getDefault());
		// 月名
		SimpleDateFormat sdfMonthName = new SimpleDateFormat("MMM", Locale.getDefault());
		
		return String.format(getString(R.string.day_format),
				cal.get(Calendar.MONTH) + 1,
				cal.get(Calendar.DAY_OF_MONTH),
				sdfDayOfWeek.format(cal.getTime()),
				sdfMonthName.format(cal.getTime()));
	}

	private void loadList() {
		KmvTransactions trns = new KmvTransactions(this);
		trns.open(true);
		List<TransactionView> trnList = trns.getList(
				this.currentMonth.getYear(), this.currentMonth.getMonth());
		trns.close();

		Iterator<TransactionView> it = trnList.iterator();
		while (it.hasNext()) {
			TransactionView tv = it.next();

			HashMap<String, String> map = new HashMap<String, String>();
			try {
				map.put("date", this.formatTransactionDate(tv.getTransactionDate()));
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			map.put("detail", tv.getDetail());
			map.put("amount", tv.getExpense().toPlainString());
			map.put("type", tv.getType());
			map.put("id", String.valueOf(tv.getId()));
			this.mapList.add(map);
		}

		this.listAdapter = new SimpleAdapter(this,
				this.mapList,
				R.layout.monthly_row,
				new String[] { "date", "detail", "amount" },
				new int[] {	R.id.textViewDate, R.id.textViewDetail, R.id.textViewAmount }
				);
		ListView lv = (ListView) findViewById(R.id.listViewMonthly);
		lv.setAdapter(this.listAdapter);
	}

	private String formatMonth(int year, int month) {
		Calendar calToday = Calendar.getInstance();
		calToday.set(Calendar.YEAR, year);
		calToday.set(Calendar.MONTH, month);

		// 月名
		SimpleDateFormat sdfMonthName = new SimpleDateFormat("MMM", Locale.getDefault());

		String monthFormat = getString(R.string.month_format);

		return String.format(monthFormat,
				year, month + 1, sdfMonthName.format(calToday.getTime()));
		
	}
	private void changeMonth(String direction) {
		if (direction.equals("prev")) {
			this.currentMonth.shiftMonth(-1);
		} else {
			this.currentMonth.shiftMonth(1);
		}

		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.formatMonth(this.currentMonth.getYear(), this.currentMonth.getMonth()));
	}

	public void onCreateContextMenu(ContextMenu menu, View view,
			ContextMenuInfo menuInfo) {
		super.onCreateContextMenu(menu, view, menuInfo);
		menu.add(Menu.NONE, ContextMenuItem.DELETE.ordinal(), Menu.NONE, R.string.delete);
	}
	
	private void deleteTransaction(String type, int id) {
		
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
		AdapterContextMenuInfo info = (AdapterContextMenuInfo) item.getMenuInfo();

		if (item.getItemId() == ContextMenuItem.DELETE.ordinal()) {
			HashMap<String, String> removed = this.mapList.remove(info.position);
			this.listAdapter.notifyDataSetChanged();
			
			this.deleteTransaction(removed.get("type"), Integer.parseInt(removed.get("id")));
			
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
		startActivity(i);

		// Toast.makeText(getApplicationContext(), map.get("id"),
		// Toast.LENGTH_SHORT).show();

	}

}
