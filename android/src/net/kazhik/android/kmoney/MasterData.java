package net.kazhik.android.kmoney;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.db.KmBankInfo;
import net.kazhik.android.kmoney.db.KmCategory;
import net.kazhik.android.kmoney.db.KmCreditCardInfo;
import net.kazhik.android.kmoney.db.KmEMoneyInfo;
import net.kazhik.android.kmoney.db.KmTable;
import net.kazhik.android.kmoney.db.KmUserInfo;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.ListView;

public class MasterData implements OnClickListener {
	public enum Type {
		CATEGORY,
		BANK,
		CREDITCARD,
		EMONEY,
		USER
	};
	private Type type;
	
	private int userId;
    private final Context context; 
    private KmTable dbTbl = null;
    private List<Item> itemList;
    private int updateId;
    
    private class AddButtonListener implements DialogInterface.OnClickListener {
		@Override
		public void onClick(DialogInterface dialog, int which) {
			MasterData.this.showEditDialog("");
		}
    }
    private class EditOkButtonListener implements OnClickListener {
    	private View dialogview;

    	public EditOkButtonListener(View dialogview) {
    		this.dialogview = dialogview;
    	}
		@Override
		public void onClick(DialogInterface dialog, int which) {
			EditText editText = (EditText)this.dialogview.findViewById(R.id.editTextMaster);
			String text = editText.getText().toString();
			MasterData.this.editOk(text);
		}
    }
    
	public MasterData(Context ctx, Type type, int userId) {
		this.context = ctx;
		this.type = type;
		this.userId = userId;
	}
	private void editOk(String text1) {
		if (this.type == Type.CATEGORY) {
			KmCategory category = (KmCategory)this.dbTbl;
			if (this.updateId > 0) {
				category.update(this.updateId, text1);
			} else {
				category.insert(text1);
			}
		} else if (this.type == Type.BANK) {
			KmBankInfo bankInfo = (KmBankInfo)this.dbTbl;
			if (this.updateId > 0) {
				bankInfo.update(this.updateId, text1);
			} else {
				bankInfo.insert(text1, this.userId);
			}
		} else if (this.type == Type.CREDITCARD) {
			KmCreditCardInfo cardInfo = (KmCreditCardInfo)this.dbTbl;
			if (this.updateId > 0) {
				cardInfo.update(this.updateId, text1);
			} else {
				cardInfo.insert(text1, this.userId);
			}
		} else if (this.type == Type.EMONEY) {
			KmEMoneyInfo emoneyInfo = (KmEMoneyInfo)this.dbTbl;
			if (this.updateId > 0) {
				emoneyInfo.update(this.updateId, text1);
			} else {
				emoneyInfo.insert(text1, this.userId);
			}
		} else if (this.type == Type.USER) {
			KmUserInfo userInfo = (KmUserInfo)this.dbTbl;
			if (this.updateId > 0) {
				userInfo.update(this.updateId, text1);
			} else {
				userInfo.insert(text1);
			}
		} else {
			return;
		}
		this.showDialog();
	}
	public void showDialog() {
		int titleResId = 0;
		if (this.type == Type.CATEGORY) {
			KmCategory category = null;
			if (this.dbTbl == null) {
				category = new KmCategory(this.context);
				category.open(false);
				this.dbTbl = category;
			} else {
				category = (KmCategory)this.dbTbl;
			}
			this.itemList = category.getCategoryNameList();
			titleResId = R.string.bank;
		} else if (this.type == Type.BANK) {
			KmBankInfo bankInfo = null;
			if (this.dbTbl == null) {
				bankInfo = new KmBankInfo(this.context);
				bankInfo.open(false);
				this.dbTbl = bankInfo;
			} else {
				bankInfo = (KmBankInfo)this.dbTbl;
			}
			this.itemList = bankInfo.getBankNameList(this.userId);
			titleResId = R.string.bank;
		} else if (this.type == Type.CREDITCARD) {
			KmCreditCardInfo cardInfo = null;
			if (this.dbTbl == null) {
				cardInfo = new KmCreditCardInfo(this.context);
				cardInfo.open(false);
				this.dbTbl = cardInfo;
			} else {
				cardInfo = (KmCreditCardInfo)this.dbTbl;
			}
			this.itemList = cardInfo.getCreditCardNameList(this.userId);
			titleResId = R.string.creditcard;
		} else if (this.type == Type.EMONEY) {
			KmEMoneyInfo emoneyInfo = null;
			if (this.dbTbl == null) {
				emoneyInfo = new KmEMoneyInfo(this.context);
				emoneyInfo.open(false);
				this.dbTbl = emoneyInfo;
			} else {
				emoneyInfo = (KmEMoneyInfo)this.dbTbl;
			}
			this.itemList = emoneyInfo.getEMoneyNameList(this.userId);
			titleResId = R.string.emoney;
		} else if (this.type == Type.USER) {
			KmUserInfo userInfo = null;
			if (this.dbTbl == null) {
				userInfo = new KmUserInfo(this.context);
				userInfo.open(false);
				this.dbTbl = userInfo;
			} else {
				userInfo = (KmUserInfo)this.dbTbl;
			}
			this.itemList = userInfo.getUserNameList();
			titleResId = R.string.user;
		} else {
			return;
		}
		// 読み込んだデータをHashMapに保持
		Iterator<Item> it = this.itemList.iterator();
		List<String> nameList = new ArrayList<String>();
		while (it.hasNext()) {
			nameList.add(it.next().getName());
		}

		CharSequence[] names = nameList.toArray(new CharSequence[nameList.size()]);

		AlertDialog.Builder builder = new AlertDialog.Builder(this.context);
		builder.setTitle(titleResId);
		builder.setItems(names, this);
		builder.setNegativeButton(android.R.string.cancel, null);
		builder.setNeutralButton(R.string.add, new AddButtonListener());
		AlertDialog alert = builder.create();
		alert.show();
		
	}
	
	// 変更項目クリック時
	
	@Override
	public void onClick(DialogInterface dialog, int position) {
		ListView lv = ((AlertDialog) dialog).getListView();
		String selectedStr = (String) lv.getAdapter().getItem(position);
		
		int id = -1;
		Iterator<Item> it = this.itemList.iterator();
		while (it.hasNext()) {
			Item item = it.next();
			if (item.getName().equals(selectedStr)) {
				id = item.getId();
				break;
			}
		}
		if (id < 0) {
			// ありえないケース
			return;
		}
		this.updateId = id;
		this.showEditDialog(selectedStr);
		
	}
	private void showEditDialog(String selectedStr) {
		this.updateId = -1;
		int titleResId;
		int layout;
		if (this.type == Type.CATEGORY) {
			titleResId = R.string.category;
			layout = R.layout.masteredit1;
		} else if (this.type == Type.BANK) {
			titleResId = R.string.bank;
			layout = R.layout.masteredit1;
		} else if (this.type == Type.CREDITCARD) {
			titleResId = R.string.creditcard;
			layout = R.layout.masteredit1;
		} else if (this.type == Type.EMONEY) {
			titleResId = R.string.emoney;
			layout = R.layout.masteredit1;
		} else if (this.type == Type.USER) {
			titleResId = R.string.user;
			layout = R.layout.masteredit1;
		} else {
			// ありえないケース
			return;
		}
		LayoutInflater inflater = LayoutInflater.from(this.context);
		View dialogview = inflater.inflate(layout, null);

		final AlertDialog.Builder builder = new AlertDialog.Builder(
				this.context);
		builder.setTitle(titleResId);
		builder.setView(dialogview);
		builder.setNegativeButton(android.R.string.cancel, null);
		builder.setPositiveButton(android.R.string.ok, new EditOkButtonListener(dialogview));
		
		EditText editText = (EditText)dialogview.findViewById(R.id.editTextMaster);
	    editText.setText(selectedStr);
	    
		builder.show();

		
	}

}
