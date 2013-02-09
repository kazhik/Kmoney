package net.kazhik.android.kmoney;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.os.AsyncTask;
import android.preference.PreferenceManager;
import android.util.Log;
import android.widget.Toast;

public class ExportDatabaseTask extends AsyncTask<Void, Void, Boolean> {
	private ProgressDialog dialog = null;
	private Context context;
	private String dbPath;
	private SharedPreferences prefs;

	public ExportDatabaseTask(Context ctx, String dbPath) {
		this.context = ctx;
		this.dbPath = dbPath;
		this.dialog = new ProgressDialog(ctx);
		this.prefs = PreferenceManager.getDefaultSharedPreferences(ctx);
	}
	
	public Context getContext() {
		return context;
	}

	public void setContext(Context context) {
		this.context = context;
	}

	public String getDbPath() {
		return dbPath;
	}

	public void setDbPath(String dbPath) {
		this.dbPath = dbPath;
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
		this.dialog.setMessage(this.context.getResources().getString(
				R.string.export_in_progress));
		this.dialog.show();
	}

	// automatically done on worker thread (separate from UI thread)
	@Override
	protected Boolean doInBackground(Void... params) {
		
		Log.e("Kmoney", "Unknown mode");
		return false;

	}
	public String targetFileName(String srcFile) {
		int idxDot = srcFile.lastIndexOf('.');
		if (idxDot == -1) {
			return srcFile;
		}
		String file1 = srcFile.substring(0, idxDot);
		String file2 = srcFile.substring(idxDot + 1);

		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd_HHmmss",
				Locale.getDefault());
		String timeStamp = sdf.format(new Date());
		
		return String.format("%s_%s.%s", file1, timeStamp, file2);

	}
	// can use UI thread here
	protected void onPostExecute(final Boolean success) {
		if (this.dialog.isShowing()) {
			this.dialog.dismiss();
		}
		if (success) {
			Toast.makeText(this.context, R.string.export_done,
					Toast.LENGTH_SHORT).show();
		} else {
			Toast.makeText(this.context, R.string.export_failed,
					Toast.LENGTH_SHORT).show();
		}
	}

	void copyFile(File src, File dst) throws IOException {
		FileInputStream in = new FileInputStream(src);
		FileOutputStream out = new FileOutputStream(dst);

		byte[] buf = new byte[1024];
		int len;
		while ((len = in.read(buf)) > 0) {
			out.write(buf, 0, len);
		}
		in.close();
		out.close();
	}

}
