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
import net.kazhik.android.kmoney.db.BankTransactionWriter;
import net.kazhik.android.kmoney.db.CashTransactionWriter;
import net.kazhik.android.kmoney.db.CreditCardTransactionWriter;
import net.kazhik.android.kmoney.db.EMoneyTransactionWriter;
import net.kazhik.android.kmoney.db.KmBankTrns;
import net.kazhik.android.kmoney.db.KmCashTrns;
import net.kazhik.android.kmoney.db.KmCreditCardTrns;
import net.kazhik.android.kmoney.db.KmDatabase;
import net.kazhik.android.kmoney.db.KmEMoneyTrns;
import net.kazhik.android.kmoney.db.KmvTransactions;
import net.kazhik.android.kmoney.db.MasterDataReader;
import net.kazhik.android.kmoney.db.TransactionWriter;
import net.kazhik.android.kmoney.masterdata.BankListActivity;
import net.kazhik.android.kmoney.masterdata.CategoryListActivity;
import net.kazhik.android.kmoney.masterdata.CreditCardListActivity;
import net.kazhik.android.kmoney.masterdata.EMoneyListActivity;
import net.kazhik.android.kmoney.masterdata.UserListActivity;
import net.kazhik.android.kmoney.storage.ExportDatabaseTask;
import net.kazhik.android.kmoney.storage.ExportDropboxTask;
import net.kazhik.android.kmoney.storage.ExportSdCardTask;
import net.kazhik.android.kmoney.storage.ExternalStorage;
import net.kazhik.android.kmoney.ui.AutoResizeTextView;
import net.kazhik.android.kmoney.ui.Day;
import net.kazhik.android.kmoney.ui.Money;
import net.kazhik.android.kmoney.ui.TransactionPhoto;
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
	private int updateTypeDetail;
	private int updateId;

	private ExportDatabaseTask exportTask;

	private static final int REQUEST_CAMERA = 100;
	private static final int REQUEST_MONTHLY = 101;

	private SharedPreferences prefs;

	private void setUser(int userId) {
		Editor editor = this.prefs.edit();
		editor.putInt("default_user", userId);
		editor.commit();
		
		this.userId = userId;
	}
	
	private void initUI() {
		this.initDateText();
		this.initTypeList();
		this.loadTransactionTypeDetail();
		this.initCategoryList();
		
		this.initAmountInput();
		this.initClearButton();
		this.initDateButton();
		this.initOkButton();
		this.initCancelButton();
		this.initHistoryButton();
		this.initPhotoButton();
		this.initCopyButton();

	}
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.entry);

		this.prefs = PreferenceManager.getDefaultSharedPreferences(this);
		this.initDatabase();
		
		this.loadDefaultUser();

		this.initUI();
		
		this.setToday();
		
		this.updateId = 0;
		this.updateType = TransactionType.NONE;
		this.updateTypeDetail = 0;
		this.transactionType = TransactionType.CASH;

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
		if (this.updateId == 0) {
			return;
		}
		this.updateId = 0;
		this.currentDay.today();
		this.setDateText();
		Toast.makeText(this, R.string.info_copyasnew, Toast.LENGTH_SHORT)
				.show();
	}

	private void clearAll() {
		this.updateId = 0;
		this.updateTypeDetail = 0;
		this.currentDay.today();
		this.setDateText();
		this.initAmount();

		EditText detail = (EditText) findViewById(R.id.editTextDetail);
		detail.setText("");
		
		this.photo.delete();
		
		Spinner spinnerType = (Spinner) findViewById(R.id.spinnerType);
		spinnerType.setSelection(0);

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

		Spinner spinner = (Spinner) findViewById(R.id.spinnerType);
		int pos = this.getSpinnerPosition(spinner, type);
		spinner.setSelection(pos);
		try {
			if (type == TransactionType.CASH) {
				KmCashTrns trn = new KmCashTrns(this);
				trn.open(true);
				CashTransaction trnInfo = trn.select(id);
				this.setField(trnInfo);
				trn.close();
			} else {
				int typeDetailId = 0;
				if (type == TransactionType.BANK) {
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
				} else {
					return;
				}
				this.initTransactionTypeDetail(type);
				this.setTransactionTypeDetail(typeDetailId);
				this.updateTypeDetail = typeDetailId;
			}
		} catch (ParseException e) {
			Log.e(Constants.APPNAME, e.getMessage());
			return;
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

	private void loadDefaultUser() {
		this.userId = this.prefs.getInt("default_user", 0);
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
		class DateLongClickListener implements View.OnLongClickListener {
			@Override
			public boolean onLongClick(View v) {
				KmoneyActivity.this.onLongClickDate();
				return false;
			}

		}
		// 長押し設定
		TextView tv = (TextView) findViewById(R.id.textViewDate);
		tv.setOnLongClickListener(new DateLongClickListener());

	}
	
	private void onLongClickDate() {
		class DateSetListener implements DatePickerDialog.OnDateSetListener {

			@Override
			public void onDateSet(DatePicker view, int year, int monthOfYear,
					int dayOfMonth) {

				KmoneyActivity.this.setCurrentDay(year, monthOfYear + 1, dayOfMonth);
			}

		}
		DatePickerDialog datePickerDialog = new DatePickerDialog(
				KmoneyActivity.this,
				new DateSetListener(),
				this.currentDay.getYear(),
				this.currentDay.getMonth() - 1,
				this.currentDay.getDay());
		datePickerDialog.show();
		
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

	private void onClickOk() {
		if (this.amount.isZero()) {
			Toast.makeText(this, R.string.error_zero, Toast.LENGTH_SHORT)
					.show();
			return;
		}
		this.writeTransaction();
		this.monthly();

	}

	private void initOkButton() {
		class OkButtonClickListener implements View.OnClickListener {

			@Override
			public void onClick(View v) {
				KmoneyActivity.this.onClickOk();
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
		List<Category> categoryList = MasterDataReader.getCategoryList(this);

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

	private void loadTransactionTypeDetail() {
		this.transactionTypeDetail = new HashMap<String, List<Item>>();
		this.transactionTypeDetail.put("bank", MasterDataReader.getBankList(this, this.userId));
		this.transactionTypeDetail.put("creditcard", MasterDataReader.getCreditCardList(this, this.userId));
		this.transactionTypeDetail.put("emoney", MasterDataReader.getEMoneyList(this, this.userId));

	}
	private void initTransactionTypeDetail(int typeId) {
		
		Spinner spinner = (Spinner) findViewById(R.id.spinnerTypeDetail);

		List<Item> trnsTypeList = new ArrayList<Item>();
		if (typeId == TransactionType.CASH) {
			spinner.setVisibility(View.INVISIBLE);
		} else if (typeId == TransactionType.BANK) {
			trnsTypeList = this.transactionTypeDetail.get("bank");
			spinner.setVisibility(View.VISIBLE);
		} else if (typeId == TransactionType.CREDITCARD) {
			trnsTypeList = this.transactionTypeDetail.get("creditcard");
			spinner.setVisibility(View.VISIBLE);
		} else if (typeId == TransactionType.EMONEY) {
			trnsTypeList = this.transactionTypeDetail.get("emoney");
			spinner.setVisibility(View.VISIBLE);
		} else {
			// ありえないケース
			return;
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

	private void setTransactionTypeDetail(int id) {
		Spinner spinnerDetail = (Spinner) findViewById(R.id.spinnerTypeDetail);
		int pos = this.getSpinnerPosition(spinnerDetail, id);
		if (pos != -1) {
			spinnerDetail.setSelection(pos, true);
		}
		
	}

	private void onSelectedTransactionType(int typeId) {
		KmoneyActivity.this.initTransactionTypeDetail(typeId);
		if (this.updateTypeDetail != 0) {
			this.setTransactionTypeDetail(this.updateTypeDetail);
		}
		
	}
	private void initTypeList() {
		class SelectTypeListener implements OnItemSelectedListener {

			@Override
			public void onItemSelected(AdapterView<?> parent, View view,
					int position, long id) {


				Spinner spinner = (Spinner) parent;
				Item item = (Item) spinner.getSelectedItem();
				KmoneyActivity.this.onSelectedTransactionType(item.getId());
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
	private void setToday() {
		this.currentDay = new Day(this);
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
		TransactionWriter writer;
		if (type == TransactionType.CASH) {
			writer = new CashTransactionWriter(this);
		} else if (type == TransactionType.BANK) {
			writer = new BankTransactionWriter(this);
		} else if (type == TransactionType.CREDITCARD) {
			writer = new CreditCardTransactionWriter(this);
		} else if (type == TransactionType.EMONEY) {
			writer = new EMoneyTransactionWriter(this);
		} else {
			return;
		}
		writer.delete(id);
	}

	private void writeTransaction() {
		if (this.updateType != TransactionType.NONE) {
			// transactiontypeが変更されたら元のレコードを削除
			if (this.transactionType != this.updateType) {
				this.deleteTransaction(this.updateType, this.updateId);
				this.updateId = 0;
			}
		}
		TransactionWriter writer;
		
		if (this.transactionType == TransactionType.CASH) {
			CashTransaction tran = new CashTransaction(this.getField());

			writer = new CashTransactionWriter(this, tran);
		} else {
			Spinner spinner = (Spinner) findViewById(R.id.spinnerTypeDetail);
			Item item = (Item) spinner.getSelectedItem();
			if (this.transactionType == TransactionType.BANK) {
				BankTransaction tran = new BankTransaction(this.getField());
				tran.setBankId(item.getId());

				writer = new BankTransactionWriter(this, tran);
			} else if (this.transactionType == TransactionType.CREDITCARD) {
				CreditCardTransaction tran = new CreditCardTransaction(this.getField());
				tran.setCardId(item.getId());

				writer = new CreditCardTransactionWriter(this, tran);
			} else if (this.transactionType == TransactionType.EMONEY) {
				EMoneyTransaction tran = new EMoneyTransaction(this.getField());
				tran.setEmoneyId(item.getId());

				writer = new EMoneyTransactionWriter(this, tran);
			} else {
				// ありえないケース
				return;
			}
		}
			
		
		if (this.updateId > 0) {
			writer.update();
		} else {
			writer.insert();
		}
		this.clearAll();

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
		tran.setId(this.updateId);
		return tran;
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
		List<Item> userList = MasterDataReader.getUserNameList(this);

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
		this.clearAll();
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
			this.transactionType = this.updateType;

			this.loadTransaction(this.updateType, this.updateId);
			
		}
	}
	@Override
	public void onBackPressed() {
		moveTaskToBack(true);
	}


}
