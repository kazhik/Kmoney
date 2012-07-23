// ****** table event handling and display ******

// KmDataTreeView: Create a custom nsITreeView
function KmDataTreeView(sTreeId) {
  this.mTreeId = sTreeId;

  // 2 dimensional array containing table contents
  this.aTableData = [];

  // Column information
  this.aColumns = [];
  this.aTypes = [];

  this.colInfo = {};
  
};

KmDataTreeView.prototype = {
  init: function(aTableData, aColumns, aTypes, callbackFunc) {
    this.aTableData = aTableData;
    // Column information
    this.aColumns = aColumns;
    this.aTypes = aTypes;

    if (Object.keys(this.colInfo).length === 0) {
      for (var i = 0; i < this.aColumns.length; i++) {
        this.colInfo[aColumns[i][0]] = 
          {'index': i,
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

  get rowCount() { return this.aTableData.length; },
  getCellValue: function(row, col) {
      return "true";
  },
  getCellText: function(row, col) {
    try {
      return this.aTableData[row][col.index];
    }
    catch (e) {
      return "<" + row + "," + col.id + ">";
    }
  },
  //function to get sqlite data type
  getCellDataType: function(row, col) {
/*
    try {
//      var colLabel = this.aColumns[col.index][0];
//      var colType = this.colInfo[colLabel]['type'];
//      return colType;
      return this.aTypes[row][col.index];
    }
    catch (e) {
      return SQLiteTypes.TEXT;
    }
*/
  },

  setTree: function(treebox) { this.treebox = treebox; },
  isContainer: function(row) { return false; },
  isSeparator: function(row) { return false; },
  isSorted: function(row) { return false; },
  getLevel: function(row) { return 0; },
  getImageSrc: function(row, col) { return null; },
  getRowProperties: function(row, properties) {},
  getCellProperties: function(row, col, properties) {
 /*
    var atomService = Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
    switch(this.aTypes[row][col.index]) {
      case SQLiteTypes.INTEGER:
        var atom = atomService.getAtom("integervalue");
        properties.AppendElement(atom);
        break;
      case SQLiteTypes.REAL:
        var atom = atomService.getAtom("floatvalue");
        properties.AppendElement(atom);
        break;
      case SQLiteTypes.BLOB:
        var atom = atomService.getAtom("blobvalue");
        properties.AppendElement(atom);
        break;
      case SQLiteTypes.NULL: 
        var atom = atomService.getAtom("nullvalue");
        properties.AppendElement(atom);
        break;
      case SQLiteTypes.TEXT:
      default:
        var atom = atomService.getAtom("textvalue");
        properties.AppendElement(atom);
        break;
    }
    if (typeof this.getCellText(row,col) == "number") {
      var atom = atomService.getAtom("numbervalue");
      properties.AppendElement(atom);
    }
    var atom = atomService.getAtom("tabledata");
    properties.AppendElement(atom);
 */
 },

  getColumnProperties: function(colid, col, properties){},

  cycleHeader: function(col) {
    var colLabel = this.aColumns[col.index][0];
    var colOrder = this.colInfo[colLabel]['order'];
    var orderby;

    if (colOrder === 'natural') {
      this.colInfo[colLabel]['order'] = 'ascending';
      orderby = colLabel + " asc";
    } else if (colOrder === 'ascending') {
      this.colInfo[colLabel]['order'] = 'descending';
      orderby = colLabel + " desc";
    } else if (colOrder === 'descending') {
      this.colInfo[colLabel]['order'] = 'natural';
      orderby = "";
    }
    
	var cols = document.getElementById(this.mTreeId).getElementsByTagName("treecol");
	for (var i = 0; i < cols.length; i++) {
      if (cols[i].getAttribute('id') === col.id) {
        cols[i].setAttribute("sortDirection", this.colInfo[colLabel]['order']);
      } else {
		cols[i].removeAttribute("sortDirection");
      }
	}    
    
    this.onClickColumnHeader(orderby);
  }

};


function TreeViewController(sTreeId) {
  this.mTreeId = sTreeId;
  this.treeTable = null; // Tree containing listing of current table
  this.mLimit = 100;
  this.mOffset = 0;
  this.mCount = 0;
  this.mSortOrder = null;
  this.reloadTable = null;
};

TreeViewController.prototype = {
  // Initialize: Set up the treeview which will display the table contents
  init: function(callbackFunc) {
    this.treeTable = document.getElementById(this.mTreeId);

    this.mLimit = km_prefsBranch.getIntPref("displayNumRecords");
    
    if (callbackFunc != undefined) {
      this.reloadTable = callbackFunc;
    }
    this.treeView = new KmDataTreeView(this.mTreeId);
    this.treeView.init([], [], [], this.onClickColumnHeader.bind(this));
    //init must be done before assigning to treeTable.view otherwise it does not work
    //this.treetable.view.init() also fails.
    this.treeTable.view = this.treeView;
  },
  onClickColumnHeader: function(sortOrder) {
    if (this.reloadTable) {
      this.reloadTable('last', sortOrder);
    }
    this.mSortOrder = sortOrder;
  },

  // ShowTable: Show/hide any currently displayed table data
  ShowTable: function(bShow) {
    if (this.treeTable == null) 
      return;

    this.treeTable.childNodes[0].hidden = !bShow;
    this.treeTable.childNodes[1].hidden = !bShow;

    if (!bShow) {
      // remove all of the child rows/columns
      KmGlobals.$empty(this.treeTable.childNodes[0]);
      KmGlobals.$empty(this.treeTable.childNodes[1]);
    } 
  },

  // PopulateTableData: Assign our custom treeview
  PopulateTableData: function(aTableData, aColumns, aTypes) {
    //populate the tree's view with fresh data
    this.treeView.init(aTableData, aColumns, aTypes);
    
  },
  ensureRowIsVisible: function(rowIdColIdx, rowId) {
    var idxRow;
    if (rowId === -1) {
      this.treeTable.boxObject.ensureRowIsVisible(this.treeTable.view.rowCount - 1);
    } else {
      var col = this.treeTable.columns.getColumnAt(rowIdColIdx);
      for (var i = 0; i < this.treeTable.view.rowCount; i++) {
        var val = this.treeTable.view.getCellText(i, col)
        if (val === rowId) {
          this.treeTable.boxObject.ensureRowIsVisible(i);
          break;
        }
      }
      
    }
  },
  setOffset: function(direction) {
    if (direction === 'first') {
      this.mOffset = 0;
    } else if (direction === 'prev') {
      this.mOffset -= this.mLimit;
      if (this.mOffset < 0) {
        this.mOffset = 0;
      }
    } else if (direction === 'next') {
      if (this.mOffset + this.mLimit < this.mCount) {
        this.mOffset += this.mLimit;
      }
    } else if (direction === 'last') {
      if (this.mCount % this.mLimit === 0) {
        this.mOffset = (this.mLimit * (Math.floor(this.mCount / this.mLimit) - 1));
      } else {
        this.mOffset = (this.mLimit * Math.floor(this.mCount / this.mLimit));
      }
    }
  },
  getRowCount: function() {
    return this.mCount;
  },
  setRowCount: function(count) {
    this.mCount = count;
  },
  getFromValue: function() {
    return this.mOffset + 1;
  },
  getToValue: function() {
    if (this.mOffset + this.mLimit < this.mCount) {
      return this.mOffset + this.mLimit;
    } else {
      return this.mCount;
    }
  },
  getColumnValue: function(columnIdx) {
    var col = this.treeTable.columns.getColumnAt(columnIdx);
    return this.treeTable.view.getCellText(this.treeTable.currentIndex, col);
    
  },
  getSelectedRowValue: function(columnName) {
    var col = this.treeTable.columns.getNamedColumn(columnName);
    return this.treeTable.view.getCellText(this.treeTable.currentIndex, col);
    
  }
};
