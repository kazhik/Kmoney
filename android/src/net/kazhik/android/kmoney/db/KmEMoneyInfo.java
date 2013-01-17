package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.List;

import net.kazhik.android.kmoney.bean.EMoneyInfo;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmEMoneyInfo extends KmTable {
	private static final String CREATE_TABLE =
		    "CREATE TABLE km_emoney_info (" +
	        "id INTEGER PRIMARY KEY," +
	        "name TEXT," +
	        "user_id INTEGER)";
	private static final String TABLE_NAME = "km_emoney_info";

    public static void init(SQLiteDatabase db, String[] emoneys){
    	db.execSQL(CREATE_TABLE);

        ContentValues initialValues = new ContentValues();
        
        for (int i = 0; i < emoneys.length; i++) {
        	for (int j = 0; j < 2; j++) {
                initialValues.put("name", emoneys[i]);
                initialValues.put("user_id", j + 1);
                db.insert(TABLE_NAME, null, initialValues);
        	}
        }    	
    }
	public static void upgrade(SQLiteDatabase db) {
		KmTable.upgrade(db, TABLE_NAME, CREATE_TABLE);
	}

    public KmEMoneyInfo(Context context) {
    	super(context);
    }
	public List<EMoneyInfo> getEMoneyList() {
		return this.getEMoneyList(0);
	}
	public List<EMoneyInfo> getEMoneyList(int max) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(TABLE_NAME);

		String[] columns = { "id", "name", "user_id" };
		String selection = null;
		String[] selectionArgs = null;
		String sortOrder = null;
		String limit = (max == 0)? null: Integer.toString(max);
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, sortOrder, limit);
		
		List<EMoneyInfo> emoneyList = new ArrayList<EMoneyInfo>();
		
		if (cursor == null) {
			return emoneyList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			EMoneyInfo info = new EMoneyInfo();
			int idx = 0;
			info.setId(cursor.getInt(idx++));
			info.setName(cursor.getString(idx++));
			info.setUser_id(cursor.getInt(idx++));
			emoneyList.add(info);
			
			cursor.moveToNext();
		}
		cursor.close();
		
		return emoneyList;
	}
}
