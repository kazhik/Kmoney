utils.include('./kmoney.common.js');

initDbfile('existingdb');

function testCreditCardInsert() {
    function insertCallback(id) {
        // km_creditcard_trnsに挿入されたレコードを確認
        var sql = ["select id, transaction_date, detail, expense, card_id, ",
                   "item_id, user_id, source, internal",
                   "from km_creditcard_trns",
                   "order by id desc limit 1"].join(" ");
        var statement = execSelect(sql);
        assert.isTrue(statement !== null);
        var idx = 0;
        assert.equal(id, statement.row.id);
        assert.equal("2012-12-31", statement.row.transaction_date);
        assert.equal("testdata", statement.row.detail);
        assert.equal(3980, statement.row.expense);
        assert.equal(5, statement.row.card_id);
        assert.equal(1, statement.row.item_id);
        assert.equal(3, statement.row.user_id);
        assert.equal(4, statement.row.source);
        assert.equal(6, statement.row.internal);
        
        closeStatement(statement);
        
        // km_creditcard_paymentに挿入されたレコードを確認
        sql = ["select id, transaction_id, pay_month, pay_amount, remaining_balance,",
               "detail, card_id, user_id, transaction_date, bought_amount",
               "from km_creditcard_payment",
               "order by id desc limit 1"].join(" ");
        statement = execSelect(sql);
        var pay_id = statement.row.id;
        assert.equal(id, statement.row.transaction_id);
        assert.equal("2013-01", statement.row.pay_month);
        assert.equal(3955, statement.row.pay_amount);
        assert.equal(0, statement.row.remaining_balance);
        assert.equal("testdata", statement.row.detail);
        assert.equal(5, statement.row.card_id);
        assert.equal(3, statement.row.user_id);
        assert.equal("2012-12-31", statement.row.transaction_date);
        assert.equal(3980, statement.row.bought_amount);
        closeStatement(statement);        

        // km_sys_undoに挿入されたレコードを確認
        sql = ["select undo_sql from km_sys_undo A",
               "inner join km_sys_transaction B",
               "on B.id = A.db_transaction_id",
               "and B.id = (select max(id) from km_sys_transaction)"
               ].join(" ");
        
        statement = execSelect(sql);
        var undo_sql = statement.row.undo_sql;
        assert.equal("delete from km_creditcard_trns where id = " + id,
                     undo_sql);
        statement = getNext(statement);
        undo_sql = statement.row.undo_sql;
        assert.equal("delete from km_creditcard_payment where id = " + pay_id,
                     undo_sql);
        
        closeStatement(statement);
        
    }
    var params = {
        "transactionDate": '2012-12-31',
        "itemId": 1,
        "detail": 'testdata',
        "boughtAmount": 3980,
        "userId": 3,
        "source": 4,
        "cardId": 5,
        "internal": 6,
        "payAmount": 3955,
        "payMonth": "2013-01",
        "remainingBalance": 0
    };
    app.mDb.creditCardInsert([params], insertCallback);
    
}

function testCreditCardUpdate() {
    function insertCallback(id) {
        function updateCallback(id) {
            // km_creditcard_trnsに挿入されたレコードを確認
            var sql = ["select id, transaction_date, detail, expense, card_id, ",
                       "item_id, user_id, source, internal",
                       "from km_creditcard_trns",
                       "order by id desc limit 1"].join(" ");
            var statement = execSelect(sql);
            assert.isTrue(statement !== null);
            var idx = 0;
            assert.equal(id, statement.row.id);
            assert.equal("2012-12-31", statement.row.transaction_date);
            assert.equal("testdata2", statement.row.detail);
            assert.equal(3980, statement.row.expense);
            assert.equal(5, statement.row.card_id);
            assert.equal(1, statement.row.item_id);
            assert.equal(3, statement.row.user_id);
            assert.equal(4, statement.row.source);
            assert.equal(6, statement.row.internal);
            
            closeStatement(statement);
            
            // km_creditcard_paymentに挿入されたレコードを確認
            sql = ["select id, transaction_id, pay_month, pay_amount, remaining_balance,",
                   "detail, card_id, user_id, transaction_date, bought_amount",
                   "from km_creditcard_payment",
                   "order by id desc limit 1"].join(" ");
            statement = execSelect(sql);
            var pay_id = statement.row.id;
            assert.equal(id, statement.row.transaction_id);
            assert.equal("2013-01", statement.row.pay_month);
            assert.equal(3955, statement.row.pay_amount);
            assert.equal(0, statement.row.remaining_balance);
            assert.equal("testdata2", statement.row.detail);
            assert.equal(5, statement.row.card_id);
            assert.equal(3, statement.row.user_id);
            assert.equal("2012-12-31", statement.row.transaction_date);
            assert.equal(3980, statement.row.bought_amount);
            closeStatement(statement);        
    
            // km_sys_undoに挿入されたレコードを確認
            sql = ["select undo_sql from km_sys_undo A",
                   "inner join km_sys_transaction B",
                   "on B.id = A.db_transaction_id",
                   "and B.id = (select max(id) from km_sys_transaction)"
                   ].join(" ");
            
            statement = execSelect(sql);
            var undo_sql = statement.row.undo_sql;
            assert.equal("delete from km_creditcard_trns where id = " + id,
                         undo_sql);
            statement = getNext(statement);
            undo_sql = statement.row.undo_sql;
            assert.equal("delete from km_creditcard_payment where id = " + pay_id,
                         undo_sql);
            
            closeStatement(statement);
            
        }
        var params = {
            "detail": 'testdata2',
        };
        app.mDb.creditCardUpdate([id], params, updateCallback);
    }
    var params = {
        "transactionDate": '2012-12-31',
        "itemId": 1,
        "detail": 'testdata',
        "boughtAmount": 3980,
        "userId": 3,
        "source": 4,
        "cardId": 5,
        "internal": 6,
        "payAmount": 3955,
        "payMonth": "2013-01",
        "remainingBalance": 0
    };
    app.mDb.creditCardInsert([params], insertCallback);
    
}
