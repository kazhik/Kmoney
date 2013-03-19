package net.kazhik.android.kmoney.storage;

import net.kazhik.android.kmoney.R;

public class ImportBridge implements ImportExportBridge {
	private String srcFile;
	
	public ImportBridge(String srcFile) {
		this.srcFile = srcFile;
	}
	
	@Override
	public void onPreExecute(ImportExportTask task) {
		task.showDialog(R.string.import_in_progress);

	}

	@Override
	public Boolean doInBackground(ImportExportTask task, Void... params) {
		return task.execImport(this.srcFile);
	}

	@Override
	public void onPostExecute(ImportExportTask task, Boolean result) {
		task.dismissDialog((result)? R.string.import_done: R.string.import_failed);

	}

}
