package net.kazhik.android.kmoney;

import java.text.ParseException;

import net.kazhik.android.kmoney.bean.Transaction;
import android.test.AndroidTestCase;

public class TransactionTest extends AndroidTestCase {
	
	void testTransactionDate() {
		Transaction trn = new Transaction();
		
		try {
			trn.setTransactionDate("2013-03-30");
			assertEquals("2013-03-30", trn.getTransactionDateStr());
		} catch (ParseException e) {
			fail(e.getMessage());
		}
	}

}
