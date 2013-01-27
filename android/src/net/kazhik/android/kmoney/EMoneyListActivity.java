package net.kazhik.android.kmoney;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import net.kazhik.android.kmoney.Constants.ContextMenuItem;
import net.kazhik.android.kmoney.db.KmCreditCardInfo;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
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

public class EMoneyListActivity extends FragmentActivity implements OnItemClickListener {
	private SimpleAdapter listAdapter;
	private ArrayList<HashMap<String, String>> mapList = new ArrayList<HashMap<String, String>>();
    private int updateId;
    private KmCreditCardInfo tbl;
    private int userId;
    
	private class AddButtonClickListener implements View.OnClickListener {

		@Override
		public void onClick(View v) {
			EMoneyListActivity.this.showEditDialog("");

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
				EMoneyListActivity.this.delete(this.position);
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
			EMoneyListActivity.this.editOk(text);
		}
    }
	
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.masterdata);
		
		this.initAddButton();
		this.initCancelButton();

		
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
		
		this.tbl = new KmCreditCardInfo(this);
		tbl.open(false);
		this.loadList(this.userId);
		
	}
	@Override
	protected void onDestroy() {
		this.tbl.close();
		super.onDestroy();
	}
	
	private void loadList(int userId) {
		List<Item> itemList = this.tbl.getCreditCardNameList(userId);
		
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
		
		ListView lv = (ListView) findViewById(R.id.listMasterData);
		lv.setAdapter(this.listAdapter);
		lv.setOnItemClickListener(this);

		registerForContextMenu(lv);		
		
	}
	private void editOk(String text1) {
		if (this.updateId > 0) {
			this.tbl.update(this.updateId, text1);
		} else {
			this.tbl.insert(text1, this.userId);
		}
	}
	
	private void delete(int position) {
		
		// 画面上から削除
		HashMap<String, String> removed = this.mapList.remove(position);
		this.listAdapter.notifyDataSetChanged();

		// DBから削除
		int id = Integer.parseInt(removed.get("id"));
		this.tbl.delete(id);
		
	}
	private void initAddButton() {
		Button btn = (Button) findViewById(R.id.buttonAdd);
		btn.setOnClickListener(new AddButtonClickListener());

	}	
	private void initCancelButton() {
		Button btn = (Button) findViewById(R.id.buttonCancel);
		btn.setOnClickListener(new CancelButtonClickListener());

	}	
	public void onCreateContextMenu(ContextMenu menu, View view,
			ContextMenuInfo menuInfo) {
		super.onCreateContextMenu(menu, view, menuInfo);

		AdapterContextMenuInfo info = (AdapterContextMenuInfo) menuInfo;
		
		HashMap<String, String> map = this.mapList.get(info.position);
		
		menu.setHeaderTitle(map.get("name"));
		menu.add(Menu.NONE, ContextMenuItem.DELETE.ordinal(), Menu.NONE, R.string.delete);
	}
	public boolean onContextItemSelected(MenuItem item) {
		AdapterContextMenuInfo info = (AdapterContextMenuInfo) item.getMenuInfo();

		if (item.getItemId() == ContextMenuItem.DELETE.ordinal()) {
			this.showConfirmDeleteDialog(info.position);
		}
		return true;
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
	
	private void showEditDialog(String selectedStr) {
		this.updateId = -1;
		LayoutInflater inflater = LayoutInflater.from(this);
		View dialogview = inflater.inflate(R.layout.masteredit1, null);

		final AlertDialog.Builder builder = new AlertDialog.Builder(
				this);
		builder.setTitle(R.string.creditcard);
		builder.setView(dialogview);
		builder.setNegativeButton(android.R.string.cancel, null);
		builder.setPositiveButton(android.R.string.ok, new EditOkButtonListener(dialogview));
		
		EditText editText = (EditText)dialogview.findViewById(R.id.editTextMaster);
	    editText.setText(selectedStr);
	    
		builder.show();
		
	}

}
