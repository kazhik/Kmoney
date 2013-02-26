package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.bean.CreditCardInfo;
import net.kazhik.android.kmoney.bean.Item;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmCreditCardInfo extends KmTable {
	public static final String TABLE_NAME = "km_creditcard_info";
	private static final String CREATE_TABLE =
		    "CREATE TABLE " + TABLE_NAME + " (" +
	        "id INTEGER PRIMARY KEY," +
	        "name TEXT," +
	        "user_id INTEGER)";

    public KmCreditCardInfo(Context context) {
    	super(context);
    }
    public static void init(SQLiteDatabase db, String[] cards){
    	db.execSQL(CREATE_TABLE);
    	
        ContentValues initialValues = new ContentValues();
        
        for (int i = 0; i < cards.length; i++) {
        	for (int j = 0; j < 2; j++) {
                initialValues.put("name", cards[i]);
                initialValues.put("user_id", j + 1);
                db.insert(TABLE_NAME, null, initialValues);
        	}
        }
    }
	public static void upgrade(SQLiteDatabase db) {
		KmTable.upgrade(db, TABLE_NAME, CREATE_TABLE);
	}
    public int insert(String name, int userId) {
        ContentValues values = new ContentValues();
        
        values.put("name", name);
        values.put("user_id", userId);
        
        return (int)this.db.insert(TABLE_NAME, null, values);
    	
    }
    public boolean update(int id, String name) {
        ContentValues values = new ContentValues();
        
        values.put("name", name);

        int updated = this.db.update(TABLE_NAME, values, "id = " + id, null);
    	return (updated > 0);
    }
    public boolean delete(int id) {
    	int deleted = this.db.delete(TABLE_NAME, "id = " + id, null);
    	return (deleted > 0);
    }

	public List<Item> getCreditCardNameList(int userId) {
		List<Item> itemList = new ArrayList<Item>();
		Iterator<CreditCardInfo> it = this.getCreditCardList(0).iterator();
		while (it.hasNext()) {
			CreditCardInfo info = it.next();
			if (info.getUser_id() == userId) {
				itemList.add(new Item(info.getId(), info.getName()));
			}
		}
		return itemList;
	}    
	public List<CreditCardInfo> getCreditCardList() {
		return this.getCreditCardList(0);
	}
	public List<CreditCardInfo> getCreditCardList(int max) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(TABLE_NAME);

		String[] columns = { "id", "name", "user_id" };
		String selection = null;
		String[] selectionArgs = null;
		String sortOrder = null;
		String limit = (max == 0)? null: Integer.toString(max);
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, sortOrder, limit);
		
		List<CreditCardInfo> cardList = new ArrayList<CreditCardInfo>();
		
		if (cursor.getCount() == 0) {
			return cardList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			CreditCardInfo info = new CreditCardInfo();
			int idx = 0;
			info.setId(cursor.getInt(idx++));
			info.setName(cursor.getString(idx++));
			info.setUser_id(cursor.getInt(idx++));
			cardList.add(info);
			
			cursor.moveToNext();
		}
		cursor.close();
		
		return cardList;
	}
}
