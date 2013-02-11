package net.kazhik.android.kmoney;

import net.kazhik.android.kmoney.db.KmDatabase;
import android.content.Context;
import android.test.AndroidTestCase;

public class ExportDropboxTaskTest extends AndroidTestCase {
	public void testAuthentication() {
		Context context = this.getContext();
		String dbPath = context.getDatabasePath(KmDatabase.DATABASE_NAME)
				.toString();
		ExportDropboxTask exportTask = new ExportDropboxTask(context, dbPath);

		exportTask.start();
	}

}
