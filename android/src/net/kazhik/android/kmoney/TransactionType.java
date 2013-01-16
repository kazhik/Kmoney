package net.kazhik.android.kmoney;

import net.kazhik.android.kmoney.bean.TransactionView;

public class TransactionType {
	public static final int NONE = 0;
	public static final int CASH = 1;
	public static final int BANK = 2;
	public static final int CREDITCARD = 3;
	public static final int EMONEY = 4;

	public static int getType(String str) {
		int type = TransactionType.NONE;
		if (str.equals(TransactionView.CASH)) {
			type = TransactionType.CASH;
		} else if (str.equals(TransactionView.BANK)) {
			type = TransactionType.BANK;
		} else if (str.equals(TransactionView.CREDITCARD)) {
			type = TransactionType.CREDITCARD;
		} else if (str.equals(TransactionView.EMONEY)) {
			type = TransactionType.EMONEY;
		}
		return type;
	}
}
