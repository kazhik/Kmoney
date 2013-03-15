package net.kazhik.android.kmoney;

import net.kazhik.android.kmoney.storage.ExportDropboxTask;
import android.content.Context;
import android.test.AndroidTestCase;

public class ExportDropboxTaskTest extends AndroidTestCase {
	public void testAuthentication() {
		Context context = this.getContext();
		ExportDropboxTask exportTask = new ExportDropboxTask(context);

		exportTask.start();
	}

}
