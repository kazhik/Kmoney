package net.kazhik.android.kmoney.db;

import net.kazhik.android.kmoney.bean.BankTransaction;
import android.content.Context;

public class BankTransactionWriter implements TransactionWriter {
	private Context context;
	private BankTransaction tran = null;
	
	public BankTransactionWriter(Context context, BankTransaction tran) {
		this.context = context;
		this.tran = tran;
	}
	public BankTransactionWriter(Context context) {
		this.context = context;
	}

	@Override
	public int insert() {
		if (tran == null) {
			return -1;
		}
		KmBankTrns bankTrn = new KmBankTrns(this.context);
		bankTrn.open(false);
		int id = bankTrn.insert(this.tran);
		bankTrn.close();
		return id;
	}

	@Override
	public boolean update() {
		if (tran == null) {
			return false;
		}
		KmBankTrns bankTrn = new KmBankTrns(this.context);
		bankTrn.open(false);
		boolean updated = bankTrn.update(tran);
		bankTrn.close();
		return updated;
	}
	@Override
	public boolean delete(int id) {
		KmBankTrns trn = new KmBankTrns(this.context);
		trn.open(false);
		boolean deleted = trn.delete(id);
		trn.close();
		return deleted;
	}

}
