package net.kazhik.android.kmoney.bean;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Transaction {
	private int id = 0;
	private Date transactionDate = null;
	private BigDecimal income = null;
	private BigDecimal expense = null;
	private int categoryId = 0;
	private String detail = null;
	private String imageUri = null;
	private int internal = 0;
	private int userId = 0;
	private int source = 0;
	
	public Transaction() {
		
	}
	public Transaction(Transaction o) {
		this.id = o.id;
		this.transactionDate = o.transactionDate;
		this.income = o.income;
		this.expense = o.expense;
		this.categoryId = o.categoryId;
		this.detail = o.detail;
		this.imageUri = o.imageUri;
		this.internal = o.internal;
		this.userId = o.userId;
		this.source = o.source;
	}
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
	public String getImageUri() {
		return imageUri;
	}
	public void setImageUri(String imageUri) {
		this.imageUri = imageUri;
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
