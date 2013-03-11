package net.kazhik.android.kmoney.masterdata;

import java.util.HashMap;
import java.util.List;

import net.kazhik.android.kmoney.R;
import net.kazhik.android.kmoney.bean.Item;
import net.kazhik.android.kmoney.db.KmEMoneyInfo;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

public class EMoneyListActivity extends MasterDataListActivity {
    private int updateId;
    private KmEMoneyInfo tbl;
    private int userId;
    
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		this.setTitleId(R.string.emoney);
		
		super.onCreate(savedInstanceState);

		// MonthlyActivityから渡されるidを取得
		Intent i = this.getIntent();
		if (i == null) {
			return;
		}
		Bundle b = i.getExtras();
		if (b == null) {
			return;
		}

		this.userId = b.getInt("userId");
		
		this.tbl = new KmEMoneyInfo(this);
		tbl.open(false);
		this.loadList(this.userId);
		
	}
	@Override
	protected void onDestroy() {
		this.tbl.close();
		super.onDestroy();
	}
	
	private void loadList(int userId) {
		List<Item> itemList = this.tbl.getEMoneyNameList(userId);
		
		this.initList(itemList);
		
	}
	private void reloadList(int userId) {
		List<Item> itemList = this.tbl.getEMoneyNameList(userId);
		this.resetItemList(itemList);
		
	}
	public void editOk(String text1) {
		if (this.updateId > 0) {
			this.tbl.update(this.updateId, text1);
		} else {
			this.tbl.insert(text1, this.userId);
		}
		this.reloadList(this.userId);
	}
	
	public void delete(int position) {
		
		int id = this.getItemId(position);
		this.tbl.delete(id);
		this.reloadList(this.userId);
		
	}
	@Override
	public void onItemClick(AdapterView<?> items, View view, int position,
			long id) {
		ListView listView = (ListView) items;
		@SuppressWarnings("unchecked")
		HashMap<String, String> map = (HashMap<String, String>) listView
				.getItemAtPosition(position);

		this.updateId = Integer.parseInt(map.get("id"));
		this.showEditDialog(map.get("name"));

	}


}
