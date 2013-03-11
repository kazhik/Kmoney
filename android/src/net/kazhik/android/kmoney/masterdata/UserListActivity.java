package net.kazhik.android.kmoney.masterdata;

import java.util.HashMap;
import java.util.List;

import net.kazhik.android.kmoney.R;
import net.kazhik.android.kmoney.bean.Item;
import net.kazhik.android.kmoney.db.KmUserInfo;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

public class UserListActivity extends MasterDataListActivity {
    private int updateId;
    KmUserInfo tbl;
    

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		this.setTitleId(R.string.user);
		
		super.onCreate(savedInstanceState);

		this.tbl = new KmUserInfo(this);
		tbl.open(false);
		this.loadList();
		
	}
	@Override
	protected void onDestroy() {
		this.tbl.close();
		super.onDestroy();
	}
	
	private void loadList() {
		List<Item> itemList = this.tbl.getUserNameList();
		this.initList(itemList);
	}
	private void reloadList() {
		List<Item> itemList = this.tbl.getUserNameList();
		this.resetItemList(itemList);
	}
	
	protected void editOk(String text1) {
		if (this.updateId > 0) {
			this.tbl.update(this.updateId, text1);
		} else {
			this.tbl.insert(text1);
		}
		this.reloadList();
	}
	
	protected void delete(int position) {
		
		int id = this.getItemId(position);
		this.tbl.delete(id);
		this.reloadList();
		
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
