package net.kazhik.android.kmoney.db;

import java.math.BigDecimal;
import java.text.ParseException;

import net.kazhik.android.kmoney.bean.CreditCardTransaction;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmCreditCardTrns extends KmTable {
	public static final String TABLE_NAME = "km_creditcard_trns";
	private static final String CREATE_TABLE =
		    "CREATE TABLE " + TABLE_NAME + " (" +
	        "id INTEGER PRIMARY KEY," +
		    "transaction_date DATETIME," +
	        "expense REAL," +
	        "category_id INTEGER," +
	        "detail TEXT," +
			"image_uri TEXT," +
		    "internal INTEGER," +
	        "user_id INTEGER," +
	        "source INTEGER," +
	        "card_id INTEGER," +
	        "last_update_date DATETIME)";
	
    public KmCreditCardTrns(Context context) {
    	super(context);
    }
    public static void init(SQLiteDatabase db){
    	db.execSQL(CREATE_TABLE);

    }
	public static void upgrade(SQLiteDatabase db) {
		KmTable.upgrade(db, TABLE_NAME, CREATE_TABLE);
	}

    public CreditCardTransaction select(int id) throws ParseException {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(TABLE_NAME);
		
		String[] columns = { "transaction_date", "category_id", "detail", "image_uri",
				"expense", "card_id" };
		String selection = "id = ?";
		String[] selectionArgs = {String.valueOf(id)};
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, null, null);
		
		if (cursor == null) {
			return null;
		}
		
		cursor.moveToFirst();
		
		CreditCardTransaction trn = new CreditCardTransaction();
    	int idx = 0;
		trn.setTransactionDate(cursor.getString(idx++));
    	trn.setCategoryId(cursor.getInt(idx++));
    	trn.setDetail(cursor.getString(idx++));
		trn.setImageUri(cursor.getString(idx++));
    	trn.setExpense(new BigDecimal(cursor.getString(idx++)));
    	trn.setCardId(cursor.getInt(idx++));
    	
		cursor.close();
		    	
    	return trn;
    }
    public void insert(CreditCardTransaction trn) {
        ContentValues values = new ContentValues();
        
        values.put("transaction_date", trn.getTransactionDateStr());
        values.put("expense", trn.getExpense().toPlainString());
        values.put("category_id", trn.getCategoryId());
        values.put("detail", trn.getDetail());
		values.put("image_uri", trn.getImageUri());
        values.put("internal", trn.getInternal());
        values.put("user_id", trn.getUserId());
        values.put("source", trn.getSource());
        values.put("card_id", trn.getCardId());
        values.put("last_update_date", this.getLastUpdateDateString());
        
        this.db.insert(TABLE_NAME, null, values);
    	
    }
    public void update(CreditCardTransaction trn) {
        ContentValues values = new ContentValues();
        
        values.put("transaction_date", trn.getTransactionDateStr());
        values.put("expense", trn.getExpense().toPlainString());
        values.put("category_id", trn.getCategoryId());
        values.put("detail", trn.getDetail());
		values.put("image_uri", trn.getImageUri());
        values.put("internal", trn.getInternal());
        values.put("user_id", trn.getUserId());
        values.put("source", trn.getSource());
        values.put("card_id", trn.getCardId());
        values.put("last_update_date", this.getLastUpdateDateString());

        this.db.update(TABLE_NAME, values, "id = " + trn.getId(), null);
    	
    }
    public void delete(int id) {
    	this.db.delete(TABLE_NAME, "id = " + id, null);
    }

}
