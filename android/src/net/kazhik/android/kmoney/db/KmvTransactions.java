package net.kazhik.android.kmoney.db;

import java.util.ArrayList;
import java.util.List;

import net.kazhik.android.kmoney.R;
import net.kazhik.android.kmoney.TransactionType;
import net.kazhik.android.kmoney.bean.TransactionSummary;
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
			+ "A.transaction_date,"
			+ "A.category_id,"
			+ "B.name as category_name,"
			+ "A.detail,"
			+ "A.expense, "
			+ "A.type, "
			+ "A.id "
			+ "FROM ("
			+ "SELECT "
			+ "transaction_date,"
			+ "category_id,"
			+ "detail,"
			+ "income - expense AS expense, "
			+ "'" + TransactionView.EMONEY + "' AS type, "
			+ "id "
			+ "FROM " + KmEMoneyTrns.TABLE_NAME + " "
			+ "UNION "
			+ "SELECT "
			+ "transaction_date,"
			+ "category_id,"
			+ "detail,"
			+ "0 - expense AS expense, "
			+ "'" + TransactionView.CREDITCARD + "' AS type, "
			+ "id "
			+ "FROM " + KmCreditCardTrns.TABLE_NAME + " "
			+ "UNION "
			+ "SELECT "
			+ "transaction_date,"
			+ "category_id,"
			+ "detail,"
			+ "income - expense AS expense, "
			+ "'" + TransactionView.CASH + "' AS type, "
			+ "id "
			+ "FROM " + KmCashTrns.TABLE_NAME + " " 
			+ "UNION "
			+ "SELECT "
			+ "transaction_date,"
			+ "category_id,"
			+ "detail,"
			+ "income - expense AS expense, "
			+ "'" + TransactionView.BANK + "' AS type, "
			+ "id "
			+ "FROM " + KmBankTrns.TABLE_NAME + ") A "
			+ "INNER JOIN km_category B "
			+ "ON A.category_id = B.id";

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

	public List<String> getDetailHistory(int type, int max) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(VIEW_NAME);
		

		String[] columns = { "detail", "count(*) as cnt" };
		String selection = "type = ?";
		String[] selectionArgs = {TransactionType.getTypeStr(type)};
		String sortOrder = "cnt desc";
		String groupBy = "detail";
		String limit = (max == 0)? null: Integer.toString(max);
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, groupBy,
				null, sortOrder, limit);
		
    	List<String> detailList = new ArrayList<String>();
		
		if (cursor.getCount() == 0) {
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
	public TransactionSummary getTotal(int year, int month) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(VIEW_NAME);
		
		String[] columns = { "strftime('%Y/%m', transaction_date) as transaction_month",
				"sum(expense) as sum"};

		String selection =  "transaction_month = ?";
		String[] selectionArgs = {String.format("%04d/%02d", year, month)};
		
		String sortOrder = null;
		String groupBy = null;
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, groupBy,
				null, sortOrder, null);
		
		
		TransactionSummary info = new TransactionSummary();
		if (cursor.getCount() == 0) {
			return info;		
		}
		
		cursor.moveToFirst();

		info.setCategoryName(this.context.getString(R.string.total));
		info.setSum(cursor.getString(1));
		cursor.close();
		
		return info;		
		
	}
	
	public List<TransactionSummary> getSummary(int year, int month) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(VIEW_NAME);
		
		String[] columns = { "strftime('%Y/%m', transaction_date) as transaction_month",
				"category_name",
				"sum(expense) as sum"};

		String selection =  "transaction_month = ?";
		String[] selectionArgs = {String.format("%04d/%02d", year, month)};
		
		String sortOrder = null;
		String groupBy = "transaction_month, category_id";
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, groupBy,
				null, sortOrder, null);
		
		List<TransactionSummary> trnsList = new ArrayList<TransactionSummary>();
		
		if (cursor.getCount() == 0) {
			return trnsList;
		}
		
		cursor.moveToFirst();
		while (cursor.isAfterLast() == false) {
			TransactionSummary info = new TransactionSummary();
			int idx = 1;
			info.setCategoryName(cursor.getString(idx++));
			info.setSum(cursor.getString(idx++));
			trnsList.add(info);
			
			cursor.moveToNext();
		}
		cursor.close();
		
		return trnsList;		
		
	}
	public List<TransactionView> getList(int year, int month) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables(VIEW_NAME);
		
		String[] columns = { "transaction_date", "detail", "expense", "type", "id"};

		String selection =  "strftime('%Y%m', transaction_date) = ?";
		String[] selectionArgs = {String.format("%04d%02d", year, month)};
		
		String sortOrder = "transaction_date, id";
		String limit = null;
		
		Cursor cursor = qb.query(this.db, columns, selection, selectionArgs, null,
				null, sortOrder, limit);
		
		List<TransactionView> trnsList = new ArrayList<TransactionView>();
		
		if (cursor.getCount() == 0) {
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
