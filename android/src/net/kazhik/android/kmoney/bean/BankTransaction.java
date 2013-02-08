package net.kazhik.android.kmoney.bean;

public class BankTransaction extends Transaction {
	private int bankId;

	public BankTransaction() {
	}
	public BankTransaction(Transaction o) {
		super(o);
		
	}


	public int getBankId() {
		return bankId;
	}

	public void setBankId(int bankId) {
		this.bankId = bankId;
	}
	
	

}
