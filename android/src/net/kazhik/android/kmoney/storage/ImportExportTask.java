package net.kazhik.android.kmoney.storage;

import java.text.ParseException;
import java.util.Date;


public interface ImportExportTask {
	public interface TaskListener {
		void onCompleted();
	}
	
	public void showDialog(int msgid);
	
	public Boolean execImport(String srcFile);
	
	public Boolean execExport();
	
	public void dismissDialog(int msg);

	public void start();

	public void exec();
	
	public String[] getFileList() throws Exception;
	
	public Date getFileDate(String filepath) throws ParseException;
	
}
