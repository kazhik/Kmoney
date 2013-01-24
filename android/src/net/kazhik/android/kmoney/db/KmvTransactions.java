package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.List;

import net.kazhik.android.kmoney.bean.TransactionView;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteQueryBuilder;

public class KmvTransactions extends KmTable {
	private static final String VIEW_NAME = "kmv_transactions";
	private static final String CREATE_VIEW =
			"CREATE VIEW " + VIEW_NAME + " AS "
			+ "SELECT "
			+ "transaction_date,"
			+ "detail,"
			+ "expense, "
			+ "type, "
			+ "id "
			+ "FROM ("
			+ "SELECT "
			+ "transaction_date,"
			+ "detail,"
			+ "income - expense AS expense, "
			+ "'" + TransactionView.EMONEY + "' AS type, "
			+ "id "
			+ "FROM " + KmEMoneyTrns.TABLE_NAME + " "
			+ "UNION "
			+ "SELECT "
			+ "transaction_date,"
			+ "detail,"
			+ "expense, "
			+ "'" + TransactionView.CREDITCARD + "' AS type, "
			+ "id "
			+ "FROM " + KmCreditCardTrns.TABLE_NAME + " "
			+ "UNION "
			+ "SELECT "
			+ "transaction_date,"
			+ "detail,"
			+ "income - expense AS expense, "
			+ "'" + TransactionView.CASH + "' AS type, "
			+ "id "
			+ "FROM " + KmCashTrns.TABLE_NAME + " " 
			+ "UNION "
			+ "SELECT "
			+ "transaction_date,"
			+ "detail,"
			+ "income - expense AS expense, "
			+ "'" + TransactionView.BANK + "' AS type, "
			+ "id "
			+ "FROM " + KmBankTrns.TABLE_NAME + ")";

	public KmvTransactions(Context context) {
		super(context);
	}

	public static void init(SQLiteDatabase db) {
		db.execSQL(CREATE_VIEW);

	}
	public static void upgrade(SQLiteDatabase db) {
		db.execSQL("DROP VIEW " + VIEW_NAME);
		db.execSQL(CREATE_VIEW);
	}


	public List<String> getDetailHistory(String type, int max) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(VIEW_NAME);
		

		String[] columns = { "detail", "count(*) as cnt" };
		String selection = "type = ?";
		String[] selectionArgs = {type};
		String sortOrder = "cnt desc";
		String groupBy = "detail";
		String limit = (max == 0)? null: Integer.toString(max);
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, groupBy,
				null, sortOrder, limit);
		
    	List<String> detailList = new ArrayList<String>();
		
		if (cursor == null) {
			return detailList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			detailList.add(cursor.getString(0));
			cursor.moveToNext();
		}
		cursor.close();
		
    	return detailList;
    }
	
	public List<TransactionView> getList(int year, int month) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(VIEW_NAME);
		
		String[] columns = { "transaction_date", "detail", "expense", "type", "id" };

		String selection =  "strftime('%Y%m', transaction_date) = ?";
		String[] selectionArgs = {String.format("%04d%02d", year, month)};
		
		String sortOrder = "transaction_date, id";
		String limit = null;
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, sortOrder, limit);
		
		List<TransactionView> trnsList = new ArrayList<TransactionView>();
		
		if (cursor == null) {
			return trnsList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			TransactionView info = new TransactionView();
			int idx = 0;
			info.setTransactionDate(cursor.getString(idx++));
			info.setDetail(cursor.getString(idx++));
			info.setExpense(cursor.getString(idx++));
			info.setType(cursor.getString(idx++));
			info.setId(cursor.getInt(idx++));
			trnsList.add(info);
			
			cursor.moveToNext();
		}
		cursor.close();
		
		return trnsList;		
	}

}
