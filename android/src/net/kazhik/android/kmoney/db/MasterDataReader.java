package net.kazhik.android.kmoney.db;

import java.util.List;

import net.kazhik.android.kmoney.bean.Category;
import net.kazhik.android.kmoney.bean.Item;
import android.content.Context;

public class MasterDataReader {
	public static List<Item> getBankList(Context context, int userId) {
		KmBankInfo bankInfo = new KmBankInfo(context);
		bankInfo.open(true);
		List<Item> itemList = bankInfo.getBankNameList(userId);
		bankInfo.close();

		return itemList;
		
	}
	public static List<Category> getCategoryList(Context context) {
		KmCategory dbCategory = new KmCategory(context);
		dbCategory.open(true);
		List<Category> categoryList = dbCategory.getCategoryList(0);
		dbCategory.close();
	
		return categoryList;
	}

	public static List<Item> getCreditCardList(Context context, int userId) {
		KmCreditCardInfo cardInfo = new KmCreditCardInfo(context);
		cardInfo.open(true);
		List<Item> itemList = cardInfo.getCreditCardNameList(userId);
		cardInfo.close();

		return itemList;
	}

	public static List<Item> getEMoneyList(Context context, int userId) {
		KmEMoneyInfo emoneyInfo = new KmEMoneyInfo(context);
		emoneyInfo.open(true);
		List<Item> itemList = emoneyInfo.getEMoneyNameList(userId);
		emoneyInfo.close();

		return itemList;
	}
	public static List<Item> getUserNameList(Context context) {
		KmUserInfo user = new KmUserInfo(context);
		user.open(true);
		List<Item> userList = user.getUserNameList();
		user.close();

		return userList;
	}


}
