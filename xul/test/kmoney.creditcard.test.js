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
            function insertCallback2(id) {
                function updateCallback2(id) {
                    // km_creditcard_paymentに挿入されたレコードを確認
                    sql = ["select transaction_id, pay_month, pay_amount, remaining_balance,",
                           "detail, card_id, user_id, transaction_date, bought_amount",
                           "from km_creditcard_payment",
                           "order by id desc limit 1"].join(" ");
                    statement = execSelect(sql);
                    assert.equal(id, statement.row.transaction_id);
                    assert.equal("2013-02", statement.row.pay_month);
                    assert.equal(3955, statement.row.pay_amount);
                    assert.equal(0, statement.row.remaining_balance);
                    assert.equal("testdata10", statement.row.detail);
                    assert.equal(5, statement.row.card_id);
                    assert.equal(3, statement.row.user_id);
                    assert.equal("2013-01-01", statement.row.transaction_date);
                    assert.equal(223, statement.row.bought_amount);
                    closeStatement(statement);        
                }
                // km_creditcard_trnsに挿入されたレコードを確認
                var sql = ["select id, transaction_date, detail, expense, card_id, ",
                           "item_id, user_id, source, internal",
                           "from km_creditcard_trns",
                           "order by id desc limit 1"].join(" ");
                var statement = execSelect(sql);
                assert.isTrue(statement !== null);
                var idx = 0;
                assert.equal(id, statement.row.id);
                assert.equal("2012-12-24", statement.row.transaction_date);
                assert.equal("testdata5", statement.row.detail);
                assert.equal(4002, statement.row.expense);
                assert.equal(6, statement.row.card_id);
                assert.equal(2, statement.row.item_id);
                assert.equal(2, statement.row.user_id);
                assert.equal(3, statement.row.source);
                assert.equal(8, statement.row.internal);
                closeStatement(statement);

                // km_creditcard_paymentの最終レコードは前回と同じ
                sql = ["select id from km_creditcard_payment",
                       "order by id desc limit 1"].join(" ");
                statement = execSelect(sql);
                assert.equal(pay_id, statement.row.id);

                closeStatement(statement);

                var params = {
                    "transactionDate": '2013-01-01',
                    "itemId": 1,
                    "detail": 'testdata10',
                    "boughtAmount": 223,
                    "userId": 3,
                    "source": 4,
                    "cardId": 5,
                    "internal": 6,
                    "payAmount": 3955,
                    "payMonth": "2013-02",
                    "remainingBalance": 0
                };
                app.mDb.creditCardUpdate([id], params, updateCallback2);

            }
            
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
            assert.contains("update km_creditcard_trns", undo_sql);
            assert.contains("detail = 'testdata'", undo_sql);
            assert.contains("where id = " + id, undo_sql);
            statement = getNext(statement);
            undo_sql = statement.row.undo_sql;
            assert.contains("update km_creditcard_payment", undo_sql);
            assert.contains("detail = 'testdata'", undo_sql);
            assert.contains("where id = " + pay_id, undo_sql);
            
            closeStatement(statement);
            
            // 支払月なし
            var params = {
                "transactionDate": '2012-12-24',
                "itemId": 2,
                "detail": 'testdata5',
                "boughtAmount": 4002,
                "userId": 2,
                "source": 3,
                "cardId": 6,
                "internal": 8,
            };
            app.mDb.creditCardInsert([params], insertCallback2);
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

function testCreditCardDelete() {
    function insertCallback(id) {
        function deleteCallback() {
            var sql = ["select id from km_creditcard_trns",
                       "order by id desc limit 1"].join(" ");
            var statement = execSelect(sql);
            assert.notEqual(id, statement.row.id);
            closeStatement(statement);
            
            // km_sys_undoに挿入されたレコードを確認
            sql = ["select undo_sql from km_sys_undo A",
                   "inner join km_sys_transaction B",
                   "on B.id = A.db_transaction_id",
                   "and B.id = (select max(id) from km_sys_transaction)"
                   ].join(" ");
            
            statement = execSelect(sql);
            var undo_sql = statement.row.undo_sql;
            assert.contains("insert into km_creditcard_trns", undo_sql);
            
            statement = getNext(statement);
            undo_sql = statement.row.undo_sql;
            assert.contains("insert into km_creditcard_payment", undo_sql);
            
        }
        var sql = ["select id from km_creditcard_trns",
                   "order by id desc limit 1"].join(" ");
        var statement = execSelect(sql);
        assert.equal(id, statement.row.id);
        closeStatement(statement);
        app.mDb.creditCardDelete([id], deleteCallback);
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

