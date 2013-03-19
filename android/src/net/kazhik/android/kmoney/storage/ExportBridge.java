package net.kazhik.android.kmoney.storage;

import net.kazhik.android.kmoney.R;

public class ExportBridge implements ImportExportBridge {

	@Override
	public void onPreExecute(ImportExportTask task) {
		task.showDialog(R.string.export_in_progress);

	}

	@Override
	public Boolean doInBackground(ImportExportTask task, Void... params) {
		return task.execExport();
	}

	@Override
	public void onPostExecute(ImportExportTask task, Boolean result) {
		task.dismissDialog((result)? R.string.export_done: R.string.export_failed);

	}

}
