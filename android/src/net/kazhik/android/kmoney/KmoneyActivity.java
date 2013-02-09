package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import net.kazhik.android.kmoney.bean.BankTransaction;
import net.kazhik.android.kmoney.bean.CashTransaction;
import net.kazhik.android.kmoney.bean.Category;
import net.kazhik.android.kmoney.bean.CreditCardTransaction;
import net.kazhik.android.kmoney.bean.EMoneyTransaction;
import net.kazhik.android.kmoney.bean.Item;
import net.kazhik.android.kmoney.bean.Transaction;
import net.kazhik.android.kmoney.db.KmBankInfo;
import net.kazhik.android.kmoney.db.KmBankTrns;
import net.kazhik.android.kmoney.db.KmCashTrns;
import net.kazhik.android.kmoney.db.KmCategory;
import net.kazhik.android.kmoney.db.KmCreditCardInfo;
import net.kazhik.android.kmoney.db.KmCreditCardTrns;
import net.kazhik.android.kmoney.db.KmDatabase;
import net.kazhik.android.kmoney.db.KmEMoneyInfo;
import net.kazhik.android.kmoney.db.KmEMoneyTrns;
import net.kazhik.android.kmoney.db.KmUserInfo;
import net.kazhik.android.kmoney.db.KmvTransactions;
import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.res.Configuration;
import android.database.SQLException;
import android.net.Uri;
import android.os.Bundle;
import android.preference.PreferenceManager;
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

public class KmoneyActivity extends FragmentActivity {
	private Day currentDay;
	private int userId;
	private int transactionType;
	private Map<String, List<Item>> transactionTypeDetail;
	private Money amount;
	private TransactionPhoto photo = null;

	private int updateType;
	private int updateId;

	private ExportDatabaseTask exportTask;

	private static final int REQUEST_CAMERA = 100;
	private static final int REQUEST_MONTHLY = 101;

	private SharedPreferences prefs;

	private int getDefaultUser() {
		return this.prefs.getInt("default_user", 0);
	}
	private void setUser(int userId) {
		Editor editor = this.prefs.edit();
		editor.putInt("default_user", userId);
		editor.commit();
		
		this.userId = userId;
	}
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.entry);

		this.prefs = PreferenceManager.getDefaultSharedPreferences(this);

		this.currentDay = new Day(this);
		
		this.initCurrentUser();

		this.initDatabase();

		this.initCategoryList();
		this.initTypeList();
		this.initAmountInput();
		this.initClearButton();
		this.initDateText(true);
		this.initDateButton();
		this.initOkButton();
		this.initCancelButton();
		this.initHistoryButton();
		this.initPhotoButton();
		this.initCopyButton();
		this.initTransactionTypeDetal();

		this.updateId = 0;
		this.updateType = TransactionType.NONE;

	}
	@Override
	protected void onDestroy() {
		super.onDestroy();
		
		this.photo.delete();
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

	private void copyAsNew() {
		this.updateId = 0;
		this.currentDay.today();
		this.initDateText(false);
	}

	private void setField(Transaction trn) {
		this.currentDay.set(trn.getTransactionDate());

		this.setDateText();

		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		ToggleButton tglButton = (ToggleButton) findViewById(R.id.toggleButtonIncomeExpense);
		String str;
		if (trn.getIncome() != null
				&& trn.getIncome().compareTo(new BigDecimal("0")) != 0) {
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
		int typeDetailId = 0;

		try {
			if (type == TransactionType.CASH) {
				KmCashTrns trn = new KmCashTrns(this);
				trn.open(true);
				CashTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
				trn.close();
			} else if (type == TransactionType.BANK) {
				KmBankTrns trn = new KmBankTrns(this);
				trn.open(true);
				BankTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
				typeDetailId = trnInfo.getBankId();
				trn.close();
			} else if (type == TransactionType.CREDITCARD) {
				KmCreditCardTrns trn = new KmCreditCardTrns(this);
				trn.open(true);
				CreditCardTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
				typeDetailId = trnInfo.getCardId();
				trn.close();
			} else if (type == TransactionType.EMONEY) {
				KmEMoneyTrns trn = new KmEMoneyTrns(this);
				trn.open(true);
				EMoneyTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
				typeDetailId = trnInfo.getEmoneyId();
				trn.close();
			}
		} catch (ParseException e) {
			Log.e(Constants.APPNAME, e.getMessage());
			return;
		}
		if (typeDetailId > 0) {
			this.initTransactionTypeDetail(type);
			Spinner spinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
			int pos = this.getSpinnerPosition(spinner, typeDetailId);
			spinner.setSelection(pos);
		}

	}

	private void backspace() {
		String str = this.amount.backspace();
		TextView tv = (TextView) findViewById(R.id.textViewAmount);
		tv.setText(str);

	}

	private void setDateText() {
		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setText(this.currentDay.getText());
	}

	private void executeExport() {
		
		String exportType = this.prefs.getString("export_type", "sdcard");
		String dbPath = this.getDatabasePath(KmDatabase.DATABASE_NAME)
				.toString();
		if (exportType.equals("sdcard")) {
			this.exportTask = new ExportSdCardTask(this, dbPath);
		} else if (exportType.equals("dropbox")) {
			this.exportTask = new ExportDropboxTask(this, dbPath);
		}
		this.exportTask.start();

	}

	private void initCurrentUser() {
		this.userId = this.getDefaultUser();
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

	private void initDateText(boolean initListener) {
		class DateLongClickListener implements View.OnLongClickListener {
			class DateSetListener implements DatePickerDialog.OnDateSetListener {

				@Override
				public void onDateSet(DatePicker view, int year, int monthOfYear,
						int dayOfMonth) {

					KmoneyActivity.this.setCurrentDay(year, monthOfYear, dayOfMonth);
				}

			}
			private int year;
			private int month;
			private int day;

			public DateLongClickListener(int year, int month, int day) {
				this.year = year;
				this.month = month;
				this.day = day;
			}

			@Override
			public boolean onLongClick(View v) {
				DatePickerDialog datePickerDialog = new DatePickerDialog(
						KmoneyActivity.this,
						new DateSetListener(),
						this.year,
						this.month,
						this.day);
				datePickerDialog.show();
				return false;
			}

		}

		this.setDateText();

		if (initListener) {
			// 長押し設定
			TextView tv = (TextView) findViewById(R.id.textViewDate);
			tv.setOnLongClickListener(new DateLongClickListener(
					this.currentDay.getYear(),
					this.currentDay.getMonth(),
					this.currentDay.getDay()));
		}

	}

	private void initDateButton() {
		class DateButtonClickListener implements View.OnClickListener {
			private String direction;

			public DateButtonClickListener(String direction) {
				this.direction = direction;

			}

			@Override
			public void onClick(View v) {
				KmoneyActivity.this.changeDay(this.direction);
			}

		}
		Button btnPrev = (Button) findViewById(R.id.buttonPrev);
		btnPrev.setOnClickListener(new DateButtonClickListener("prev"));

		Button btnNext = (Button) findViewById(R.id.buttonNext);
		btnNext.setOnClickListener(new DateButtonClickListener("next"));

	}

	private void initClearButton() {
		class ClearButtonClickListener implements View.OnClickListener {
			@Override
			public void onClick(View v) {
				KmoneyActivity.this.initAmount();

			}
		}
		Button btn = (Button) findViewById(R.id.buttonClear);
		btn.setOnClickListener(new ClearButtonClickListener());

	}

	private void initAmount() {
		AutoResizeTextView tv = (AutoResizeTextView) findViewById(R.id.textViewAmount);
		tv.setText(this.amount.setValue("0"));
	}

	private void initAmountInput() {
		/**
		 * BSキー
		 *
		 */
		class BackspaceButtonClickListener implements View.OnClickListener {
			@Override
			public void onClick(View v) {
				KmoneyActivity.this.backspace();
			}
		}
		/**
		 * Clearキー
		 *
		 */
		class ClearButtonClickListener implements View.OnClickListener {
			@Override
			public void onClick(View v) {
				KmoneyActivity.this.initAmount();

			}
		}
		/**
		 * 小数点キー
		 *
		 */
		class DecimalMarkClickListener implements View.OnClickListener {
			@Override
			public void onClick(View v) {
				KmoneyActivity.this.addDecimalMark();

			}

		}
		/**
		 * 数字キー
		 *
		 */
		class NumberClickListener implements View.OnClickListener {
			int number;

			public NumberClickListener(int number) {
				this.number = number;
			}

			@Override
			public void onClick(View v) {
				KmoneyActivity.this.addNumber(this.number);

			}

		}
		/**
		 * "00"キー
		 *
		 */
		class DoubleZeroClickListener implements View.OnClickListener {
			@Override
			public void onClick(View v) {
				KmoneyActivity.this.addNumber(0);
				KmoneyActivity.this.addNumber(0);
			}

		}

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

		Button btnClear = (Button) findViewById(R.id.buttonClear);
		btnClear.setOnClickListener(new ClearButtonClickListener());
	}

	private void initPhotoButton() {
		class PhotoButtonClickListener implements View.OnClickListener {
			@Override
			public void onClick(View v) {
				KmoneyActivity.this.photo();

			}
		}

		ImageButton btn = (ImageButton) findViewById(R.id.buttonPhoto);
		btn.setOnClickListener(new PhotoButtonClickListener());

		this.photo = new TransactionPhoto(this);
	}

	private void initOkButton() {
		class OkButtonClickListener implements View.OnClickListener {

			@Override
			public void onClick(View v) {
				KmoneyActivity.this.writeTransaction();
				KmoneyActivity.this.monthly();
			}

		}
		Button btn = (Button) findViewById(R.id.buttonOk);
		btn.setOnClickListener(new OkButtonClickListener());

	}

	private void initCancelButton() {
		class CancelButtonClickListener implements View.OnClickListener {

			@Override
			public void onClick(View v) {
				KmoneyActivity.this.cancel();

			}

		}

		Button btn = (Button) findViewById(R.id.buttonCancel);
		btn.setOnClickListener(new CancelButtonClickListener());

	}

	private void initCopyButton() {
		class CopyButtonClickListener implements View.OnClickListener {
			@Override
			public void onClick(View v) {
				KmoneyActivity.this.copyAsNew();
			}
		}

		Button btn = (Button) findViewById(R.id.buttonCopy);
		btn.setOnClickListener(new CopyButtonClickListener());

	}

	private void initHistoryButton() {
		class HistoryButtonClickListener implements View.OnClickListener {
			@Override
			public void onClick(View v) {
				KmoneyActivity.this.showDetailHistoryDialog();
			}
		}

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
		class SelectTypeListener implements OnItemSelectedListener {

			@Override
			public void onItemSelected(AdapterView<?> parent, View view,
					int position, long id) {

				Spinner spinner = (Spinner) parent;
				Item item = (Item) spinner.getSelectedItem();
				KmoneyActivity.this.initTransactionTypeDetail(item.getId());

			}

			@Override
			public void onNothingSelected(AdapterView<?> arg0) {

			}

		}
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

	private void initTransactionTypeDetail(int id) {
		
		Spinner spinner = (Spinner) findViewById(R.id.spinnerTypeDetail);

		List<Item> trnsTypeList = new ArrayList<Item>();
		if (id == TransactionType.CASH) {
			spinner.setVisibility(View.INVISIBLE);
		} else if (id == TransactionType.BANK) {
			trnsTypeList = this.transactionTypeDetail.get("bank");
			spinner.setVisibility(View.VISIBLE);
		} else if (id == TransactionType.CREDITCARD) {
			trnsTypeList = this.transactionTypeDetail.get("creditcard");
			spinner.setVisibility(View.VISIBLE);
		} else if (id == TransactionType.EMONEY) {
			trnsTypeList = this.transactionTypeDetail.get("emoney");
			spinner.setVisibility(View.VISIBLE);
		} else {
			// ありえないケース
			return;
		}
		this.transactionType = id;
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

	/**
	 * 小数点を追加
	 */
	private void addDecimalMark() {
		if (this.amount.getFractionDigits() == 0) {
			return;
		}
		try {
			String str = this.amount.addDecimalMark();
			AutoResizeTextView tv = (AutoResizeTextView) findViewById(R.id.textViewAmount);
			tv.setText(str);
			tv.resizeText();
		} catch (ParseException e) {
			Log.e(Constants.APPNAME, e.getMessage());
		}

	}

	/**
	 * 日付を変更
	 * @param direction
	 */
	private void changeDay(String direction) {
		if (direction.equals("prev")) {
			this.currentDay.prevDay();
		} else {
			this.currentDay.nextDay();
		}

		this.setDateText();
	}

	/**
	 * 日付を設定
	 * @param year
	 * @param month
	 * @param day
	 */
	private void setCurrentDay(int year, int month, int day) {
		this.currentDay.set(year, month, day);
		this.setDateText();
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
			Log.e(Constants.APPNAME, e.getMessage());
		}

	}
	private Transaction getField() {
		Transaction tran = new Transaction();
		
		tran.setTransactionDate(this.currentDay.getDate());

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

		tran.setImageUri(this.photo.getPath());
		
		tran.setInternal(0);
		tran.setUserId(this.userId);
		tran.setSource(1);
		return tran;
	}

	private void writeCashTransaction(int id) throws ParseException {
		CashTransaction tran = new CashTransaction(this.getField());

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
		BankTransaction tran = new BankTransaction(this.getField());

		Spinner bankSpinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
		Item item = (Item) bankSpinner.getSelectedItem();
		tran.setBankId(item.getId());

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
		CreditCardTransaction tran = new CreditCardTransaction(this.getField());

		Spinner cardSpinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
		Item item = (Item) cardSpinner.getSelectedItem();
		tran.setCardId(item.getId());

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
		EMoneyTransaction tran = new EMoneyTransaction(this.getField());

		Spinner emoneySpinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
		Item item = (Item) emoneySpinner.getSelectedItem();
		tran.setEmoneyId(item.getId());

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
		
		if (this.exportTask instanceof ExportDropboxTask) {
			((ExportDropboxTask)this.exportTask).finishAuthentication();
		}
		
	}

	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
		
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.kmoney, menu);
		return true;
	}
	
	private List<String> toNameList(List<Item> itemList) {
		ArrayList<String> nameList = new ArrayList<String>();
		
		Iterator<Item> it = itemList.iterator();
		while (it.hasNext()) {
			nameList.add(it.next().getName());

		}
		return nameList;
	
	}
	private void switchUser() {
		class SwitchUserListener implements DialogInterface.OnClickListener {
			private List<Item> userList;
			public SwitchUserListener(List<Item> userList) {
				this.userList = userList;
			}
			@Override
			public void onClick(DialogInterface dialog, int which) {
				Item item = this.userList.get(which);
				
				KmoneyActivity.this.setUser(item.getId());
			}
			
		}
		KmUserInfo user = new KmUserInfo(this);
		user.open(true);
		List<Item> userList = user.getUserNameList();
		user.close();

		if (userList.isEmpty()) {
			Toast.makeText(this, R.string.detail_nothing, Toast.LENGTH_SHORT)
					.show();
			return;
		}
		List<String> nameList = this.toNameList(userList);
				
		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setTitle(R.string.user);
		builder.setItems(nameList.toArray(new CharSequence[nameList.size()]),
				new SwitchUserListener(userList));
		
		AlertDialog alert = builder.create();
		alert.show();
		
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		Intent i;
		switch (item.getItemId()) {
		case R.id.menu_export:
			this.executeExport();
			break;
		case R.id.menu_settings:
			startActivity(new Intent(this, SettingsActivity.class));
			break;
		case R.id.menu_user:
			this.switchUser();
			break;
		case R.id.master_category:
			i = new Intent(this, CategoryListActivity.class);
			startActivity(i);
			break;
		case R.id.master_bank:
			i = new Intent(this, BankListActivity.class);
			i.putExtra("userId", this.userId);
			startActivity(i);
			break;
		case R.id.master_creditcard:
			i = new Intent(this, CreditCardListActivity.class);
			i.putExtra("userId", this.userId);
			startActivity(i);
			break;
		case R.id.master_emoney:
			i = new Intent(this, EMoneyListActivity.class);
			i.putExtra("userId", this.userId);
			startActivity(i);
			break;
		case R.id.master_user:
			i = new Intent(this, UserListActivity.class);
			startActivity(i);
			break;
		default:
			break;
		}
		return true;
	}

	private void showDetailHistoryDialog() {
		class HistoryClickListener implements DialogInterface.OnClickListener {
			public void onClick(DialogInterface dialog, int item) {
				ListView lv = ((AlertDialog) dialog).getListView();
				String str = (String) lv.getAdapter().getItem(item);

				EditText detail = (EditText) findViewById(R.id.editTextDetail);
				detail.setText(str);
			}

		}		

		KmvTransactions trans = new KmvTransactions(this);
		trans.open(true);
		List<String> detailList = trans.getDetailHistory(this.transactionType, 10);
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

	private void photo() {
		if (this.photo.getUri() != null) {
			this.photo.show();
		} else {
			this.takePicture();
		}
	}

	private void cancel() {
		this.photo.delete();
		this.monthly();
	}

	private void takePicture() {
		Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

		Uri imageFileUri = ExternalStorage.getImageFileUri();
		this.photo.setUri(imageFileUri);
		intent.putExtra(MediaStore.EXTRA_OUTPUT, imageFileUri);
		startActivityForResult(intent, REQUEST_CAMERA);
	}
	private void monthly() {
		Intent intent = new Intent(KmoneyActivity.this, MonthlyActivity.class);
		startActivityForResult(intent, REQUEST_MONTHLY);
		
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {

		if (requestCode == REQUEST_CAMERA) {
			if (resultCode == RESULT_OK) {
				Uri imageUri;
				if (data.getData() != null) {
					imageUri = data.getData();
					this.photo.setUri(imageUri);
				} else {
					imageUri = this.photo.getUri();
					if (imageUri == null) {
						Toast.makeText(this, R.string.error_photo, Toast.LENGTH_SHORT)
						.show();
					}
				}
				if (imageUri != null) {
					this.photo.show();
				}
			} else {
				this.photo.setUri(null);
			}
		} else if (requestCode == REQUEST_MONTHLY) {
			if (data == null) {
				return;
			}
			Bundle b = data.getExtras();
			if (b == null) {
				return;
			}

			String idStr = b.getString("id");
			if (idStr == null) {
				return;
			}

			String typeStr = b.getString("type");
			if (typeStr == null) {
				return;
			}

			this.updateId = Integer.parseInt(idStr);
			this.updateType = TransactionType.getType(typeStr);

			this.loadTransaction(this.updateType, this.updateId);
			
		}
	}

}
