package net.kazhik.android.kmoney.db;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import net.kazhik.android.kmoney.StringUtils;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

public abstract class KmTable {

	private DbTblHelper dbHelper;
	protected SQLiteDatabase db;
	protected final Context context;

	public KmTable(Context context) {
		this.context = context;
	}

	public KmTable open(boolean readOnly) throws SQLException {
		this.dbHelper = new DbTblHelper(this.context);
		if (readOnly) {
			this.db = this.dbHelper.getReadableDatabase();
		} else {
			this.db = this.dbHelper.getWritableDatabase();
		}
		return this;
	}

	public void close() {
		this.dbHelper.close();
	}
	public static void upgrade(SQLiteDatabase db, String tableName, String createSql) {
		String sql = createSql.replace("CREATE TABLE", "CREATE TABLE IF NOT EXISTS");
		db.execSQL(sql);
		String tmpTable = "temp_" + tableName;
		List<String> colList = KmTable.getColumns(db, tableName);
		db.execSQL("ALTER TABLE " + tableName + " RENAME TO " + tmpTable);
		db.execSQL(createSql);
		
		colList.retainAll(KmTable.getColumns(db, tableName));
		
		String cols = StringUtils.join(colList, ",");
		sql = String.format("INSERT INTO %s (%s) SELECT %s FROM %s",
				tableName, cols, cols, tmpTable);
		db.execSQL(sql); 
		
		db.execSQL("DROP TABLE " + tmpTable);

	}	
	
	public static List<String> getColumns(SQLiteDatabase db, String tableName) {
	    List<String> ar = null;
	    Cursor c = null;
	    try {
	        c = db.rawQuery("select * from " + tableName + " limit 1", null);
	        if (c != null) {
	            ar = new ArrayList<String>(Arrays.asList(c.getColumnNames()));
	        }
	    } catch (Exception e) {
	        Log.v(tableName, e.getMessage(), e);
	        e.printStackTrace();
	    } finally {
	        if (c != null)
	            c.close();
	    }
	    return ar;
	}
	
	public String getLastUpdateDateString() {
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()); 
		return dateFormat.format(new Date());
		
	}
	
}
