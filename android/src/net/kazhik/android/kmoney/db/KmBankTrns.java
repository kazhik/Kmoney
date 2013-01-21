package net.kazhik.android.kmoney.db;

import java.math.BigDecimal;
import java.text.ParseException;

import net.kazhik.android.kmoney.bean.BankTransaction;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmBankTrns extends KmTable {
	private static final String CREATE_TABLE = "CREATE TABLE km_bank_trns ("
			+ "id INTEGER PRIMARY KEY,"
			+ "transaction_date DATETIME,"
			+ "income REAL,"
			+ "expense REAL,"
			+ "category_id INTEGER,"
			+ "detail TEXT,"
			+ "internal INTEGER,"
			+ "user_id INTEGER,"
			+ "source INTEGER,"
			+ "bank_id INTEGER,"
			+ "last_update_time DATETIME)";
	public static final String TABLE_NAME = "km_bank_trns";

	public KmBankTrns(Context context) {
		super(context);
	}

	public static void init(SQLiteDatabase db) {
		db.execSQL(CREATE_TABLE);

	}

	public static void upgrade(SQLiteDatabase db) {
		KmTable.upgrade(db, TABLE_NAME, CREATE_TABLE);
	}

	public BankTransaction select(int id) throws ParseException {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(TABLE_NAME);

		String[] columns = { "transaction_date", "category_id", "detail",
				"income", "expense", "bank_id" };
		String selection = "id = ?";
		String[] selectionArgs = { String.valueOf(id) };

		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs,
				null, null, null, null);

		if (cursor == null) {
			return null;
		}

		cursor.moveToFirst();

		BankTransaction trn = new BankTransaction();
		int idx = 0;
		trn.setTransactionDate(cursor.getString(idx++));
		trn.setCategoryId(cursor.getInt(idx++));
		trn.setDetail(cursor.getString(idx++));
		trn.setIncome(new BigDecimal(cursor.getString(idx++)));
		trn.setExpense(new BigDecimal(cursor.getString(idx++)));
		trn.setBankId(cursor.getInt(idx++));

		cursor.close();

		return trn;
	}

	public void insert(BankTransaction trn) {
		ContentValues values = new ContentValues();

		values.put("transaction_date", trn.getTransactionDateStr());
		values.put("income", trn.getIncome().toPlainString());
		values.put("expense", trn.getExpense().toPlainString());
		values.put("category_id", trn.getCategoryId());
		values.put("detail", trn.getDetail());
		values.put("internal", trn.getInternal());
		values.put("user_id", trn.getUserId());
		values.put("source", trn.getSource());
		values.put("bank_id", trn.getBankId());
        values.put("last_update_date", this.getLastUpdateDateString());

		this.db.insert(TABLE_NAME, null, values);

	}

	public void update(BankTransaction trn) {
		ContentValues values = new ContentValues();

		values.put("transaction_date", trn.getTransactionDateStr());
		values.put("income", trn.getIncome().toPlainString());
		values.put("expense", trn.getExpense().toPlainString());
		values.put("category_id", trn.getCategoryId());
		values.put("detail", trn.getDetail());
		values.put("internal", trn.getInternal());
		values.put("user_id", trn.getUserId());
		values.put("source", trn.getSource());
		values.put("bank_id", trn.getBankId());
        values.put("last_update_date", this.getLastUpdateDateString());

		this.db.update(TABLE_NAME, values, "id = " + trn.getId(), null);

	}

	public void delete(int id) {
		this.db.delete(TABLE_NAME, "id = " + id, null);
	}

}
