package net.kazhik.android.kmoney.db;

import net.kazhik.android.kmoney.R;
import android.content.Context;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;


public class KmDatabase {

    public static final String DATABASE_NAME = "kmoneys.sqlite"; //$NON-NLS-1$

    public static final int DATABASE_VERSION = 2;

    private final Context context; 
    private DatabaseHelper DBHelper;
    @SuppressWarnings("unused")
	private SQLiteDatabase db;

    /**
     * Constructor
     * @param ctx
     */
    public KmDatabase(Context ctx)
    {
        this.context = ctx;
        this.DBHelper = new DatabaseHelper(this.context);
    }

    private static class DatabaseHelper extends SQLiteOpenHelper 
    {
    	private Context context;
        DatabaseHelper(Context context) 
        {
            super(context, DATABASE_NAME, null, DATABASE_VERSION);
        	this.context = context;
        }

        @Override
        public void onCreate(SQLiteDatabase db) 
        {
            String[] banks = this.context.getResources().getStringArray(R.array.default_banks);
            KmBankInfo.init(db, banks);
            
            String[] cards = this.context.getResources().getStringArray(R.array.default_creditcards);
            KmCreditCardInfo.init(db, cards);
            
            String[] emoneys = this.context.getResources().getStringArray(R.array.default_emoneys);
            KmEMoneyInfo.init(db, emoneys);
            
            String[] items = this.context.getResources().getStringArray(R.array.default_items);
            KmCategory.init(db, items);
            
            KmCashTrns.init(db);
            KmBankTrns.init(db);
            KmCreditCardTrns.init(db);
            KmEMoneyTrns.init(db);
            KmvTransactions.init(db);
            
            
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) 
        {               
        }
    } 

   /**
     * open the db
     * @return this
     * @throws SQLException
     * return type: DBAdapter
     */
    public KmDatabase open() throws SQLException 
    {
        this.db = this.DBHelper.getWritableDatabase();
        return this;
    }

    /**
     * close the db 
     * return type: void
     */
    public void close() 
    {
        this.DBHelper.close();
    }
}