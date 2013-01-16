package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.List;

import net.kazhik.android.kmoney.bean.BankInfo;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmBankInfo extends KmTable {
	private static final String CREATE_TABLE =
		    "CREATE TABLE km_bank_info (" +
	        "id INTEGER PRIMARY KEY," +
	        "name TEXT," +
	        "user_id INTEGER)";
	private static final String TABLE_NAME = "km_bank_info";

    public static void init(SQLiteDatabase db, String[] banks){
    	db.execSQL(CREATE_TABLE);

        ContentValues initialValues = new ContentValues();
        
        for (int i = 0; i < banks.length; i++) {
        	for (int j = 0; j < 2; j++) {
                initialValues.put("name", banks[i]);
                initialValues.put("user_id", j + 1);
                db.insert(TABLE_NAME, null, initialValues);
        	}
        }
    }
    
    public KmBankInfo(Context context) {
    	super(context);
    }
	public List<BankInfo> getBankList() {
		return this.getBankList(0);
	}
    
	public List<BankInfo> getBankList(int max) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(TABLE_NAME);

		String[] columns = { "id", "name", "user_id" };
		String selection = null;
		String[] selectionArgs = null;
		String sortOrder = null;
		String limit = (max == 0)? null: Integer.toString(max);
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, sortOrder, limit);
		
		List<BankInfo> bankList = new ArrayList<BankInfo>();
		
		if (cursor == null) {
			return bankList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			int idx = 0;
			BankInfo info = new BankInfo();
			info.setId(cursor.getInt(idx++));
			info.setName(cursor.getString(idx++));
			info.setUser_id(cursor.getInt(idx++));
			bankList.add(info);
			
			cursor.moveToNext();
		}
		cursor.close();
		
		return bankList;
	}
}
