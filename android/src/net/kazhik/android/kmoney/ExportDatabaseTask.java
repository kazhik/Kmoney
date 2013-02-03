package net.kazhik.android.kmoney;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import net.kazhik.android.kmoney.db.KmDatabase;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.AsyncTask;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

import com.dropbox.client2.DropboxAPI;
import com.dropbox.client2.DropboxAPI.Entry;
import com.dropbox.client2.android.AndroidAuthSession;
import com.dropbox.client2.exception.DropboxException;
import com.dropbox.client2.exception.DropboxUnlinkedException;

public class ExportDatabaseTask extends AsyncTask<Void, Void, Boolean> {
	public enum Mode {
		SDCARD,
		DROPBOX
	};
	private DropboxAPI<AndroidAuthSession> dDBApi;
	private ProgressDialog dialog = null;
	private Context context;
	private Mode mode;
	private String dbPath;

	public ExportDatabaseTask(Mode mode, DropboxAPI<AndroidAuthSession> dDBApi, Context ctx,
			String dbPath) {
		this.mode = mode;
		this.dDBApi = dDBApi;
		this.context = ctx;
		this.dbPath = dbPath;
		this.dialog = new ProgressDialog(ctx);
	}
	public ExportDatabaseTask(Mode mode, Context ctx, String dbPath) {
		this.mode = mode;
		this.context = ctx;
		this.dbPath = dbPath;
		this.dialog = new ProgressDialog(ctx);
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
		
		if (this.mode == Mode.SDCARD) {
			return this.sdcard(this.dbPath);
		} else if (this.mode == Mode.DROPBOX) {
			return this.dropbox(this.dbPath);
		}
		Log.e("Kmoney", "Unknown mode");
		return false;

	}
	private Boolean sdcard(final String filename) {
		File dbFile = new File(filename);

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
	private Boolean dropbox(final String filename) {
		// Uploading content.
		FileInputStream inputStream = null;
		try {
		    File file = new File(filename);
		    inputStream = new FileInputStream(file);
		    Entry newEntry = this.dDBApi.putFile(KmDatabase.DATABASE_NAME, inputStream,
		            file.length(), null, null);
		    Log.i("Kmoney", "The uploaded file's rev is: " + newEntry.rev);
		    return true;
		} catch (DropboxUnlinkedException e) {
		    // User has unlinked, ask them to link again here.
		    Log.e("Kmoney", "User has unlinked.");
		    return false;
		} catch (DropboxException e) {
		    Log.e("Kmoney", "Something went wrong while uploading.");
		    return false;
		} catch (FileNotFoundException e) {
		    Log.e("Kmoney", "File not found.");
		    return false;
		} finally {
		    if (inputStream != null) {
		        try {
		            inputStream.close();
		        } catch (IOException e) {}
		    }
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
