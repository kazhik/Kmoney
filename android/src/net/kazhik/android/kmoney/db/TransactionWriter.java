package net.kazhik.android.kmoney.db;

public interface TransactionWriter {
	public int insert();
	public boolean update();
	public boolean delete(int id);

}
