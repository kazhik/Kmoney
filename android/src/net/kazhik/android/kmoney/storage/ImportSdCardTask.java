package net.kazhik.android.kmoney.storage;

import java.io.File;
import java.io.IOException;

import net.kazhik.android.kmoney.util.FileUtil;
import android.content.Context;
import android.util.Log;

public class ImportSdCardTask extends ImportDatabaseTask {
	public ImportSdCardTask(Context ctx, String src) {
		super(ctx, src);
	}
	
	// automatically done on worker thread (separate from UI thread)
	@Override
	protected Boolean doInBackground(Void... params) {

		try {
			FileUtil.copyFile(new File(this.getSrc()), this.getDbFile());
			return true;
		} catch (IOException e) {
			Log.e("kmoney", e.getMessage(), e);
			return false;
		}

	}
	
	public static File[] getFileList() {
		return ExternalStorage.getDbDirectory().listFiles();
		
	}

}
