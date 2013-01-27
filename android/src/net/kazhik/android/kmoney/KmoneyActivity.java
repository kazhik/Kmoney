package net.kazhik.android.kmoney;

import java.io.File;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
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
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.app.FragmentActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

import com.dropbox.client2.DropboxAPI;
import com.dropbox.client2.android.AndroidAuthSession;
import com.dropbox.client2.session.AccessTokenPair;
import com.dropbox.client2.session.AppKeyPair;
import com.dropbox.client2.session.Session.AccessType;

public class KmoneyActivity extends FragmentActivity {
	private Calendar currentDay;
	private int userId;
	private int transactionType;
	private Map<String, List<Item>> transactionTypeDetail;
	private Money amount;

	private int updateType;
	private int updateId;

	final static private String APP_KEY = "kuyk8nn6g6osz3s";
	final static private String APP_SECRET = "58pm6zl92rcg5i9";
	final static private AccessType ACCESS_TYPE = AccessType.APP_FOLDER;
	private DropboxAPI<AndroidAuthSession> mDBApi;

	private static final int REQUEST_CAMERA = 100;
	private Uri imageFileUri = null;
	

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
			KmoneyActivity.this.addNumber(this.number);

		}

	}
	private class DoubleZeroClickListener implements View.OnClickListener {
		@Override
		public void onClick(View v) {
			KmoneyActivity.this.addNumber(0);
			KmoneyActivity.this.addNumber(0);
		}

	}
	private class DecimalMarkClickListener implements View.OnClickListener {
		@Override
		public void onClick(View v) {
			KmoneyActivity.this.addDecimalMark();

		}

	}
	private class ClearButtonClickListener implements View.OnClickListener {
		@Override
		public void onClick(View v) {
			KmoneyActivity.this.initAmount();

		}
	}

	private class BackspaceButtonClickListener implements View.OnClickListener {
		@Override
		public void onClick(View v) {
			KmoneyActivity.this.backspace();
		}
	}
	private void backspace() {
		String str = this.amount.backspace();
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		tv.setText(str);
		
	}

	private class PhotoButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
			KmoneyActivity.this.takePicture();

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

			
			KmoneyActivity.this.setCurrentDay(year, monthOfYear, dayOfMonth);
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

		this.initCategoryList();
		this.initTypeList();
		this.initAmountInput();
		this.initClearButton();
		this.initDateText();
		this.initDateButton();
		this.initOkButton();
		this.initCancelButton();
		this.initHistoryButton();
		this.initPhotoButton();
		this.initTransactionTypeDetal();
		this.initDropbox();
		

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
		ArrayAdapter<Item> adapter = (ArrayAdapter<Item>) spinner.getAdapter();

		int cnt = adapter.getCount();
		for (int i = 0; i < cnt; i++) {
			Item item = adapter.getItem(i);
			if (item.getId() == id) {
				return i;
			}
		}
		return -1;

	}

	private void setField(Transaction trn) {
		this.currentDay.setTime(trn.getTransactionDate());

		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		ToggleButton tglButton = (ToggleButton) findViewById(R.id.toggleButtonIncomeExpense);
		String str;
		if (trn.getIncome() != null && trn.getIncome().compareTo(new BigDecimal("0")) != 0) {
			tglButton.setChecked(true);
			str = this.amount.setValue(trn.getIncome().toPlainString());
		} else {
			tglButton.setChecked(false);
			str = this.amount.setValue(trn.getExpense().toPlainString());
		}
		tv.setText(str);
		Spinner spinner = (Spinner) findViewById(R.id.spinnerCategory);
		int pos = this.getSpinnerPosition(spinner, trn.getCategoryId());
		spinner.setSelection(pos);

		tv = (TextView) findViewById(R.id.editTextDetail);
		tv.setText(trn.getDetail());

	}

	private void loadTransaction(int type, int id) {
		Spinner spinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
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
		SimpleDateFormat sdfDayOfWeek = new SimpleDateFormat("E",
				Locale.getDefault());
		// 月名
		SimpleDateFormat sdfMonthName = new SimpleDateFormat("MMM",
				Locale.getDefault());

		return String.format(getString(R.string.date_format), year, month + 1,
				day, sdfDayOfWeek.format(cal.getTime()),
				sdfMonthName.format(cal.getTime()));

	}

	private void setDateText(int year, int month, int day) {
		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.formatDate(year, month, day));
	}
	
	private void initDropbox() {
		AppKeyPair appKeys = new AppKeyPair(APP_KEY, APP_SECRET);
		AndroidAuthSession session = new AndroidAuthSession(appKeys,
				ACCESS_TYPE);
		mDBApi = new DropboxAPI<AndroidAuthSession>(session);
		
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
			Log.e(Constants.APPNAME, e.getMessage(), e);
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

	private void initAmount() {
		AutoResizeTextView tv = (AutoResizeTextView) findViewById(R.id.textViewAmount);
		tv.setText(this.amount.setValue("0"));
	}

	private void initAmountInput() {
		this.amount = new Money();
		AutoResizeTextView tv = (AutoResizeTextView) findViewById(R.id.textViewAmount);
		tv.setText(this.amount.setValue("0"));

		int idArray[] = { R.id.button0, R.id.button1, R.id.button2,
				R.id.button3, R.id.button4, R.id.button5, R.id.button6,
				R.id.button7, R.id.button8, R.id.button9 };
		for (int i = 0; i < 10; i++) {
			Button btnNum = (Button) findViewById(idArray[i]);
			btnNum.setOnClickListener(new NumberClickListener(i));
		}
		Button btnMark = (Button) findViewById(R.id.buttonDecimalMark);
		if (this.amount.getFractionDigits() == 0) {
			btnMark.setOnClickListener(new DoubleZeroClickListener());
			btnMark.setText(getResources().getString(R.string.doublezero));
		} else {
			btnMark.setOnClickListener(new DecimalMarkClickListener());
			btnMark.setText(Character.toString(this.amount.getDecimalMark()));
		}

		Button btnBs = (Button) findViewById(R.id.buttonBackSpace);
		btnBs.setOnClickListener(new BackspaceButtonClickListener());
	
	}

	private void initPhotoButton() {
		ImageButton btn = (ImageButton) findViewById(R.id.buttonPhoto);
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

	private void initCategoryList() {
		// DBから費目のリストを取得
		KmCategory dbCategory = new KmCategory(this);
		dbCategory.open(true);
		List<Category> categoryList = dbCategory.getCategoryList(0);
		dbCategory.close();

		// Spinnerに費目のリストをセット
		ArrayAdapter<Item> adapter = new ArrayAdapter<Item>(this,
				android.R.layout.simple_spinner_item);

		Iterator<Category> it = categoryList.iterator();
		while (it.hasNext()) {
			Category item = it.next();
			adapter.add(new Item(item.getId(), item.getName()));
		}

		adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

		Spinner spinnerCategory = (Spinner) findViewById(R.id.spinnerCategory);
		spinnerCategory.setAdapter(adapter);
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

	}

	private void initTypeList() {
		ArrayAdapter<Item> adapter = new ArrayAdapter<Item>(this,
				android.R.layout.simple_spinner_item);
		adapter.add(new Item(TransactionType.CASH, getResources().getString(
				R.string.cash)));
		adapter.add(new Item(TransactionType.BANK, getResources().getString(
				R.string.bank)));
		adapter.add(new Item(TransactionType.CREDITCARD, getResources()
				.getString(R.string.creditcard)));
		adapter.add(new Item(TransactionType.EMONEY, getResources().getString(
				R.string.emoney)));

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
			spinner.setVisibility(View.INVISIBLE);
		} else if (id == TransactionType.BANK) {
			this.transactionType = TransactionType.BANK;
			trnsTypeList = this.transactionTypeDetail.get("bank");
			spinner.setVisibility(View.VISIBLE);
		} else if (id == TransactionType.CREDITCARD) {
			this.transactionType = TransactionType.CREDITCARD;
			trnsTypeList = this.transactionTypeDetail.get("creditcard");
			spinner.setVisibility(View.VISIBLE);
		} else if (id == TransactionType.EMONEY) {
			this.transactionType = TransactionType.EMONEY;
			trnsTypeList = this.transactionTypeDetail.get("emoney");
			spinner.setVisibility(View.VISIBLE);
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
	private void addNumber(int number) {
		try {
			String str = this.amount.addChar(Character.forDigit(number, 10));
			AutoResizeTextView tv = (AutoResizeTextView) findViewById(R.id.textViewAmount);
			tv.setText(str);
			tv.resizeText();
		} catch (ParseException e) {
			Log.e(Constants.APPNAME, e.getMessage(), e);
		}
		
	}
	private void addDecimalMark() {
		if (this.amount.getFractionDigits() == 0) {
			return;
		}
		try {
			String str = this.amount.addDecimalMark();
			AutoResizeTextView tv =
					(AutoResizeTextView) findViewById(R.id.textViewAmount);
			tv.setText(str);
			tv.resizeText();
		} catch (ParseException e) {
			Log.e(Constants.APPNAME, e.getMessage());
		}
		
		
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
	private void setCurrentDay(int year, int month, int day) {
		this.setDateText(year, month, day);
		this.currentDay.set(Calendar.YEAR, year);
		this.currentDay.set(Calendar.MONTH, month);
		this.currentDay.set(Calendar.DAY_OF_MONTH, day);
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
		Log.d("Kmoney", this.currentDay.toString());

		ToggleButton tglButton = (ToggleButton) findViewById(R.id.toggleButtonIncomeExpense);
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		// トグルボタンON(checked)なら収入、OFFなら支出
		if (tglButton.isChecked()) {
			tran.setIncome(this.amount.getValue());
			tran.setExpense(new BigDecimal("0"));
		} else {
			tran.setIncome(new BigDecimal("0"));
			tran.setExpense(this.amount.getValue());
		}
		Spinner spinner = (Spinner) findViewById(R.id.spinnerCategory);
		Item item = (Item) spinner.getSelectedItem();
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

		ToggleButton tglButton = (ToggleButton) findViewById(R.id.toggleButtonIncomeExpense);
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		// トグルボタンON(checked)なら収入、OFFなら支出
		if (tglButton.isChecked()) {
			tran.setIncome(this.amount.getValue());
			tran.setExpense(new BigDecimal("0"));
		} else {
			tran.setIncome(new BigDecimal("0"));
			tran.setExpense(this.amount.getValue());
		}
		Item item;
		Spinner bankSpinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
		item = (Item) bankSpinner.getSelectedItem();
		tran.setBankId(item.getId());

		Spinner itemSpinner = (Spinner) findViewById(R.id.spinnerCategory);
		item = (Item) itemSpinner.getSelectedItem();
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

		ToggleButton tglButton = (ToggleButton) findViewById(R.id.toggleButtonIncomeExpense);
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		// トグルボタンON(checked)なら収入、OFFなら支出
		if (tglButton.isChecked()) {
			tran.setIncome(this.amount.getValue());
			tran.setExpense(new BigDecimal("0"));
		} else {
			tran.setIncome(new BigDecimal("0"));
			tran.setExpense(this.amount.getValue());
		}
		Item item;
		Spinner cardSpinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
		item = (Item) cardSpinner.getSelectedItem();
		tran.setCardId(item.getId());

		Spinner itemSpinner = (Spinner) findViewById(R.id.spinnerCategory);
		item = (Item) itemSpinner.getSelectedItem();
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

		ToggleButton tglButton = (ToggleButton) findViewById(R.id.toggleButtonIncomeExpense);
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		// トグルボタンON(checked)なら収入、OFFなら支出
		if (tglButton.isChecked()) {
			tran.setIncome(this.amount.getValue());
			tran.setExpense(new BigDecimal("0"));
		} else {
			tran.setIncome(new BigDecimal("0"));
			tran.setExpense(this.amount.getValue());
		}
		Item item;
		Spinner emoneySpinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
		item = (Item) emoneySpinner.getSelectedItem();
		tran.setEmoneyId(item.getId());

		Spinner itemSpinner = (Spinner) findViewById(R.id.spinnerCategory);
		item = (Item) itemSpinner.getSelectedItem();
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
	protected void onResume() {
		super.onResume();
		if (mDBApi.getSession().authenticationSuccessful()) {
			try {
				// MANDATORY call to complete auth.
				// Sets the access token on the session
				mDBApi.getSession().finishAuthentication();

				AccessTokenPair tokens = mDBApi.getSession()
						.getAccessTokenPair();

				// Provide your own storeKeys to persist the access token pair
				// A typical way to store tokens is using SharedPreferences
//				storeKeys(tokens.key, tokens.secret);
			} catch (IllegalStateException e) {
				Log.i("DbAuthLog", "Error authenticating", e);
			}
		}
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.kmoney, menu);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		Intent i;
		switch (item.getItemId()) {
		case R.id.menu_export_sdcard:
			ExportDatabaseTask exportDb = new ExportDatabaseTask(this);
			exportDb.execute(this.getDatabasePath(KmDatabase.DATABASE_NAME).toString());
			break;
		case R.id.menu_export_dropbox:
			mDBApi.getSession().startAuthentication(this);
			break;
		case R.id.menu_settings:
			break;
		case R.id.master_category:
			i = new Intent(KmoneyActivity.this, CategoryListActivity.class);
			startActivity(i);
			break;
		case R.id.master_bank:
			i = new Intent(KmoneyActivity.this, BankListActivity.class);
			i.putExtra("userId", this.userId);
			startActivity(i);
			break;
		case R.id.master_creditcard:
			i = new Intent(KmoneyActivity.this, CreditCardListActivity.class);
			i.putExtra("userId", this.userId);
			startActivity(i);
			break;
		case R.id.master_emoney:
			i = new Intent(KmoneyActivity.this, EMoneyListActivity.class);
			i.putExtra("userId", this.userId);
			startActivity(i);
			break;
		case R.id.master_user:
			i = new Intent(KmoneyActivity.this, UserListActivity.class);
			startActivity(i);
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
			Toast.makeText(this, R.string.detail_nothing, Toast.LENGTH_SHORT)
					.show();
			return;
		}

		CharSequence[] details = detailList.toArray(new CharSequence[detailList
				.size()]);

		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setTitle(R.string.please_select);
		builder.setItems(details, new HistoryClickListener());
		AlertDialog alert = builder.create();
		alert.show();

	}
	private static Uri getOutputMediaFileUri(){
	      return Uri.fromFile(getOutputMediaFile());
	}
	/** Create a File for saving an image or video */
	private static File getOutputMediaFile(){
	    // To be safe, you should check that the SDCard is mounted
	    // using Environment.getExternalStorageState() before doing this.

	    File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(
	              Environment.DIRECTORY_PICTURES), "Kmoney");
	    // This location works best if you want the created images to be shared
	    // between applications and persist after your app has been uninstalled.

	    // Create the storage directory if it does not exist
	    if (! mediaStorageDir.exists()){
	        if (! mediaStorageDir.mkdirs()){
	            Log.d("Kmoney", "failed to create directory");
	            return null;
	        }
	    }

	    // Create a media file name
	    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault());
	    String timeStamp = sdf.format(new Date());
	    File mediaFile = new File(mediaStorageDir.getPath() + File.separator
				+ "IMG_" + timeStamp + ".jpg");

	    return mediaFile;
	}	
	
	private void takePicture() {
	    // create Intent to take a picture and return control to the calling application
	    Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

	    this.imageFileUri = getOutputMediaFileUri(); // create a file to save the image
	    
	    intent.putExtra(MediaStore.EXTRA_OUTPUT, this.imageFileUri); // set the image file name

	    // start the image capture Intent
	    startActivityForResult(intent, REQUEST_CAMERA);		
	}
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		
		if (requestCode == REQUEST_CAMERA) {
			if (resultCode == RESULT_OK) {
				Uri imageUri;
				if (data.getData() != null) {
					imageUri = data.getData();
				} else {
					imageUri = this.imageFileUri;
				}
				Toast.makeText(this, "Image saved to:\n" + imageUri.getPath(),
						Toast.LENGTH_LONG).show();
			} else {
				this.imageFileUri = null;
			}
		}
	}	

}
