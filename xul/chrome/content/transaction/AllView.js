function AllView() {
    this.mDb = null;
    this.mTree = new TreeViewController("km_tree_all");
};

AllView.prototype.initialize = function (db) {
    this.mDb = db;
    this.mTree.init(this.load.bind(this));
};

AllView.prototype.query = function (queryParams) {
    this.load(queryParams);
};

AllView.prototype.sort = function (sortParams) {
    this.load(undefined, sortParams);
};

AllView.prototype.load = function (queryParams, sortParams) {
    var orderBy = "";
    if (sortParams !== undefined) {
        for (var i = 0; i < sortParams.length; i++) {
            orderBy += sortParams[i]['column'];
            if (sortParams[i]['order'] != undefined) {
                orderBy += " " + sortParams[i]['order'];
            }
        }
    } else {
        if (this.mTree.mSortOrder != null) {
            orderBy += this.mTree.mSortCol;
            orderBy += " " + this.mTree.mSortOrder;
        } else {
            orderBy += "A.transaction_date asc";
            this.mTree.mSortCol = "A.transaction_date";
            this.mTree.mSortOrder = "asc";
        }
    }

    if (queryParams != undefined) {
        this.queryParams = queryParams;
    } else {
        queryParams = this.queryParams;
    }
    var params = {};
    var where = "";

    var cond1 = queryParams['cond1'];
    var cond2 = queryParams['cond2'];

    var key = cond1['key'];
    var keyCol;
    if (key != "none") {
        if (key === "date") {
            keyCol = "A.transaction_date";
        } else if (key === "item") {
            keyCol = "A.item_id";
        } else if (key === "detail") {
            keyCol = "A.detail";
        } else if (key === "user") {
            keyCol = "A.user_id";
        }
        where = " where ";
        where += keyCol;
        where += " ";
        where += cond1['operator'];
        where += " ";
        where += ":" + key + "_1";
        params[key + "_1"] = cond1['value'];

        key = cond2['key'];
        if (key != "none") {
            if (key === "date") {
                keyCol = "A.transaction_date";
            } else if (key === "item") {
                keyCol = "A.item_id";
            } else if (key === "detail") {
                keyCol = "A.detail";
            } else if (key === "user") {
                keyCol = "A.user_id";
            }
            if (queryParams['andor'] === 'AND') {
                where += " and ";
            } else if (queryParams['andor'] === 'OR') {
                where += " or ";
            }

            where += keyCol;
            where += " ";
            where += cond2['operator'];
            where += " ";
            where += ":" + key + "_2";
            params[key + "_2"] = cond2['value'];
        }
    }

    var sql = "select " + "A.transaction_date, " + "A.item_name, " + "A.detail, " + "A.income, " + "A.expense, " + "A.user_name, " + "case " + " when A.type = 'realmoney' then '" + km_getLStr("transaction_type.cash") + "'" + " when A.type = 'bank' then '" + km_getLStr("transaction_type.bank") + "'" + " when A.type = 'creditcard' then '" + km_getLStr("transaction_type.creditcard") + "'" + " when A.type = 'emoney' then '" + km_getLStr("transaction_type.emoney") + "'" + " end as type, " + "A.rowid " + "from kmv_transactions A ";

    if (where.length > 0) {
        sql += where;
    }
    sql += " order by " + orderBy;

    km_log(sql);
    this.mDb.selectWithParams(sql, params);
    var records = this.mDb.getRecords();
    var types = this.mDb.getRecordTypes();
    var columns = this.mDb.getColumns();
    this.mTree.populateTableData(records, columns, types);
    this.mTree.showTable(true);
};