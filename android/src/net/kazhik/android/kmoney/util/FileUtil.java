package net.kazhik.android.kmoney.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

public class FileUtil {
	public static void copyFile(File src, File dst) throws IOException {
		FileInputStream in = new FileInputStream(src);
		FileOutputStream out = new FileOutputStream(dst);

		byte[] buf = new byte[1024];
		int len;
		while ((len = in.read(buf)) > 0) {
			out.write(buf, 0, len);
		}
		in.close();
		out.close();
	}
	
	public static String[] splitFileName(String filename) {
		if (filename == null) {
			return null;
		}
		return filename.split("\\.(?=[^\\.]+$)");
	}

}
