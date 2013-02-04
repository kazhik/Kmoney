package net.kazhik.android.kmoney;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.Constants.ContextMenuItem;
import net.kazhik.android.kmoney.bean.Item;

import android.support.v4.app.FragmentActivity;
import android.view.ContextMenu;
import android.view.Menu;
import android.view.View;
import android.view.ContextMenu.ContextMenuInfo;
import android.widget.AdapterView;
import android.widget.SimpleAdapter;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.AdapterView.OnItemClickListener;

public class MasterDataListActivity extends FragmentActivity implements OnItemClickListener {
	private SimpleAdapter listAdapter;
	private ArrayList<HashMap<String, String>> mapList = new ArrayList<HashMap<String, String>>();

	public SimpleAdapter getListAdapter() {
		return listAdapter;
	}

	public void setListAdapter(SimpleAdapter listAdapter) {
		this.listAdapter = listAdapter;
	}
	public void onCreateContextMenu(ContextMenu menu, View view,
			ContextMenuInfo menuInfo) {
		super.onCreateContextMenu(menu, view, menuInfo);

		AdapterContextMenuInfo info = (AdapterContextMenuInfo) menuInfo;
		
		HashMap<String, String> map = this.mapList.get(info.position);
		menu.setHeaderTitle(map.get("name"));
		menu.add(Menu.NONE, ContextMenuItem.DELETE.ordinal(), Menu.NONE, R.string.delete);
	}
	@Override
	public void onItemClick(AdapterView<?> arg0, View arg1, int arg2, long arg3) {
		
	}
	
	public int deleteItem(int position) {
		HashMap<String, String> removed = this.mapList.remove(position);
		this.listAdapter.notifyDataSetChanged();
		
		return Integer.parseInt(removed.get("id"));
	}
	
	public void setItemList(List<Item> itemList) {
		this.mapList.clear();
		Iterator<Item> it = itemList.iterator();
		while (it.hasNext()) {
			Item item = it.next();

			HashMap<String, String> map = new HashMap<String, String>();
			map.put("id", String.valueOf(item.getId()));
			map.put("name", item.getName());
			this.mapList.add(map);
		}
		this.listAdapter = new SimpleAdapter(this,
				this.mapList,
				android.R.layout.simple_list_item_1,
				new String[] { "name" },
				new int[] {	android.R.id.text1 }
				);
		
	}

}
