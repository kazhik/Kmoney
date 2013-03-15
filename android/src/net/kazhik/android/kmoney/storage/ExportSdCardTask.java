package net.kazhik.android.kmoney.storage;

import java.io.File;
import java.io.IOException;

import net.kazhik.android.kmoney.util.FileUtil;
import android.content.Context;
import android.util.Log;

public class ExportSdCardTask extends ExportDatabaseTask {
	public ExportSdCardTask(Context ctx) {
		super(ctx);
	}
	
	// automatically done on worker thread (separate from UI thread)
	@Override
	protected Boolean doInBackground(Void... params) {
		
		File dbFile = this.getDbFile();

		File exportDir = new File(ExternalStorage.getDbDirectory(), "");
		if (!exportDir.exists()) {
			exportDir.mkdirs();
		}
		File exportFile = new File(exportDir, this.targetFileName(dbFile.getName()));

		try {
			exportFile.createNewFile();
			FileUtil.copyFile(dbFile, exportFile);
			return true;
		} catch (IOException e) {
			Log.e("kmoney", e.getMessage(), e);
			return false;
		}

	}


}
