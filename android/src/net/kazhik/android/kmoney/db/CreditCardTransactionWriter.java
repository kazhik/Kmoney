package net.kazhik.android.kmoney.db;

import net.kazhik.android.kmoney.bean.CreditCardTransaction;
import android.content.Context;

public class CreditCardTransactionWriter implements TransactionWriter {
	private Context context;
	private CreditCardTransaction tran = null;
	
	public CreditCardTransactionWriter(Context context, CreditCardTransaction tran) {
		this.context = context;
		this.tran = tran;
	}
	public CreditCardTransactionWriter(Context context) {
		this.context = context;
	}

	@Override
	public int insert() {
		if (tran == null) {
			return -1;
		}
		KmCreditCardTrns creditCardTrn = new KmCreditCardTrns(this.context);
		creditCardTrn.open(false);
		int id = creditCardTrn.insert(this.tran);
		creditCardTrn.close();
		return id;
	}

	@Override
	public boolean update() {
		if (tran == null) {
			return false;
		}
		KmCreditCardTrns creditCardTrn = new KmCreditCardTrns(this.context);
		creditCardTrn.open(false);
		boolean updated = creditCardTrn.update(tran);
		creditCardTrn.close();
		return updated;
	}

	@Override
	public boolean delete(int id) {
		KmCreditCardTrns trn = new KmCreditCardTrns(this.context);
		trn.open(false);
		boolean deleted = trn.delete(id);
		trn.close();
		return deleted;
	}

}
