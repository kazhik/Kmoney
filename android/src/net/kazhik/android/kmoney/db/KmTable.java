package net.kazhik.android.kmoney.db;

import android.content.Context;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;

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

}
