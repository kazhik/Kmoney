package net.kazhik.android.kmoney;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Date;

import net.kazhik.android.kmoney.bean.CreditCardTransaction;
import net.kazhik.android.kmoney.db.KmCreditCardTrns;

public class KmCreditCardTrnsTest extends DatabaseTest {
	public void testInsertUpdate() {
	    
		KmCreditCardTrns ccard = new KmCreditCardTrns(context);
	    ccard.open(false);
	    
	    CreditCardTransaction trn = new CreditCardTransaction();
	    trn.setTransactionDate(new Date());
	    trn.setCategoryId(2);
	    trn.setDetail("creditcard detail");
	    trn.setExpense(new BigDecimal("452"));
	    trn.setCardId(6);
	    trn.setInternal(7);
	    trn.setSource(8);
	    trn.setUserId(9);
	    
	    int id = ccard.insert(trn);
	   
	    try {
	    	CreditCardTransaction inserted = ccard.select(id);
			
			assertEquals(trn.getTransactionDateStr(), inserted.getTransactionDateStr());
			assertEquals("creditcard detail", inserted.getDetail());
			assertEquals(2, inserted.getCategoryId());
			assertEquals(0, inserted.getExpense().compareTo(new BigDecimal("452")));
			assertEquals(7, inserted.getInternal());
			assertEquals(8, inserted.getSource());
			assertEquals(9, inserted.getUserId());
			assertEquals(6, inserted.getCardId());
			
			CreditCardTransaction secondTrans = inserted;
			secondTrans.setId(id);
			secondTrans.setDetail("detail 2");
			secondTrans.setTransactionDate("2013-03-09");
			secondTrans.setCategoryId(4);
			
			ccard.update(secondTrans);
			
			CreditCardTransaction updated = ccard.select(id);
			assertEquals(secondTrans.getTransactionDateStr(), updated.getTransactionDateStr());
			assertEquals("detail 2", updated.getDetail());
			assertEquals(4, updated.getCategoryId());
			assertEquals(0, updated.getExpense().compareTo(new BigDecimal("452")));
			assertEquals(7, updated.getInternal());
			assertEquals(8, updated.getSource());
			assertEquals(9, updated.getUserId());
			
			ccard.delete(id);
			
			assertEquals(null, ccard.select(id));
		} catch (ParseException e) {
			fail(e.getMessage());
		}
	    
	    ccard.close();
	}

}
