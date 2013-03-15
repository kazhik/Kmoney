package net.kazhik.android.kmoney.storage;

import java.io.File;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import net.kazhik.android.kmoney.db.KmDatabase;
import net.kazhik.android.kmoney.util.FileUtil;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.os.AsyncTask;
import android.preference.PreferenceManager;
import android.util.Log;
import android.widget.Toast;

public class ImportExportTask extends AsyncTask<Void, Void, Boolean> {
	private ProgressDialog dialog = null;
	private Context context;
	private SharedPreferences prefs;
	private static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss",
			Locale.getDefault());

	public ImportExportTask(Context ctx) {
		this.context = ctx;
		this.dialog = new ProgressDialog(ctx);
		this.prefs = PreferenceManager.getDefaultSharedPreferences(ctx);
	}
	
	public SimpleDateFormat getDateFormat() {
		return dateFormat;
	}
	
	public Context getContext() {
		return context;
	}

	public void setContext(Context context) {
		this.context = context;
	}

	public File getDbFile() {
		return this.context.getDatabasePath(KmDatabase.DATABASE_NAME);
	}

	public SharedPreferences getPrefs() {
		return prefs;
	}

	public void setPrefs(SharedPreferences prefs) {
		this.prefs = prefs;
	}
	
	public String getPref(String key) {
		return this.prefs.getString(key, null);
		
	}
	public void storePref(String key, String value) {
		Editor editor = this.prefs.edit();
		editor.putString(key, value);
		editor.commit();
	}

	public void start() {
		this.execute();
	}

	// can use UI thread here
	protected void onPreExecute() {
	}
	protected void showDialog(int msgid) {
		this.dialog.setMessage(this.context.getResources().getString(msgid));
		this.dialog.show();
	}

	// automatically done on worker thread (separate from UI thread)
	@Override
	protected Boolean doInBackground(Void... params) {
		
		Log.e("Kmoney", "Unknown mode");
		return false;

	}
	// can use UI thread here
	protected void onPostExecute(final Boolean success) {
	}
	protected void dismissDialog(int msg) {
		if (this.dialog.isShowing()) {
			this.dialog.dismiss();
		}
		Toast.makeText(this.context, msg,
				Toast.LENGTH_SHORT).show();
	}
	
	public static Date getFileDate(String filepath) throws ParseException {
		String[] filename = FileUtil.splitFileName(KmDatabase.DATABASE_NAME);
		String findStr = filename[0] + "_";
		
		if (filepath.indexOf(findStr) == -1) {
			return null;
		}
		return dateFormat.parse(filepath.substring(findStr.length()));
	}


}
