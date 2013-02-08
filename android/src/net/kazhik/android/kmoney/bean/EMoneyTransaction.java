package net.kazhik.android.kmoney.bean;

public class EMoneyTransaction extends Transaction {
	private int emoneyId;

	public EMoneyTransaction(Transaction o) {
		super(o);
	}

	public EMoneyTransaction() {
	}

	public int getEmoneyId() {
		return emoneyId;
	}

	public void setEmoneyId(int emoneyId) {
		this.emoneyId = emoneyId;
	}
	

}
