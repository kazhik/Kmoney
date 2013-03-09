package net.kazhik.android.kmoney.db;

import net.kazhik.android.kmoney.bean.EMoneyTransaction;
import android.content.Context;

public class EMoneyTransactionWriter implements TransactionWriter {
	private Context context;
	private EMoneyTransaction tran = null;
	
	public EMoneyTransactionWriter(Context context, EMoneyTransaction tran) {
		this.context = context;
		this.tran = tran;
	}
	public EMoneyTransactionWriter(Context context) {
		this.context = context;
	}

	@Override
	public int insert() {
		if (tran == null) {
			return -1;
		}
		KmEMoneyTrns emoneyTrn = new KmEMoneyTrns(this.context);
		emoneyTrn.open(false);
		int id = emoneyTrn.insert(this.tran);
		emoneyTrn.close();
		return id;
	}

	@Override
	public boolean update() {
		if (tran == null) {
			return false;
		}
		KmEMoneyTrns emoneyTrn = new KmEMoneyTrns(this.context);
		emoneyTrn.open(false);
		boolean updated = emoneyTrn.update(tran);
		emoneyTrn.close();
		return updated;
	}
	@Override
	public boolean delete(int id) {
		KmEMoneyTrns trn = new KmEMoneyTrns(this.context);
		trn.open(false);
		boolean deleted = trn.delete(id);
		trn.close();
		return deleted;
	}
}
