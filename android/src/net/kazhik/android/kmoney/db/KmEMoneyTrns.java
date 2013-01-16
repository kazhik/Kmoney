package net.kazhik.android.kmoney.db;

import java.math.BigDecimal;
import java.text.ParseException;

import net.kazhik.android.kmoney.bean.EMoneyTransaction;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmEMoneyTrns extends KmTable {
	private static final String CREATE_TABLE =
		    "CREATE TABLE km_emoney_trns (" +
	        "id INTEGER PRIMARY KEY," +
		    "transaction_date DATETIME," +
	        "income REAL," +
	        "expense REAL," +
	        "category_id INTEGER," +
	        "detail TEXT," +
		    "internal INTEGER," +
	        "user_id INTEGER," +
	        "source INTEGER," +
	        "money_id INTEGER)";
	private static final String TABLE_NAME = "km_emoney_trns";
	
    public KmEMoneyTrns(Context context) {
    	super(context);
    }
    public static void init(SQLiteDatabase db){
    	db.execSQL(CREATE_TABLE);

    }
    public EMoneyTransaction select(int id) throws ParseException {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(TABLE_NAME);
		
		String[] columns = { "transaction_date", "category_id", "detail", "income", "expense", "money_id" };
		String selection = "id = ?";
		String[] selectionArgs = {String.valueOf(id)};
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, null, null);
		
		if (cursor == null) {
			return null;
		}
		
		cursor.moveToFirst();
		
		EMoneyTransaction trn = new EMoneyTransaction();
    	int idx = 0;
		trn.setTransactionDate(cursor.getString(idx++));
    	trn.setCategoryId(cursor.getInt(idx++));
    	trn.setDetail(cursor.getString(idx++));
    	trn.setIncome(new BigDecimal(cursor.getString(idx++)));
    	trn.setExpense(new BigDecimal(cursor.getString(idx++)));
    	trn.setEmoneyId(cursor.getInt(idx++));
    	
		cursor.close();
		    	
    	return trn;
    }
    public void insert(EMoneyTransaction trn) {
        ContentValues values = new ContentValues();
        
        values.put("transaction_date", trn.getTransactionDateStr());
        values.put("income", trn.getIncome().toPlainString());
        values.put("expense", trn.getExpense().toPlainString());
        values.put("category_id", trn.getCategoryId());
        values.put("detail", trn.getDetail());
        values.put("internal", trn.getInternal());
        values.put("user_id", trn.getUserId());
        values.put("source", trn.getSource());
        values.put("money_id", trn.getEmoneyId());
        
        this.db.insert(TABLE_NAME, null, values);
    	
    }
    public void update(EMoneyTransaction trn) {
        ContentValues values = new ContentValues();
        
        values.put("transaction_date", trn.getTransactionDateStr());
        values.put("income", trn.getIncome().toPlainString());
        values.put("expense", trn.getExpense().toPlainString());
        values.put("category_id", trn.getCategoryId());
        values.put("detail", trn.getDetail());
        values.put("internal", trn.getInternal());
        values.put("user_id", trn.getUserId());
        values.put("source", trn.getSource());
        values.put("money_id", trn.getEmoneyId());

        this.db.update(TABLE_NAME, values, "id = " + trn.getId(), null);
    	
    }
    public void delete(int id) {
    	this.db.delete(TABLE_NAME, "id = " + id, null);
    }

}
