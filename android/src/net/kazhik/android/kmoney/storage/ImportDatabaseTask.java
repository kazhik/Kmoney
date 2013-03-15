package net.kazhik.android.kmoney.storage;

import net.kazhik.android.kmoney.R;
import android.content.Context;

public class ImportDatabaseTask extends ImportExportTask {
	private String src;

	public ImportDatabaseTask(Context ctx, String src) {
		super(ctx);
		this.src = src;
	}
	protected void onPreExecute() {
		this.showDialog(R.string.import_in_progress);
	}
	protected void onPostExecute(final Boolean success) {
		this.dismissDialog((success)? R.string.import_done: R.string.import_failed);
	}
	protected String getSrc() {
		return this.src;
	}

}
