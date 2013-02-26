package net.kazhik.android.kmoney;

import net.kazhik.android.kmoney.db.KmDatabase;
import android.database.SQLException;
import android.test.AndroidTestCase;
import android.test.RenamingDelegatingContext;
import android.util.Log;


public class DatabaseTest extends AndroidTestCase {
	private static final String TEST_FILE_PREFIX = "test_";
    protected RenamingDelegatingContext context;
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
		this.context = new RenamingDelegatingContext(
	    		getContext(), TEST_FILE_PREFIX);
		try {
			KmDatabase db = new KmDatabase(this.context);
			db.open();
			db.close();
		} catch (SQLException e) {
			Log.e(Constants.APPNAME, e.getMessage(), e);
		}
	}
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		
		
	}

}
