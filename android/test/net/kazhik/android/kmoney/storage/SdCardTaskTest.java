package net.kazhik.android.kmoney.storage;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import net.kazhik.android.kmoney.storage.ImportExportTask.TaskListener;

import android.content.Context;
import android.test.AndroidTestCase;

public class SdCardTaskTest extends AndroidTestCase implements TaskListener {

	public void testTargetFileName() {
		fail("Not yet implemented");
	}

	public void testGetFileDate() {
		
		Context context = this.getContext();
		SdCardTask task = new SdCardTask(context, new ExportBridge(), this);
		
		try {
			Date fileDate = task.getFileDate("kmoneys_20130312_090908.sqlite");
			SimpleDateFormat sdf = task.getDateFormat();
			assertEquals(sdf.parse("20130312_090908"), fileDate);
		} catch (ParseException e) {
			fail(e.getMessage());
		}
	}

	@Override
	public void onCompleted() {
		// TODO Auto-generated method stub
		
	}

}
