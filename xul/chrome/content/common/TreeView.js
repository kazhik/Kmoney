// ****** table event handling and display ******
// KmDataTreeView: Create a custom nsITreeView
function KmDataTreeView(sTreeId) {
    this.mTreeId = sTreeId;

    // 2 dimensional array containing table contents
    this.aTableData = [];

    // Column information
    this.aColumns = [];

    this.colInfo = {};

    this.onClickColumnHeader = null;
};

KmDataTreeView.prototype = {
    init: function (aTableData, aColumns, callbackFunc) {
        this.aTableData = aTableData;
        // Column information
        this.aColumns = aColumns;

        if (Object.keys(this.colInfo).length === 0) {
            for (var i = 0; i < aColumns.length; i++) {
                this.colInfo[aColumns[i][0]] = {
                    'index': i,
                    'type': aColumns[i][1],
                    'order': 'natural'
                };
            }
        }
        if (callbackFunc != undefined) {
            this.onClickColumnHeader = callbackFunc;
        }

        //without this re-assigning the view, we get extra rows when we use last button in the navigation panel in browse tab.
        document.getElementById(this.mTreeId).view = this;
    },

    get rowCount() {
        return this.aTableData.length;
    },
    getCellValue: function (row, col) {
        return "true";
    },
    getCellText: function (row, col) {
        try {
            return this.aTableData[row][col.index];
        } catch (e) {
            return "<" + row + "," + col.id + ">";
        }
    },
    //function to get sqlite data type
    getCellDataType: function (row, col) {},

    setTree: function (treebox) {
        this.treebox = treebox;
    },
    isContainer: function (row) {
        return false;
    },
    isSeparator: function (row) {
        return false;
    },
    isSorted: function (row) {
        return false;
    },
    getLevel: function (row) {
        return 0;
    },
    getImageSrc: function (row, col) {
        return null;
    },
    getRowProperties: function (row, properties) {},
    getCellProperties: function (row, col, properties) {},

    getColumnProperties: function (colid, col, properties) {},

    cycleHeader: function (col) {
        var colLabel = this.aColumns[col.index][0];
        var colOrder = this.colInfo[colLabel]['order'];
        var sortOrder;

        if (colOrder === 'natural') {
            this.colInfo[colLabel]['order'] = 'ascending';
            sortOrder = "asc";
        } else if (colOrder === 'ascending') {
            this.colInfo[colLabel]['order'] = 'descending';
            sortOrder = "desc";
        } else if (colOrder === 'descending') {
            this.colInfo[colLabel]['order'] = 'natural';
            sortOrder = "";
        }

        var cols = document.getElementById(this.mTreeId).getElementsByTagName("treecol");
        for (var i = 0; i < cols.length; i++) {
            if (cols[i].getAttribute('id') === col.id) {
                cols[i].setAttribute("sortDirection", this.colInfo[colLabel]['order']);
            } else {
                cols[i].removeAttribute("sortDirection");
            }
        }

        this.onClickColumnHeader(colLabel, sortOrder);
    }

};


function TreeViewController(sTreeId) {
    this.mTreeId = sTreeId;
    this.treeTable = null; // Tree containing listing of current table
    this.mSortCol = null;
    this.mSortOrder = null;
    this.sortTable = null;
};

TreeViewController.prototype = {
    // Initialize: Set up the treeview which will display the table contents
    init: function (callbackFunc) {
        this.treeTable = document.getElementById(this.mTreeId);

        if (callbackFunc != undefined) {
            this.sortTable = callbackFunc;
        }
        this.treeView = new KmDataTreeView(this.mTreeId);
        this.treeView.init([], [], this.onClickColumnHeader.bind(this));
        //init must be done before assigning to treeTable.view otherwise it does not work
        //this.treetable.view.init() also fails.
        this.treeTable.view = this.treeView;
    },
    
    moveUp: function() {
        
    },
    
    moveDown: function() {
        
    },
    
    getCurrentSortParams: function () {
        if (this.mSortOrder === null) {
            return undefined;
        }
        var sortParams = [
            {
            "column": this.mSortCol,
            "order": this.mSortOrder
            }
        ];
        return sortParams;
    },
    onClickColumnHeader: function (sortCol, sortOrder) {
        if (this.sortTable) {
            var sort = {};
            sort['column'] = sortCol;
            sort['order'] = sortOrder;
            this.sortTable([sort]);
        }
        this.mSortCol = sortCol;
        this.mSortOrder = sortOrder;
    },

    // showTable: Show/hide any currently displayed table data
    showTable: function (bShow) {
        if (this.treeTable == null) return;

        this.treeTable.childNodes[0].hidden = !bShow;
        this.treeTable.childNodes[1].hidden = !bShow;

        if (!bShow) {
            // remove all of the child rows/columns
            KmGlobals.$empty(this.treeTable.childNodes[0]);
            KmGlobals.$empty(this.treeTable.childNodes[1]);
        }
    },

    // populateTableData: Assign our custom treeview
    populateTableData: function (aTableData, aColumns, aTypes) {
        //populate the tree's view with fresh data
        this.treeView.init(aTableData, aColumns);

    },

    ensureRowIsVisible: function (rowidLabel, rowId) {
        var idxRow;
        rowId = parseInt(rowId);
        if (rowId === -1) {
            this.treeTable.boxObject.ensureRowIsVisible(this.treeTable.view.rowCount - 1);
        } else {
            var col = this.treeTable.columns.getNamedColumn(rowidLabel);
            for (var i = 0; i < this.treeTable.view.rowCount; i++) {
                var val = this.treeTable.view.getCellText(i, col)
                if (parseInt(val) === rowId) {
                    this.treeTable.boxObject.ensureRowIsVisible(i);
                    break;
                }
            }

        }
    },

    ensurePreviousRowIsVisible: function () {
        if (this.treeTable.currentIndex - 1 >= 0) {
            this.treeTable.boxObject.ensureRowIsVisible(this.treeTable.currentIndex - 1);
        } else {
            this.treeTable.boxObject.ensureRowIsVisible(0);
        }
    },

    checkSelected: function () {
        return (this.treeTable.currentIndex != -1);
    },
    getColumnValue: function (columnIdx) {
        if (this.treeTable.currentIndex === -1) {
            return "";
        }
        var col = this.treeTable.columns.getColumnAt(columnIdx);
        return this.treeTable.view.getCellText(this.treeTable.currentIndex, col);

    },
    getSelectedRowCount: function () {
        return this.treeTable.view.selection.count;

    },
    getSelectedRowValueList: function (columnName) {
        var start = new Object();
        var end = new Object();
        var numRanges = this.treeTable.view.selection.getRangeCount();
        var valueArray = [];
        var col = this.treeTable.columns.getNamedColumn(columnName);
        
        if (col !== null) {
            for (var t = 0; t < numRanges; t++) {
                this.treeTable.view.selection.getRangeAt(t, start, end);
                for (var v = start.value; v <= end.value; v++) {
                    valueArray.push(this.treeTable.view.getCellText(v, col));
                }
            }
            
        }

        return valueArray;
    },
    getLastRowValue: function(columnName) {
        var rowCnt = this.treeView.rowCount;
        var col = this.treeTable.columns.getNamedColumn(columnName);
        return this.treeTable.view.getCellText(rowCnt - 1, col);
    },
    getSelectedRowValue: function (columnName) {
        if (this.treeTable.currentIndex === -1) {
            return "";
        }
        var col = this.treeTable.columns.getNamedColumn(columnName);
        return this.treeTable.view.getCellText(this.treeTable.currentIndex, col);

    }
};