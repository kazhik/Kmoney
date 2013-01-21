package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import net.kazhik.android.kmoney.bean.BankTransaction;
import net.kazhik.android.kmoney.bean.CashTransaction;
import net.kazhik.android.kmoney.bean.Category;
import net.kazhik.android.kmoney.bean.CreditCardTransaction;
import net.kazhik.android.kmoney.bean.EMoneyTransaction;
import net.kazhik.android.kmoney.bean.Transaction;
import net.kazhik.android.kmoney.bean.TransactionView;
import net.kazhik.android.kmoney.db.KmBankInfo;
import net.kazhik.android.kmoney.db.KmBankTrns;
import net.kazhik.android.kmoney.db.KmCashTrns;
import net.kazhik.android.kmoney.db.KmCategory;
import net.kazhik.android.kmoney.db.KmCreditCardInfo;
import net.kazhik.android.kmoney.db.KmCreditCardTrns;
import net.kazhik.android.kmoney.db.KmDatabase;
import net.kazhik.android.kmoney.db.KmEMoneyInfo;
import net.kazhik.android.kmoney.db.KmEMoneyTrns;
import net.kazhik.android.kmoney.db.KmvTransactions;
import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.SQLException;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

public class KmoneyActivity extends FragmentActivity {
	private Calendar currentDay;
	private int userId;
	private int transactionType;
	private Map<String, List<Item>> transactionTypeDetail;

	private int updateType;
	private int updateId;

	private class SelectItemListener implements OnItemSelectedListener {

		@Override
		public void onItemSelected(AdapterView<?> parent, View view,
				int position, long id) {

			// Spinner spinner = (Spinner) parent;
			// Item item = (Item) spinner.getSelectedItem();
			// Toast.makeText(KmoneyActivity.this, item.getName(),
			// Toast.LENGTH_LONG).show();

		}

		@Override
		public void onNothingSelected(AdapterView<?> arg0) {

		}

	}

	private class SelectTypeDetailListener implements OnItemSelectedListener {

		@Override
		public void onItemSelected(AdapterView<?> parent, View view,
				int position, long id) {

		}

		@Override
		public void onNothingSelected(AdapterView<?> arg0) {

		}

	}

	private class SelectTypeListener implements OnItemSelectedListener {

		@Override
		public void onItemSelected(AdapterView<?> parent, View view,
				int position, long id) {

			Spinner spinner = (Spinner) parent;
			Item item = (Item) spinner.getSelectedItem();
			KmoneyActivity.this.onChangeTransactionType(item.getId());

		}

		@Override
		public void onNothingSelected(AdapterView<?> arg0) {

		}

	}

	private class NumberClickListener implements View.OnClickListener {
		int number;

		public NumberClickListener(int number) {
			this.number = number;
		}

		@Override
		public void onClick(View v) {
			AutoResizeTextView tv = (AutoResizeTextView) findViewById(R.id.textViewAmount);
			String newVal;
			try {
				newVal = Money.add(tv.getText().toString(), Integer.toString(this.number));
				tv.setText(newVal);
				tv.resizeText();
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}

	}

	private class ClearButtonClickListener implements View.OnClickListener {
		@Override
		public void onClick(View v) {
			TextView tv = (TextView) findViewById(R.id.textViewAmount);
			tv.setText("");

		}
	}

	private class BackspaceButtonClickListener implements View.OnClickListener {
		@Override
		public void onClick(View v) {
			TextView tv = (TextView) findViewById(R.id.textViewAmount);
			CharSequence str = tv.getText();
			if (str.length() > 0) {
				try {
					str = Money.backspace(str.toString());
				} catch (ParseException e) {
					// TODO
					e.printStackTrace();
				}
				tv.setText(str);
			}

		}
	}

	private class PhotoButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {

		}

	}

	private class OkButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
			KmoneyActivity.this.writeTransaction();
			
			startActivity(new Intent(KmoneyActivity.this, MonthlyActivity.class));

		}

	}
	private class CancelButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
			startActivity(new Intent(KmoneyActivity.this, MonthlyActivity.class));

		}

	}

	private class HistoryButtonClickListener implements View.OnClickListener {
		@Override
		public void onClick(View v) {
			KmoneyActivity.this.showDetailHistoryDialog();
		}
	}

	private class DateSetListener implements DatePickerDialog.OnDateSetListener {

		@Override
		public void onDateSet(DatePicker view, int year, int monthOfYear,
				int dayOfMonth) {

			KmoneyActivity.this.setDateText(year, monthOfYear, dayOfMonth);
		}

	}

	private class DateClickListener implements View.OnLongClickListener {
		private int year;
		private int month;
		private int day;

		public DateClickListener(int year, int month, int day) {
			this.year = year;
			this.month = month;
			this.day = day;
		}

		@Override
		public boolean onLongClick(View v) {
			DatePickerDialog datePickerDialog = new DatePickerDialog(
					KmoneyActivity.this, new DateSetListener(), year, month,
					day);
			datePickerDialog.show();
			return false;
		}

	}

	private class DateButtonClickListener implements View.OnClickListener {
		private String direction;

		public DateButtonClickListener(String direction) {
			this.direction = direction;

		}

		@Override
		public void onClick(View v) {
			KmoneyActivity.this.changeDay(this.direction);
		}

	}

	private class HistoryClickListener implements
			DialogInterface.OnClickListener {
		public void onClick(DialogInterface dialog, int item) {
			ListView lv = ((AlertDialog) dialog).getListView();
			String str = (String) lv.getAdapter().getItem(item);

			EditText detail = (EditText) findViewById(R.id.editTextDetail);
			detail.setText(str);
		}

	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.entry);

		this.initCurrentUser();
		
		this.initDatabase();
		
		this.initItemList();
		this.initTypeList();
		this.initNumberButton();
		this.initClearButton();
		this.initBackspaceButton();
		this.initDateText();
		this.initDateButton();
		this.initOkButton();
		this.initCancelButton();
		this.initHistoryButton();
		this.initPhotoButton();
		this.initTransactionTypeDetal();

		// MonthlyActivityから渡されるidを取得
		Intent i = this.getIntent();
		if (i == null) {
			return;
		}
		Bundle b = i.getExtras();
		if (b == null) {
			return;
		}
		
		this.updateId = 0;
		this.updateType = TransactionType.NONE;
		String idStr = b.getString("id");
		if (idStr == null) {
			return;
		}
		this.updateId = Integer.parseInt(idStr);
		
		String typeStr = b.getString("type");
		if (typeStr == null) {
			return;
		}
		this.updateType = TransactionType.getType(typeStr);
		
		this.loadTransaction(this.updateType, this.updateId);
		
	}
	private int getSpinnerPosition(Spinner spinner, int id) {
		@SuppressWarnings("unchecked")
		ArrayAdapter<Item> adapter = (ArrayAdapter<Item>)spinner.getAdapter();
		
		int cnt = adapter.getCount();
		for (int i = 0; i < cnt; i++) {
			Item item = adapter.getItem(i);
			if (item.getId() == id) {
				return id;
			}
		}
		return -1;
		
	}
	private void setField(Transaction trn) {
		this.currentDay.setTime(trn.getTransactionDate());
		
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		ToggleButton tglButton = (ToggleButton)findViewById(R.id.toggleButtonIncomeExpense);
		if (trn.getIncome().compareTo(new BigDecimal("0")) != 0) {
			tglButton.setChecked(true);
			tv.setText(Money.toString(trn.getIncome()));
		} else {
			tglButton.setChecked(false);
			tv.setText(Money.toString(trn.getExpense()));
		}
		Spinner spinner = (Spinner)findViewById(R.id.spinnerItem);
		int pos = this.getSpinnerPosition(spinner, trn.getCategoryId());
		spinner.setSelection(pos);

		tv = (TextView) findViewById(R.id.editTextDetail);
		tv.setText(trn.getDetail());
		
	}
	private void loadTransaction(int type, int id) {
		Spinner spinner = (Spinner)findViewById(R.id.spinnerTypeDetail);
		int typeDetailId = 0;
		
		if (type == TransactionType.CASH) {
			KmCashTrns trn = new KmCashTrns(this);
			trn.open(true);
			try {
				CashTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
			} catch (ParseException e) {
				e.printStackTrace();
			}
			trn.close();
		} else if (type == TransactionType.BANK) {
			KmBankTrns trn = new KmBankTrns(this);
			trn.open(true);
			try {
				BankTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
				typeDetailId = trnInfo.getBankId();

			} catch (ParseException e) {
				e.printStackTrace();
			}
			trn.close();
		} else if (type == TransactionType.CREDITCARD) {
			KmCreditCardTrns trn = new KmCreditCardTrns(this);
			trn.open(true);
			try {
				CreditCardTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
				typeDetailId = trnInfo.getCardId();
			} catch (ParseException e) {
				e.printStackTrace();
			}
			trn.close();
		} else if (type == TransactionType.EMONEY) {
			KmEMoneyTrns trn = new KmEMoneyTrns(this);
			trn.open(true);
			try {
				EMoneyTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
				typeDetailId = trnInfo.getEmoneyId();
			} catch (ParseException e) {
				e.printStackTrace();
			}
			trn.close();
		}
		if (typeDetailId > 0) {
			this.onChangeTransactionType(type);
			int pos = this.getSpinnerPosition(spinner, typeDetailId);
			spinner.setSelection(pos);
		}
		
	}

	private String formatDate(int year, int month, int day) {
		Calendar cal = Calendar.getInstance();
		cal.set(year, month, day);
		
		// 曜日
		SimpleDateFormat sdfDayOfWeek = new SimpleDateFormat("E", Locale.getDefault());
		// 月名
		SimpleDateFormat sdfMonthName = new SimpleDateFormat("MMM", Locale.getDefault());
		
		return String.format(getString(R.string.date_format),
				year, month + 1, day,
				sdfDayOfWeek.format(cal.getTime()),
				sdfMonthName.format(cal.getTime()));
		
	}
	private void setDateText(int year, int month, int day) {
		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.formatDate(year, month, day));
	}
	
	private void initCurrentUser() {
		this.userId = 1;
	}

	private void initDatabase() {
		try {
			KmDatabase db = new KmDatabase(this);
			db.open();
			db.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void initDateText() {
		// 本日の日付をセット
		this.currentDay = Calendar.getInstance();

		int year = this.currentDay.get(Calendar.YEAR);
		int month = this.currentDay.get(Calendar.MONTH);
		int day = this.currentDay.get(Calendar.DAY_OF_MONTH);
		this.setDateText(year, month, day);

		// 長押し設定
		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setOnLongClickListener(new DateClickListener(year, month, day));

	}

	private void initDateButton() {
		Button btnPrev = (Button) findViewById(R.id.buttonPrev);
		btnPrev.setOnClickListener(new DateButtonClickListener("prev"));

		Button btnNext = (Button) findViewById(R.id.buttonNext);
		btnNext.setOnClickListener(new DateButtonClickListener("next"));

	}

	private void initClearButton() {
		Button btn = (Button) findViewById(R.id.buttonClear);
		btn.setOnClickListener(new ClearButtonClickListener());

	}

	private void initBackspaceButton() {
		Button btn = (Button) findViewById(R.id.buttonBackSpace);
		btn.setOnClickListener(new BackspaceButtonClickListener());

	}

	private void initNumberButton() {
		int idArray[] = { R.id.button0, R.id.button1, R.id.button2,
				R.id.button3, R.id.button4, R.id.button5, R.id.button6,
				R.id.button7, R.id.button8, R.id.button9 };
		for (int i = 0; i < 10; i++) {
			Button btn = (Button) findViewById(idArray[i]);
			btn.setOnClickListener(new NumberClickListener(i));
		}
	}

	private void initPhotoButton() {
		Button btn = (Button) findViewById(R.id.buttonPhoto);
		btn.setOnClickListener(new PhotoButtonClickListener());

	}

	private void initOkButton() {
		Button btn = (Button) findViewById(R.id.buttonOk);
		btn.setOnClickListener(new OkButtonClickListener());

	}

	private void initCancelButton() {
		Button btn = (Button) findViewById(R.id.buttonCancel);
		btn.setOnClickListener(new CancelButtonClickListener());

	}

	private void initHistoryButton() {
		Button btn = (Button) findViewById(R.id.buttonHistory);
		btn.setOnClickListener(new HistoryButtonClickListener());
	}

	private void initItemList() {
		// DBから費目のリストを取得
		KmCategory itemInfo = new KmCategory(this);
		itemInfo.open(true);
		List<Category> itemList = itemInfo.getCategoryList(0);
		itemInfo.close();

		// Spinnerに費目のリストをセット
		ArrayAdapter<Item> adapter = new ArrayAdapter<Item>(this,
				android.R.layout.simple_spinner_item);

		Iterator<Category> it = itemList.iterator();
		while (it.hasNext()) {
			Category item = it.next();
			adapter.add(new Item(item.getId(), item.getName()));
		}

		adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

		Spinner spinner = (Spinner) findViewById(R.id.spinnerItem);
		spinner.setAdapter(adapter);
		spinner.setOnItemSelectedListener(new SelectItemListener());
	}
	private List<Item> getBankList() {
		KmBankInfo bankInfo = new KmBankInfo(this);
		bankInfo.open(true);
		List<Item> itemList = bankInfo.getBankNameList(this.userId);
		bankInfo.close();
		
		return itemList;
	}
	private List<Item> getCreditCardList() {
		KmCreditCardInfo cardInfo = new KmCreditCardInfo(this);
		cardInfo.open(true);
		List<Item> itemList = cardInfo.getCreditCardNameList(this.userId);
		cardInfo.close();
		
		return itemList;
	}
	private List<Item> getEMoneyList() {
		KmEMoneyInfo emoneyInfo = new KmEMoneyInfo(this);
		emoneyInfo.open(true);
		List<Item> itemList = emoneyInfo.getEMoneyNameList(this.userId);
		emoneyInfo.close();
		
		return itemList;
	}
	private void initTransactionTypeDetal() {
		this.transactionTypeDetail = new HashMap<String, List<Item>>();
		this.transactionTypeDetail.put("bank", this.getBankList());
		this.transactionTypeDetail.put("creditcard", this.getCreditCardList());
		this.transactionTypeDetail.put("emoney", this.getEMoneyList());

		Spinner spinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
		spinner.setOnItemSelectedListener(new SelectTypeDetailListener());
		
		spinner.setEnabled(false);
	}
	private void initTypeList() {
		ArrayAdapter<Item> adapter = new ArrayAdapter<Item>(this,
				android.R.layout.simple_spinner_item);
		adapter.add(new Item(TransactionType.CASH, getResources().getString(R.string.cash)));
		adapter.add(new Item(TransactionType.BANK, getResources().getString(R.string.bank)));
		adapter.add(new Item(TransactionType.CREDITCARD, getResources().getString(R.string.creditcard)));
		adapter.add(new Item(TransactionType.EMONEY, getResources().getString(R.string.emoney)));

		adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

		Spinner spinner = (Spinner) findViewById(R.id.spinnerType);
		spinner.setAdapter(adapter);
		spinner.setOnItemSelectedListener(new SelectTypeListener());
	}

	private void onChangeTransactionType(int id) {
		Spinner spinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
		
		List<Item> trnsTypeList = new ArrayList<Item>();
		if (id == TransactionType.CASH) {
			this.transactionType = TransactionType.CASH;
			spinner.setEnabled(false);
		} else if (id == TransactionType.BANK) {
			this.transactionType = TransactionType.BANK;
			trnsTypeList = this.transactionTypeDetail.get("bank");
			spinner.setEnabled(true);
		} else if (id == TransactionType.CREDITCARD) {
			this.transactionType = TransactionType.CREDITCARD;
			trnsTypeList = this.transactionTypeDetail.get("creditcard");
			spinner.setEnabled(true);
		} else if (id == TransactionType.EMONEY) {
			this.transactionType = TransactionType.EMONEY;
			trnsTypeList = this.transactionTypeDetail.get("emoney");
			spinner.setEnabled(true);
		}
		if (trnsTypeList.isEmpty()) {
			return;
		}
		ArrayAdapter<Item> adapter = new ArrayAdapter<Item>(this,
				android.R.layout.simple_spinner_item);
		
		Iterator<Item> it = trnsTypeList.iterator();
		while (it.hasNext()) {
			adapter.add(it.next());
		}

		adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

		spinner.setAdapter(adapter);

	}

	private void changeDay(String direction) {
		if (direction.equals("prev")) {
			this.currentDay.add(Calendar.DATE, -1);
		} else {
			this.currentDay.add(Calendar.DATE, 1);
		}

		int year = this.currentDay.get(Calendar.YEAR);
		int month = this.currentDay.get(Calendar.MONTH);
		int day = this.currentDay.get(Calendar.DATE);

		this.setDateText(year, month, day);
	}
	private void deleteTransaction(int type, int id) {
		if (type == TransactionType.CASH) {
			this.deleteCashTransaction(id);
		} else if (type == TransactionType.BANK) {
			this.deleteBankTransaction(id);
		} else if (type == TransactionType.CREDITCARD) {
			this.deleteCreditCardTransaction(id);
		} else if (type == TransactionType.EMONEY) {
			this.deleteEMoneyTransaction(id);
		}
	}
	private void deleteCashTransaction(int id) {
		KmCashTrns trn = new KmCashTrns(this);
		trn.open(false);
		trn.delete(id);
		trn.close();
	}
	private void deleteBankTransaction(int id) {
		KmBankTrns trn = new KmBankTrns(this);
		trn.open(false);
		trn.delete(id);
		trn.close();
	}
	private void deleteCreditCardTransaction(int id) {
		KmCreditCardTrns trn = new KmCreditCardTrns(this);
		trn.open(false);
		trn.delete(id);
		trn.close();
	}
	private void deleteEMoneyTransaction(int id) {
		KmEMoneyTrns trn = new KmEMoneyTrns(this);
		trn.open(false);
		trn.delete(id);
		trn.close();
	}

	private void writeTransaction() {
		if (this.updateType != TransactionType.NONE) {
			// transactiontypeが変更されたら元のレコードを削除
			if (this.transactionType != this.updateType) {
				this.deleteTransaction(this.updateType, this.updateId);
				this.updateId = 0;
			}
		}
		try {
			if (this.transactionType == TransactionType.CASH) {
				this.writeCashTransaction(this.updateId);
			} else if (this.transactionType == TransactionType.BANK) {
				this.writeBankTransaction(this.updateId);
			} else if (this.transactionType == TransactionType.CREDITCARD) {
				this.writeCreditCardTransaction(this.updateId);
			} else if (this.transactionType == TransactionType.EMONEY) {
				this.writeEMoneyTransaction(this.updateId);
			}
		} catch (ParseException e) {
			e.printStackTrace();
		}

	}
	private void writeCashTransaction(int id) throws ParseException {
		CashTransaction tran = new CashTransaction();
		
		tran.setTransactionDate(this.currentDay.getTime());
		
		ToggleButton tglButton = (ToggleButton)findViewById(R.id.toggleButtonIncomeExpense);
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		// トグルボタンON(checked)なら収入、OFFなら支出
		if (tglButton.isChecked()) {
			tran.setIncome(Money.toBigDecimal(tv.getText().toString()));
			tran.setExpense(new BigDecimal("0"));
		} else {
			tran.setIncome(new BigDecimal("0"));
			tran.setExpense(Money.toBigDecimal(tv.getText().toString()));
		}
		Spinner spinner = (Spinner)findViewById(R.id.spinnerItem);
		Item item = (Item)spinner.getSelectedItem();
		tran.setCategoryId(item.getId());

		tv = (TextView) findViewById(R.id.editTextDetail);
		tran.setDetail(tv.getText().toString());
		
		tran.setInternal(0);
		tran.setUserId(this.userId);
		tran.setSource(1);

		KmCashTrns cash = new KmCashTrns(this);
		cash.open(false);
		if (id > 0) {
			tran.setId(id);
			cash.update(tran);
		} else {
			cash.insert(tran);
		}
		cash.close();
	}
	private void writeBankTransaction(int id) throws ParseException {
		BankTransaction tran = new BankTransaction();
		
		tran.setTransactionDate(this.currentDay.getTime());
		
		ToggleButton tglButton = (ToggleButton)findViewById(R.id.toggleButtonIncomeExpense);
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		// トグルボタンON(checked)なら収入、OFFなら支出
		if (tglButton.isChecked()) {
			tran.setIncome(Money.toBigDecimal(tv.getText().toString()));
			tran.setExpense(new BigDecimal("0"));
		} else {
			tran.setIncome(new BigDecimal("0"));
			tran.setExpense(Money.toBigDecimal(tv.getText().toString()));
		}
		Item item;
		Spinner bankSpinner = (Spinner)findViewById(R.id.spinnerTypeDetail);
		item = (Item)bankSpinner.getSelectedItem();
		tran.setBankId(item.getId());

		Spinner itemSpinner = (Spinner)findViewById(R.id.spinnerItem);
		item = (Item)itemSpinner.getSelectedItem();
		tran.setCategoryId(item.getId());

		tv = (TextView) findViewById(R.id.editTextDetail);
		tran.setDetail(tv.getText().toString());
		
		tran.setInternal(0);
		tran.setUserId(this.userId);
		tran.setSource(1);

		KmBankTrns bankTrn = new KmBankTrns(this);
		bankTrn.open(false);
		if (id > 0) {
			tran.setId(id);
			bankTrn.update(tran);
		} else {
			bankTrn.insert(tran);
		}
		bankTrn.close();
		
	}
	private void writeCreditCardTransaction(int id) throws ParseException {
		CreditCardTransaction tran = new CreditCardTransaction();
		
		tran.setTransactionDate(this.currentDay.getTime());
		
		ToggleButton tglButton = (ToggleButton)findViewById(R.id.toggleButtonIncomeExpense);
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		// トグルボタンON(checked)なら収入、OFFなら支出
		if (tglButton.isChecked()) {
			tran.setIncome(Money.toBigDecimal(tv.getText().toString()));
			tran.setExpense(new BigDecimal("0"));
		} else {
			tran.setIncome(new BigDecimal("0"));
			tran.setExpense(Money.toBigDecimal(tv.getText().toString()));
		}
		Item item;
		Spinner cardSpinner = (Spinner)findViewById(R.id.spinnerTypeDetail);
		item = (Item)cardSpinner.getSelectedItem();
		tran.setCardId(item.getId());

		Spinner itemSpinner = (Spinner)findViewById(R.id.spinnerItem);
		item = (Item)itemSpinner.getSelectedItem();
		tran.setCategoryId(item.getId());

		tv = (TextView) findViewById(R.id.editTextDetail);
		tran.setDetail(tv.getText().toString());
		
		tran.setInternal(0);
		tran.setUserId(this.userId);
		tran.setSource(1);

		KmCreditCardTrns cardTrn = new KmCreditCardTrns(this);
		cardTrn.open(false);
		if (id > 0) {
			tran.setId(id);
			cardTrn.update(tran);
		} else {
			cardTrn.insert(tran);
		}
		cardTrn.close();
		
	}
	private void writeEMoneyTransaction(int id) throws ParseException {
		EMoneyTransaction tran = new EMoneyTransaction();
		
		tran.setTransactionDate(this.currentDay.getTime());
		
		ToggleButton tglButton = (ToggleButton)findViewById(R.id.toggleButtonIncomeExpense);
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		// トグルボタンON(checked)なら収入、OFFなら支出
		if (tglButton.isChecked()) {
			tran.setIncome(Money.toBigDecimal(tv.getText().toString()));
			tran.setExpense(new BigDecimal("0"));
		} else {
			tran.setIncome(new BigDecimal("0"));
			tran.setExpense(Money.toBigDecimal(tv.getText().toString()));
		}
		Item item;
		Spinner emoneySpinner = (Spinner)findViewById(R.id.spinnerTypeDetail);
		item = (Item)emoneySpinner.getSelectedItem();
		tran.setEmoneyId(item.getId());

		Spinner itemSpinner = (Spinner)findViewById(R.id.spinnerItem);
		item = (Item)itemSpinner.getSelectedItem();
		tran.setCategoryId(item.getId());

		tv = (TextView) findViewById(R.id.editTextDetail);
		tran.setDetail(tv.getText().toString());
		
		tran.setInternal(0);
		tran.setUserId(this.userId);
		tran.setSource(1);

		KmEMoneyTrns emoneyTrn = new KmEMoneyTrns(this);
		emoneyTrn.open(false);
		if (id > 0) {
			tran.setId(id);
			emoneyTrn.update(tran);
		} else {
			emoneyTrn.insert(tran);
		}
		emoneyTrn.close();
		
	}


	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.kmoney, menu);
		return true;
	}
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		MasterData masterData = null;
		switch (item.getItemId()) {
		case R.id.menu_export:
			ExportDatabaseTask exportDb = new ExportDatabaseTask(this);
			exportDb.execute(this.getDatabasePath(KmDatabase.DATABASE_NAME).toString());
			break;
		case R.id.menu_settings:
			break;
		case R.id.master_category:
			masterData = new MasterData(this, MasterData.Type.CATEGORY, this.userId);
			masterData.showDialog();
			break;
		case R.id.master_bank:
			masterData = new MasterData(this, MasterData.Type.BANK, this.userId);
			masterData.showDialog();
			break;
		case R.id.master_creditcard:
			masterData = new MasterData(this, MasterData.Type.CREDITCARD, this.userId);
			masterData.showDialog();
			break;
		case R.id.master_emoney:
			masterData = new MasterData(this, MasterData.Type.EMONEY, this.userId);
			masterData.showDialog();
			break;
		case R.id.master_user:
			masterData = new MasterData(this, MasterData.Type.USER, this.userId);
			masterData.showDialog();
			break;
		default:
			break;
		}
		return true;
	}
	private void showDetailHistoryDialog() {
		String type;
		if (this.transactionType == TransactionType.CASH) {
			type = TransactionView.CASH;
		} else if (this.transactionType == TransactionType.BANK) {
			type = TransactionView.BANK;
		} else if (this.transactionType == TransactionType.CREDITCARD) {
			type = TransactionView.CREDITCARD;
		} else if (this.transactionType == TransactionType.EMONEY) {
			type = TransactionView.EMONEY;
		} else {
			// ありえないケース
			return;
		}
		
		KmvTransactions trans = new KmvTransactions(this);
		trans.open(true);
		List<String> detailList = trans.getDetailHistory(type, 10);
		trans.close();
		
		if (detailList.isEmpty()) {
			Toast.makeText(this, R.string.detail_nothing, Toast.LENGTH_SHORT).show();
			return;
		}
		
		CharSequence[] details = detailList.toArray(new CharSequence[detailList.size()]);

		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setTitle(R.string.please_select);
		builder.setItems(details, new HistoryClickListener());
		AlertDialog alert = builder.create();
		alert.show();

	}
	
}
