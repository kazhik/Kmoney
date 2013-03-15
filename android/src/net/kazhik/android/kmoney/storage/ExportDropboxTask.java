package net.kazhik.android.kmoney.storage;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

import net.kazhik.android.kmoney.db.KmDatabase;
import android.content.Context;
import android.util.Log;

import com.dropbox.client2.DropboxAPI;
import com.dropbox.client2.DropboxAPI.Entry;
import com.dropbox.client2.android.AndroidAuthSession;
import com.dropbox.client2.exception.DropboxException;
import com.dropbox.client2.exception.DropboxUnlinkedException;
import com.dropbox.client2.session.AccessTokenPair;
import com.dropbox.client2.session.AppKeyPair;
import com.dropbox.client2.session.Session.AccessType;

public class ExportDropboxTask extends ExportDatabaseTask {
	private DropboxAPI<AndroidAuthSession> dbApi = null;

	public ExportDropboxTask(Context ctx) {
		super(ctx);
	}
	
	private void createInstance() {
		final String APP_KEY = "kuyk8nn6g6osz3s";
		final String APP_SECRET = "58pm6zl92rcg5i9";
		final AccessType ACCESS_TYPE = AccessType.APP_FOLDER;

		AppKeyPair appKeyPair = new AppKeyPair(APP_KEY, APP_SECRET);
		AndroidAuthSession session;

		String[] stored = getDropboxKey();
		if (stored != null) {
			AccessTokenPair accessToken = new AccessTokenPair(stored[0],
					stored[1]);
			session = new AndroidAuthSession(appKeyPair, ACCESS_TYPE,
					accessToken);
		} else {
			session = new AndroidAuthSession(appKeyPair, ACCESS_TYPE);
		}

		this.dbApi = new DropboxAPI<AndroidAuthSession>(session);
		
	}
	public void start() {
		this.createInstance();

		if (!this.dbApi.getSession().isLinked()) {
			this.dbApi.getSession().startAuthentication(this.getContext());
			return;
		}
			
		this.execute();
	}
	public void finishAuthentication() {
		if (this.dbApi != null && this.dbApi.getSession().authenticationSuccessful()) {
			try {
				// MANDATORY call to complete auth.
				// Sets the access token on the session
				this.dbApi.getSession().finishAuthentication();

				AccessTokenPair tokens = this.dbApi.getSession()
						.getAccessTokenPair();

				// Provide your own storeKeys to persist the access token pair
				// A typical way to store tokens is using SharedPreferences
				storeDropboxKey(tokens.key, tokens.secret);
			} catch (IllegalStateException e) {
				Log.i("Kmoney", "Error authenticating", e);
			}
		}
		
	}
	private String[] getDropboxKey() {
		String key = this.getPref("dropbox_key");
		String secret = this.getPref("dropbox_secret");
		if (key != null && secret != null) {
			String[] ret = new String[2];
			ret[0] = key;
			ret[1] = secret;
			return ret;
		} else {
			return null;
		}
	}
	private void storeDropboxKey(String key, String secret) {
		this.storePref("dropbox_key", key);
		this.storePref("dropbox_secret", secret);
	}

	// automatically done on worker thread (separate from UI thread)
	@Override
	protected Boolean doInBackground(Void... params) {
		
		// Uploading content.
		FileInputStream inputStream = null;
		try {
		    File file = this.getDbFile();
		    inputStream = new FileInputStream(file);
		    Entry newEntry = this.dbApi.putFile(KmDatabase.DATABASE_NAME, inputStream,
		            file.length(), null, null);
		    this.dbApi.move(newEntry.path, this.targetFileName(file.getName()));
		    Log.i("Kmoney", "The uploaded file's rev is: " + newEntry.rev);
		    return true;
		} catch (DropboxUnlinkedException e) {
		    // User has unlinked, ask them to link again here.
		    Log.e("Kmoney", "User has unlinked.");
		    return false;
		} catch (DropboxException e) {
		    Log.e("Kmoney", "Something went wrong while uploading.");
		    return false;
		} catch (FileNotFoundException e) {
		    Log.e("Kmoney", "File not found.");
		    return false;
		} finally {
		    if (inputStream != null) {
		        try {
		            inputStream.close();
		        } catch (IOException e) {}
		    }
		}		

	}
	public static File[] getFileList() {
		return null;
	}
}
