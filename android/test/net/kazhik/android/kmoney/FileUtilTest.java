package net.kazhik.android.kmoney;

import net.kazhik.android.kmoney.util.FileUtil;
import android.test.AndroidTestCase;

public class FileUtilTest extends AndroidTestCase {
	
	public void testSplitFilename() {
		String[] strArray = FileUtil.splitFileName("hello.txt"); 
		assertEquals("hello", strArray[0]);
		assertEquals("txt", strArray[1]);
		
	}

}
