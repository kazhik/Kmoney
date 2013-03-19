package net.kazhik.android.kmoney.storage;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import net.kazhik.android.kmoney.Constants;
import net.kazhik.android.kmoney.db.KmDatabase;
import net.kazhik.android.kmoney.util.FileUtil;
import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.dropbox.sync.android.DbxAccountManager;
import com.dropbox.sync.android.DbxException;
import com.dropbox.sync.android.DbxException.Unauthorized;
import com.dropbox.sync.android.DbxFile;
import com.dropbox.sync.android.DbxFileInfo;
import com.dropbox.sync.android.DbxFileSystem;
import com.dropbox.sync.android.DbxPath;
import com.dropbox.sync.android.DbxPath.InvalidPathException;

public class DropboxTask extends AbstractImportExportTask {
	public static final int REQUEST_EXECUTE = 100;
	private DbxAccountManager accountMgr;

	public DropboxTask(Context ctx, ImportExportBridge taskBridge,
			ImportExportTask.TaskListener listener) {

		super(ctx, taskBridge, listener);

		this.createInstance();
	}	
	
	@Override
	public Boolean execImport(String srcFile) {
		FileInputStream fis = null;
		try {
			DbxFileSystem dbxFs = DbxFileSystem.forAccount(this.accountMgr.getLinkedAccount());
			DbxFile dropboxFile = dbxFs.open(new DbxPath(srcFile));
			
			fis = dropboxFile.getReadStream();
			KmDatabase db = new KmDatabase(this.context);
			db.importDatabase(fis);
		} catch (Unauthorized e) {
			Log.e(Constants.APPNAME, e.getMessage());
		} catch (InvalidPathException e) {
			Log.e(Constants.APPNAME, e.getMessage());
		} catch (DbxException e) {
			Log.e(Constants.APPNAME, e.getMessage());
		} catch (IOException e) {
			Log.e(Constants.APPNAME, e.getMessage());
		}
		
		FileUtil.close(fis);

		return true;
	}


	@Override
	public Boolean execExport() {
		Boolean result = false;
		try {
		    File file = this.getDbFile();
			DbxFileSystem dbxFs = DbxFileSystem.forAccount(this.accountMgr.getLinkedAccount());
			String targetFileName = this.targetFileName(file.getName());
			DbxFile targetFile = dbxFs.create(new DbxPath(targetFileName));
			targetFile.writeFromExistingFile(this.getDbFile(), false);

			result = true;
		} catch (Unauthorized e) {
			Log.e(Constants.APPNAME, e.getMessage());
		} catch (InvalidPathException e) {
			Log.e(Constants.APPNAME, e.getMessage());
		} catch (DbxException e) {
			Log.e(Constants.APPNAME, e.getMessage());
		} catch (IOException e) {
			Log.e(Constants.APPNAME, e.getMessage());
		}	
		return result;
	}
	@Override
	public String[] getFileList() throws DbxException {
		DbxFileSystem dbxFs = DbxFileSystem.forAccount(this.accountMgr.getLinkedAccount());

	    List<DbxFileInfo> fileInfoList = dbxFs.listFolder(DbxPath.ROOT);
	    List<String> fileNameList = new ArrayList<String>();
	    for (DbxFileInfo fileInfo : fileInfoList) {
	    	fileNameList.add(fileInfo.path.getName());
	    }
	    return fileNameList.toArray(new String[fileNameList.size()]);
	}
	
	private void createInstance() {
		final String APP_KEY = "kuyk8nn6g6osz3s";
		final String APP_SECRET = "58pm6zl92rcg5i9";
		
		Activity activity = (Activity)this.context;
		Context appContext = activity.getApplicationContext();
		this.accountMgr = DbxAccountManager.getInstance(appContext, APP_KEY, APP_SECRET);
		
	}
	
	@Override
	public void start() {
		if (!this.accountMgr.hasLinkedAccount()) {
			this.accountMgr.startLink((Activity)this.context, REQUEST_EXECUTE);
			return;
		}
			
		this.execute();
	}
}
