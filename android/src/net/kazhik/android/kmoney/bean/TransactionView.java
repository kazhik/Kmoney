package net.kazhik.android.kmoney.bean;

import java.math.BigDecimal;

public class TransactionView {
	private int id;
	private String transactionDate;
	private BigDecimal expense;
	private String detail;
	private String type;
	
	public static final String CASH = "cash";
	public static final String BANK = "bank";
	public static final String CREDITCARD = "creditcard";
	public static final String EMONEY = "emoney";
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getTransactionDate() {
		return transactionDate;
	}
	public void setTransactionDate(String transactionDate) {
		this.transactionDate = transactionDate;
	}
	public BigDecimal getExpense() {
		return expense;
	}
	public void setExpense(BigDecimal expense) {
		this.expense = expense;
	}
	public void setExpense(String expense) {
		this.expense = new BigDecimal(expense);
	}
	public String getDetail() {
		return detail;
	}
	public void setDetail(String detail) {
		this.detail = detail;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}

}
