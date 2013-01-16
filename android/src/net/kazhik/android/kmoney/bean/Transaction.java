package net.kazhik.android.kmoney.bean;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public abstract class Transaction {
	private int id;
	private Date transactionDate;
	private BigDecimal income;
	private BigDecimal expense;
	private int categoryId;
	private String detail;
	private int internal;
	private int userId;
	private int source;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public Date getTransactionDate() {
		return transactionDate;
	}
	public String getTransactionDateStr() {
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()); 		
		return dateFormat.format(this.transactionDate);
	}
	public void setTransactionDate(String transactionDate) throws ParseException {
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
		this.transactionDate = dateFormat.parse(transactionDate);
	}
	public void setTransactionDate(Date transactionDate) {
		this.transactionDate = transactionDate;
	}
	public BigDecimal getIncome() {
		return income;
	}
	public void setIncome(BigDecimal income) {
		this.income = income;
	}
	public BigDecimal getExpense() {
		return expense;
	}
	public void setExpense(BigDecimal expense) {
		this.expense = expense;
	}
	public int getCategoryId() {
		return categoryId;
	}
	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}
	public String getDetail() {
		return detail;
	}
	public void setDetail(String detail) {
		this.detail = detail;
	}
	public int getInternal() {
		return internal;
	}
	public void setInternal(int internal) {
		this.internal = internal;
	}
	public int getUserId() {
		return userId;
	}
	public void setUserId(int userId) {
		this.userId = userId;
	}
	public int getSource() {
		return source;
	}
	public void setSource(int source) {
		this.source = source;
	}

}
