package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.List;

import net.kazhik.android.kmoney.bean.Category;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmCategory extends KmTable {
	private static final String CREATE_TABLE =
		    "CREATE TABLE km_category (" +
	        "id INTEGER PRIMARY KEY," +
	        "name TEXT)";
	private static final String TABLE_NAME = "km_category";
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

    public List<Category> getCategoryList(int max) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(TABLE_NAME);

		String[] columns = { "id", "name" };
		String selection = null;
		String[] selectionArgs = null;
		String sortOrder = null;
		String limit = (max == 0)? null: Integer.toString(max);
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
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
