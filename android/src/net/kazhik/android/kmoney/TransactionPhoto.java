package net.kazhik.android.kmoney;

import java.io.File;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;

public class TransactionPhoto {
	private Context context;
	private Uri imageFileUri = null;
	
	public TransactionPhoto(Context context) {
		this.context = context;
	}
	public void delete() {
		if (this.imageFileUri == null) {
			return;
		}
		File file = new File(this.imageFileUri.getPath());
		file.delete();
		this.imageFileUri = null;
	}
	public String getPath() {
		if (this.imageFileUri != null) {
			return this.imageFileUri.getPath();
		}
		return "";
	}
	public Uri getUri() {
		return this.imageFileUri;
	}
	public void setUri(Uri imageFileUri) {
		this.imageFileUri = imageFileUri;
	}
	public void show() {
		class DeletePhotoButtonListener implements OnClickListener {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				TransactionPhoto.this.delete();
				
			}
		}
		
		LayoutInflater inflater = LayoutInflater.from(this.context);
		View dialogview = inflater.inflate(R.layout.photo, null);

		final AlertDialog.Builder builder = new AlertDialog.Builder(this.context);
		builder.setView(dialogview);
		builder.setNegativeButton(android.R.string.cancel, null);
		builder.setPositiveButton(R.string.delete,
				new DeletePhotoButtonListener());

		ImageView photoView = (ImageView) dialogview.findViewById(R.id.photo);
		photoView.setImageURI(this.imageFileUri);

		builder.show();

	}

}
