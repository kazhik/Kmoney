package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.Item;
import net.kazhik.android.kmoney.bean.UserInfo;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmUserInfo extends KmTable {
	public static final String TABLE_NAME = "km_user_info";
	private static final String CREATE_TABLE =
		    "CREATE TABLE "+ TABLE_NAME + "(" +
	        "id INTEGER PRIMARY KEY," +
	        "name TEXT)";

    public static void init(SQLiteDatabase db, String[] users){
    	db.execSQL(CREATE_TABLE);

        ContentValues initialValues = new ContentValues();
        
        for (int i = 0; i < users.length; i++) {
            initialValues.put("name", users[i]);
            db.insert(TABLE_NAME, null, initialValues);
        }
    }
	public static void upgrade(SQLiteDatabase db) {
		KmTable.upgrade(db, TABLE_NAME, CREATE_TABLE);
	}
    
    public KmUserInfo(Context context) {
    	super(context);
    }
    public void insert(String name) {
        ContentValues values = new ContentValues();
        
        values.put("name", name);
        
        this.db.insert(TABLE_NAME, null, values);
    	
    }
    public void update(int id, String name) {
        ContentValues values = new ContentValues();
        
        values.put("name", name);

        this.db.update(TABLE_NAME, values, "id = " + id, null);
    	
    }
    public void delete(int id) {
    	this.db.delete(TABLE_NAME, "id = " + id, null);
    	
    }
    
	public List<Item> getUserNameList() {
		List<Item> itemList = new ArrayList<Item>();
		Iterator<UserInfo> it = this.getUserList(0).iterator();
		while (it.hasNext()) {
			UserInfo info = it.next();
			itemList.add(new Item(info.getId(), info.getName()));
		}
		return itemList;
	}    
	public List<UserInfo> getUserList(int max) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(TABLE_NAME);

		String[] columns = { "id", "name" };
		String selection = null;
		String[] selectionArgs = null;
		String sortOrder = null;
		String limit = (max == 0)? null: Integer.toString(max);
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, sortOrder, limit);
		
		List<UserInfo> userList = new ArrayList<UserInfo>();
		
		if (cursor == null) {
			return userList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			int idx = 0;
			UserInfo info = new UserInfo();
			info.setId(cursor.getInt(idx++));
			info.setName(cursor.getString(idx++));
			userList.add(info);
			
			cursor.moveToNext();
		}
		cursor.close();
		
		return userList;
	}
}
