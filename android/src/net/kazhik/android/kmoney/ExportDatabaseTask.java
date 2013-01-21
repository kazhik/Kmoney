package net.kazhik.android.kmoney;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.AsyncTask;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

public class ExportDatabaseTask extends AsyncTask<String, Void, Boolean> {
	private ProgressDialog dialog = null;
	private Context context;

	public ExportDatabaseTask(Context ctx) {
		this.context = ctx;
		this.dialog = new ProgressDialog(ctx);
	}

	// can use UI thread here
	protected void onPreExecute() {
		this.dialog.setMessage(this.context.getResources().getString(
				R.string.export_in_progress));
		this.dialog.show();
	}

	// automatically done on worker thread (separate from UI thread)
	protected Boolean doInBackground(final String... args) {

		File dbFile = new File(args[0]);

		File exportDir = new File(Environment.getExternalStorageDirectory(), "");
		if (!exportDir.exists()) {
			exportDir.mkdirs();
		}
		File file = new File(exportDir, dbFile.getName());

		try {
			file.createNewFile();
			this.copyFile(dbFile, file);
			return true;
		} catch (IOException e) {
			Log.e("kmoney", e.getMessage(), e);
			return false;
		}
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
