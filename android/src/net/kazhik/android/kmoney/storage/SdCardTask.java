package net.kazhik.android.kmoney.storage;

import java.io.File;
import java.io.IOException;

import net.kazhik.android.kmoney.db.KmDatabase;
import net.kazhik.android.kmoney.util.FileUtil;
import android.content.Context;
import android.util.Log;

public class SdCardTask extends AbstractImportExportTask {
	public SdCardTask(Context ctx, ImportExportBridge taskBridge,
			ImportExportTask.TaskListener listener) {
		super(ctx, taskBridge, listener);

	}

	@Override
	public Boolean execImport(String srcFile) {
		
		KmDatabase db = new KmDatabase(this.context);
		File src = new File(ExternalStorage.getDbDirectory(), srcFile);
		if (!src.exists()) {
			return false;
		}
		db.importDatabase(src);
		return true;
	}


	@Override
	public Boolean execExport() {
		File dbFile = this.getDbFile();

		File exportDir = new File(ExternalStorage.getDbDirectory(), "");
		if (!exportDir.exists()) {
			exportDir.mkdirs();
		}
		File exportFile = new File(exportDir, this.targetFileName(dbFile.getName()));

		try {
			exportFile.createNewFile();
			FileUtil.copyFile(dbFile, exportFile);
		} catch (IOException e) {
			Log.e("kmoney", e.getMessage(), e);
			return false;
		}
		return true;
	}
	@Override
	public String[] getFileList() {
		return ExternalStorage.getDbDirectory().list();
	}

	@Override
	public void start() {
		this.execute();
	}
	
}
