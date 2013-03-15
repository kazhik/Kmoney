package net.kazhik.android.kmoney.storage;

import java.util.Date;

import net.kazhik.android.kmoney.R;
import net.kazhik.android.kmoney.util.FileUtil;
import android.content.Context;

public class ExportDatabaseTask extends ImportExportTask {

	public ExportDatabaseTask(Context ctx) {
		super(ctx);
	}
	protected void onPreExecute() {
		this.showDialog(R.string.export_in_progress);
	}
	protected void onPostExecute(final Boolean success) {
		this.dismissDialog((success)? R.string.export_done: R.string.export_failed);
	}
	public String targetFileName(String srcFile) {
		String[] filename = FileUtil.splitFileName(srcFile);
		if (filename == null || filename.length < 2) {
			return null;
		}

		String timeStamp = this.getDateFormat().format(new Date());
		
		return String.format("%s_%s.%s", filename[0], timeStamp, filename[1]);

	}

}
