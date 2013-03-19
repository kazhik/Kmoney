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
import android.os.AsyncTask;
import android.widget.Toast;

public abstract class AbstractImportExportTask extends
		AsyncTask<Void, Void, Boolean> implements ImportExportTask {
	private ProgressDialog dialog = null;
	private static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss",
			Locale.getDefault());
	private ImportExportBridge taskBridge;
	protected Context context;
	ImportExportTask.TaskListener listener = null;

	public AbstractImportExportTask(Context ctx, ImportExportBridge taskBridge,
			ImportExportTask.TaskListener listener) {
		this.context = ctx;
		this.dialog = new ProgressDialog(ctx);
		this.taskBridge = taskBridge;
		this.listener = listener;

	}

	@Override
	public void exec() {
		this.execute();
	}
	
	@Override
	protected void onPreExecute() {
		this.taskBridge.onPreExecute(this);
	}
	
	@Override
	protected Boolean doInBackground(Void... params) {
		return this.taskBridge.doInBackground(this, params);
	}

	@Override
	protected void onPostExecute(Boolean result) {
		this.taskBridge.onPostExecute(this, result);
		
		if (this.listener != null) {
			this.listener.onCompleted();
		}
	}

	@Override
	public void showDialog(int msgid) {
		this.dialog.setMessage(this.context.getResources().getString(msgid));
		this.dialog.show();
	}
	@Override
	public void dismissDialog(int msg) {
		if (this.dialog.isShowing()) {
			this.dialog.dismiss();
		}
		Toast.makeText(this.context, msg,
				Toast.LENGTH_SHORT).show();
	}

	
	public SimpleDateFormat getDateFormat() {
		return dateFormat;
	}
	protected File getDbFile() {
		return this.context.getDatabasePath(KmDatabase.DATABASE_NAME);
	}
	public String targetFileName(String srcFile) {
		String[] filename = FileUtil.splitFileName(srcFile);
		if (filename == null || filename.length < 2) {
			return null;
		}

		String timeStamp = this.getDateFormat().format(new Date());
		
		return String.format("%s_%s.%s", filename[0], timeStamp, filename[1]);

	}

	public Date getFileDate(String filepath) throws ParseException {
		String[] filename = FileUtil.splitFileName(KmDatabase.DATABASE_NAME);
		String findStr = filename[0] + "_";

		if (filepath.indexOf(findStr) == -1) {
			return null;
		}
		return dateFormat.parse(filepath.substring(findStr.length()));
	}
}