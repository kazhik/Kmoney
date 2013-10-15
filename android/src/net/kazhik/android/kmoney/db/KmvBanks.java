package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.List;

import net.kazhik.android.kmoney.bean.Item;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmvBanks extends KmTable {
	private static final String VIEW_NAME = "kmv_banks";
	private static final String CREATE_VIEW =
			"CREATE VIEW " + VIEW_NAME + " AS "
			+ "SELECT "
			+ "A.id,"
			+ "A.name,"
			+ "A.user_id,"
			+ "count(*) AS trns "
			+ "FROM " + KmBankInfo.TABLE_NAME + " A "
			+ "LEFT JOIN " + KmBankTrns.TABLE_NAME + " B "
			+ "ON A.id = B.bank_id and A.user_id = B.user_id "
			+ "GROUP BY A.id";

	public KmvBanks(Context context) {
    	super(context);
	}

	public static void init(SQLiteDatabase db) {
		db.execSQL(CREATE_VIEW);

	}
	public static void upgrade(SQLiteDatabase db) {
		db.execSQL("DROP VIEW IF EXISTS " + VIEW_NAME);
		db.execSQL(CREATE_VIEW);
	}

	public List<Item> getBankNameList(int userId) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(VIEW_NAME);
		
		String[] columns = { "id", "name"};
		
		String selection =  "user_id = ?";
		String[] selectionArgs = {String.valueOf(userId)};
		
		String sortOrder = "trns desc";
		String limit = null;
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, sortOrder, limit);
		
		List<Item> itemList = new ArrayList<Item>();
		
		if (cursor.getCount() == 0) {
			return itemList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			Item item = new Item(cursor.getInt(0), cursor.getString(1));
			itemList.add(item);
			
			cursor.moveToNext();
		}
		cursor.close();
		
		return itemList;
	}


}
