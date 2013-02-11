package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Date;

import net.kazhik.android.kmoney.bean.CashTransaction;
import net.kazhik.android.kmoney.db.KmCashTrns;
import net.kazhik.android.kmoney.db.KmDatabase;
import android.database.SQLException;
import android.test.AndroidTestCase;
import android.test.RenamingDelegatingContext;
import android.util.Log;

public class KmCashTrnsTest extends AndroidTestCase {
	private static final String TEST_FILE_PREFIX = "test_";
    RenamingDelegatingContext context;
	
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
	public void testInsertUpdate() {
	    
	    KmCashTrns cash = new KmCashTrns(context);
	    cash.open(false);
	    
	    CashTransaction trn = new CashTransaction();
	    trn.setTransactionDate(new Date());
	    trn.setCategoryId(1);
	    trn.setDetail("cash detail");
	    trn.setIncome(new BigDecimal("0"));
	    trn.setExpense(new BigDecimal("452"));
	    trn.setInternal(7);
	    trn.setSource(8);
	    trn.setUserId(9);
	    
	    int id = cash.insert(trn);
	   
	    try {
			CashTransaction inserted = cash.select(id);
			
			assertEquals(trn.getTransactionDateStr(), inserted.getTransactionDateStr());
			assertEquals("cash detail", inserted.getDetail());
			assertEquals(1, inserted.getCategoryId());
			assertEquals(0, inserted.getIncome().compareTo(new BigDecimal("0")));
			assertEquals(0, inserted.getExpense().compareTo(new BigDecimal("452")));
			assertEquals(7, inserted.getInternal());
			assertEquals(8, inserted.getSource());
			assertEquals(9, inserted.getUserId());
			
			CashTransaction secondTrans = inserted;
			secondTrans.setId(id);
			secondTrans.setDetail("detail 2");
			secondTrans.setTransactionDate("2013-03-09");
			secondTrans.setCategoryId(2);
			
			cash.update(secondTrans);
			
			CashTransaction updated = cash.select(id);
			assertEquals(secondTrans.getTransactionDateStr(), updated.getTransactionDateStr());
			assertEquals("detail 2", updated.getDetail());
			assertEquals(2, updated.getCategoryId());
			assertEquals(0, updated.getIncome().compareTo(new BigDecimal("0")));
			assertEquals(0, updated.getExpense().compareTo(new BigDecimal("452")));
			assertEquals(7, updated.getInternal());
			assertEquals(8, updated.getSource());
			assertEquals(9, updated.getUserId());
			
		} catch (ParseException e) {
			fail(e.getMessage());
		}
	    
	    cash.close();
	}
}
