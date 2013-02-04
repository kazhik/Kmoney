package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.bean.Category;
import net.kazhik.android.kmoney.bean.Item;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmCategory extends KmTable {
	public static final String TABLE_NAME = "km_category";
	private static final String CREATE_TABLE =
		    "CREATE TABLE " + TABLE_NAME + " (" +
	        "id INTEGER PRIMARY KEY," +
	        "name TEXT)";
    public KmCategory(Context context) {
    	super(context);
    }
    public static void init(SQLiteDatabase db, String[] categories){
    	db.execSQL(CREATE_TABLE);
    	
        ContentValues initialValues = new ContentValues();
        
        for (int i = 0; i < categories.length; i++) {
            initialValues.put("name", categories[i]);
            db.insert(TABLE_NAME, null, initialValues);
        }
    }
	public static void upgrade(SQLiteDatabase db) {
		KmTable.upgrade(db, TABLE_NAME, CREATE_TABLE);
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
    public List<Item> getNameList() {
		List<Item> itemList = new ArrayList<Item>();
		Iterator<Category> it = this.getCategoryList().iterator();
		while (it.hasNext()) {
			Category info = it.next();
			itemList.add(new Item(info.getId(), info.getName()));
		}
		return itemList;
	}  
	public List<Category> getCategoryList() {
    	return this.getCategoryList(0);
    }
    
    public List<Category> getCategoryList(int max) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();

		StringBuffer strBuff = new StringBuffer(TABLE_NAME + " A");
		strBuff.append(" left join kmv_transactions B");
		strBuff.append(" on (A.id = B.category_id)");
		qb.setTables(strBuff.toString());

		String[] columns = { "A.id", "A.name", "count(B.id) as cnt" };
		String selection = null;
		String[] selectionArgs = null;
		String groupBy = "A.id";
		String sortOrder = "cnt desc";
		String limit = (max == 0)? null: Integer.toString(max);
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, groupBy,
				null, sortOrder, limit);
		
		List<Category> categoryList = new ArrayList<Category>();
		
		if (cursor == null) {
			return categoryList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			Category info = new Category();
			int idx = 0;
			info.setId(cursor.getInt(idx++));
			info.setName(cursor.getString(idx++));
			categoryList.add(info);
			
			cursor.moveToNext();
		}
		cursor.close();
		
		return categoryList;
	}
}
