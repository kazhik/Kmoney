package net.kazhik.android.kmoney;

import java.io.File;
import java.io.IOException;

import android.content.Context;
import android.util.Log;

public class ExportSdCardTask extends ExportDatabaseTask {
	public ExportSdCardTask(Context ctx, String dbPath) {
		super(ctx, dbPath);
	}
	
	// automatically done on worker thread (separate from UI thread)
	@Override
	protected Boolean doInBackground(Void... params) {
		
		File dbFile = new File(this.getDbPath());

		File exportDir = new File(ExternalStorage.getDbDirectory(), "");
		if (!exportDir.exists()) {
			exportDir.mkdirs();
		}
		File exportFile = new File(exportDir, this.targetFileName(dbFile.getName()));

		try {
			exportFile.createNewFile();
			this.copyFile(dbFile, exportFile);
			return true;
		} catch (IOException e) {
			Log.e("kmoney", e.getMessage(), e);
			return false;
		}

	}

}
