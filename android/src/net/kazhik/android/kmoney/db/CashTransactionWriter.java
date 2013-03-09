package net.kazhik.android.kmoney.db;

import net.kazhik.android.kmoney.bean.CashTransaction;
import android.content.Context;

public class CashTransactionWriter implements TransactionWriter {
	private Context context;
	private CashTransaction tran = null;
	
	public CashTransactionWriter(Context context, CashTransaction tran) {
		this.context = context;
		this.tran = tran;
	}
	public CashTransactionWriter(Context context) {
		this.context = context;
	}

	@Override
	public int insert() {
		if (tran == null) {
			return -1;
		}
		KmCashTrns cashTrn = new KmCashTrns(this.context);
		cashTrn.open(false);
		int id = cashTrn.insert(this.tran);
		cashTrn.close();
		return id;
	}

	@Override
	public boolean update() {
		if (tran == null) {
			return false;
		}
		KmCashTrns cashTrn = new KmCashTrns(this.context);
		cashTrn.open(false);
		boolean updated = cashTrn.update(tran);
		cashTrn.close();
		return updated;
	}

	@Override
	public boolean delete(int id) {
		KmCashTrns trn = new KmCashTrns(this.context);
		trn.open(false);
		boolean deleted = trn.delete(id);
		trn.close();
		return deleted;
	}

}
