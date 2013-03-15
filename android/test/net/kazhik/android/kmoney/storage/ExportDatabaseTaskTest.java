package net.kazhik.android.kmoney.storage;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import android.content.Context;
import android.test.AndroidTestCase;

public class ExportDatabaseTaskTest extends AndroidTestCase {

	public void testTargetFileName() {
		fail("Not yet implemented");
	}

	public void testGetFileDate() {
		Context context = this.getContext();

		ExportDatabaseTask task = new ExportDatabaseTask(context);
		try {
			Date fileDate = ExportDatabaseTask.getFileDate("kmoneys_20130312_090908.sqlite");
			SimpleDateFormat sdf = task.getDateFormat();
			assertEquals(sdf.parse("20130312_090908"), fileDate);
		} catch (ParseException e) {
			fail(e.getMessage());
		}
	}

}
