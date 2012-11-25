utils.include('./kmoney.common.js');

function testKmAssetInsert() {
    function insertCallback() {
        var sql = ["select id, name, amount, user_id, asset_type",
                   "from km_asset",
                   "order by id desc limit 1"].join(" ");
        var statement = execSelect(sql);
        var idx = 0;
        var asset_id = statement.getInt64(idx++);
        assert.equal("みずほ銀行定期預金", statement.getString(idx++));
        assert.equal(10000, statement.getInt64(idx++));
        assert.equal(1, statement.getInt64(idx++));
        assert.equal(2, statement.getInt64(idx++));
        closeStatement(statement);
        
        execUpdate("delete from km_asset where id = " + asset_id);
        
        idx = 0;
        sql = ["select id, asset_id, transaction_type, transaction_id",
               "from km_asset_history",
               "order by id desc limit 1"].join(" ");
        statement = execSelect(sql);
        var history_id = statement.getInt64(idx++);
        assert.equal(asset_id, statement.getInt64(idx++));
        assert.equal(3, statement.getInt64(idx++));
        assert.equal(544, statement.getInt64(idx++));
        closeStatement(statement);

        execUpdate("delete from km_asset_history where id = " + history_id);

    }

    var params = {
        "name": "みずほ銀行定期預金",
        "amount": 10000,
        "userId": 1,
        "assetType": 2,
        "transactionType": 3,
        "transactionId": 544
    };
    win.kmoney.mDb.asset.insert(params, insertCallback);
}

function testKmAssetUpdate() {
    function insertCallback() {
        function updateCallback() {
            var sql = ["select id, name, amount, user_id, asset_type",
                       "from km_asset",
                       "order by id desc limit 1"].join(" ");
            var statement = execSelect(sql);
            var idx = 0;
            var asset_id = statement.getInt64(idx++);
            assert.equal("みずほ銀行普通預金", statement.getString(idx++));
            assert.equal(30000, statement.getInt64(idx++));
            assert.equal(14, statement.getInt64(idx++));
            assert.equal(22, statement.getInt64(idx++));
            closeStatement(statement);
            
            execUpdate("delete from km_asset where id = " + asset_id);
            
            idx = 0;
            sql = ["select id, asset_id, transaction_type, transaction_id",
                   "from km_asset_history",
                   "order by id desc limit 1"].join(" ");
            statement = execSelect(sql);
            var history_id = statement.getInt64(idx++);
            assert.equal(asset_id, statement.getInt64(idx++));
            assert.equal(43, statement.getInt64(idx++));
            assert.equal(5444, statement.getInt64(idx++));
            closeStatement(statement);
    
            execUpdate("delete from km_asset_history where id = " + history_id);
        }
        var sql = ["select id",
                   "from km_asset",
                   "order by id desc limit 1"].join(" ");
        var statement = execSelect(sql);
        var asset_id = statement.getInt64(0);
        closeStatement(statement);
        
        var params = {
            "name": "みずほ銀行普通預金",
            "amount": 20000,
            "userId": 14,
            "assetType": 22,
            "transactionType": 43,
            "transactionId": 5444
        };
        win.kmoney.mDb.asset.update(asset_id, params, updateCallback);
        
        
    }
    var params = {
        "name": "みずほ銀行定期預金",
        "amount": 10000,
        "userId": 1,
        "assetType": 2,
        "transactionType": 3,
        "transactionId": 544
    };
    win.kmoney.mDb.asset.insert(params, insertCallback);
    
}

function testKmAssetDelete() {
    function insertCallback() {
        function deleteCallback() {
            var statement = execSelect("select count(*) from km_asset where id = " + asset_id);
            assert.equal(0, statement.getInt64(0));
            closeStatement(statement);
        }
        var sql = ["select id",
                   "from km_asset",
                   "order by id desc limit 1"].join(" ");
        var statement = execSelect(sql);
        var asset_id = statement.getInt64(0);
        closeStatement(statement);
        
        win.kmoney.mDb.asset.delete(asset_id, deleteCallback);
        
        
    }
    var params = {
        "name": "みずほ銀行定期預金",
        "amount": 10000,
        "userId": 1,
        "assetType": 2,
        "transactionType": 3,
        "transactionId": 544
    };
    win.kmoney.mDb.asset.insert(params, insertCallback);
    
}
