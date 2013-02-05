package net.kazhik.android.kmoney;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.Constants.ContextMenuItem;
import net.kazhik.android.kmoney.bean.Item;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.view.ContextMenu;
import android.view.ContextMenu.ContextMenuInfo;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.SimpleAdapter;
import android.widget.TextView;

public abstract class MasterDataListActivity extends FragmentActivity implements OnItemClickListener {
	private class AddButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
			showEditDialog("");

		}

	}
	private class CancelButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
			finish();

		}

	}
	private class ConfirmDeleteListener implements DialogInterface.OnClickListener {
		private int position;
		
		public ConfirmDeleteListener(int position) {
			this.position = position;
		}

		@Override
		public void onClick(DialogInterface dialog, int which) {
			if (which == DialogInterface.BUTTON_POSITIVE) {
				delete(this.position);
			}
			
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
			editOk(text);
		}
    }
	
	private int titleId;
	private SimpleAdapter listAdapter = null;
	private ArrayList<HashMap<String, String>> mapList = new ArrayList<HashMap<String, String>>();

	protected abstract void delete(int position);	
	protected abstract void editOk(String text1);
	

	public int getTitleId() {
		return titleId;
	}
	public void setTitleId(int titleId) {
		this.titleId = titleId;
	}
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.masterdata);

		TextView txtView = (TextView)findViewById(R.id.textTitle);
		txtView.setText(this.titleId);

		this.initAddButton();
		this.initCancelButton();
		
	}	
	public boolean onContextItemSelected(MenuItem item) {
		AdapterContextMenuInfo info = (AdapterContextMenuInfo) item.getMenuInfo();

		if (item.getItemId() == ContextMenuItem.DELETE.ordinal()) {
			this.showConfirmDeleteDialog(info.position);
		}
		return true;
	}	
	private void showConfirmDeleteDialog(int itemPos) {
		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		// Add the buttons
		builder.setPositiveButton(android.R.string.ok,
				new ConfirmDeleteListener(itemPos));
		builder.setNegativeButton(android.R.string.cancel,
				new ConfirmDeleteListener(itemPos));
		builder.setTitle(R.string.confirm_delete);
		AlertDialog dialog = builder.create();
		dialog.show();
		
	}		
	
	private void initAddButton() {
		Button btn = (Button) findViewById(R.id.buttonAdd);
		btn.setOnClickListener(new AddButtonClickListener());

	}	
	private void initCancelButton() {
		Button btn = (Button) findViewById(R.id.buttonCancel);
		btn.setOnClickListener(new CancelButtonClickListener());

	}	
	protected void initList(List<Item> itemList) {
		this.setItemList(itemList);
		
		ListView lv = (ListView) findViewById(R.id.listMasterData);
		lv.setAdapter(this.getListAdapter());
		lv.setOnItemClickListener(this);

		registerForContextMenu(lv);		
		
	}
	
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
	public void showEditDialog(String selectedStr) {
		LayoutInflater inflater = LayoutInflater.from(this);
		View dialogview = inflater.inflate(R.layout.masteredit1, null);

		final AlertDialog.Builder builder = new AlertDialog.Builder(
				this);
		builder.setTitle(this.titleId);
		builder.setView(dialogview);
		builder.setNegativeButton(android.R.string.cancel, null);
		builder.setPositiveButton(android.R.string.ok, new EditOkButtonListener(dialogview));
		
		EditText editText = (EditText)dialogview.findViewById(R.id.editTextMaster);
	    editText.setText(selectedStr);
	    
		builder.show();
		
	}	
	public int getItemId(int position) {
		HashMap<String, String> map = this.mapList.get(position);
		return Integer.parseInt(map.get("id"));
		
	}
	
	private void setItemList(List<Item> itemList) {
		this.resetItemList(itemList);
		this.listAdapter = new SimpleAdapter(this,
				this.mapList,
				android.R.layout.simple_list_item_1,
				new String[] { "name" },
				new int[] {	android.R.id.text1 }
				);
		
	}
	public void resetItemList(List<Item> itemList) {
		this.mapList.clear();
		Iterator<Item> it = itemList.iterator();
		while (it.hasNext()) {
			Item item = it.next();

			HashMap<String, String> map = new HashMap<String, String>();
			map.put("id", String.valueOf(item.getId()));
			map.put("name", item.getName());
			this.mapList.add(map);
		}
		if (this.listAdapter != null) {
			this.listAdapter.notifyDataSetChanged();
		}
	}

}
