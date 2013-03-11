package net.kazhik.android.kmoney.storage;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import net.kazhik.android.kmoney.Constants;

import android.net.Uri;
import android.os.Environment;
import android.util.Log;

public class ExternalStorage {
	private static File getDirectory(String subDir) {
		if (!Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
			return null;
		}

		File storageDir = new File(Environment.getExternalStorageDirectory(),
				Constants.APPNAME + File.separator + subDir);

		if (!storageDir.exists()) {
			if (!storageDir.mkdirs()) {
				Log.d("Kmoney", "failed to create directory");
				return null;
			}
		}
		return storageDir;
		
	}
	public static File getDbDirectory() {
		return getDirectory("Database");
	}
	public static File getPhotoDirectory() {
		return getDirectory("Photo");
		
	}
	private static File getImageFile() {
		File storageDir = getPhotoDirectory();
		if (storageDir == null) {
			return null;
		}

		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd_HHmmss",
				Locale.getDefault());
		String timeStamp = sdf.format(new Date());
		File mediaFile = new File(storageDir.getPath() + File.separator
				+ "IMG_" + timeStamp + ".jpg");

		return mediaFile;
	}
	public static Uri getImageFileUri() {
		return Uri.fromFile(getImageFile());
	}
	
}
