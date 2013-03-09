package net.kazhik.android.kmoney.bean;

import java.math.BigDecimal;

public class TransactionSummary {
	private String categoryName;
	private BigDecimal sum;
	public BigDecimal getSum() {
		return sum;
	}
	public void setSum(BigDecimal sum) {
		this.sum = sum;
	}
	public void setSum(String sum) {
		if (sum == null) {
			sum = "0";
		}
		this.sum = new BigDecimal(sum);
	}
	public String getCategoryName() {
		return categoryName;
	}
	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

}
