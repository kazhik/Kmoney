package net.kazhik.android.kmoney.storage;

public interface ImportExportBridge {
	public void onPreExecute(ImportExportTask task);

	public Boolean doInBackground(ImportExportTask task, Void... params);

	public void onPostExecute(ImportExportTask task, Boolean result);

}
