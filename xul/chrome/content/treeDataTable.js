// ****** table event handling and display ******

// KmDatabaseTreeView: Create a custom nsITreeView
function KmDatabaseTreeView(sTreeId) {
  this.mTreeId = sTreeId;

  // 2 dimensional array containing table contents
  this.aTableData = [];

  // Column information
  this.aColumns = [];
  this.aTypes = [];

  this.aOrder = [];
}

KmDatabaseTreeView.prototype = {
  init: function(aTableData, aColumns, aTypes) {
    this.aTableData = aTableData;
    // Column information
    this.aColumns = aColumns;
    this.aTypes = aTypes;

    this.aOrder = [];
    for (var i=0; i < this.aColumns.length; i++)
      this.aOrder.push(-1);//0=asc; 1=desc

    //without this re-assigning the view, we get extra rows when we use last button in the navigation panel in browse tab.
    document.getElementById(this.mTreeId).view = this;
  },

  get rowCount() { return this.aTableData.length; },
  getCellText: function(row, col) {
    try {
      return this.aTableData[row][col.id];
    }
    catch (e) {
      return "<" + row + "," + col.id + ">";
    }
  },
  //function to get sqlite data type
  getCellDataType: function(row, col) {
    try {
      return this.aTypes[row][col.id];
    }
    catch (e) {
      return SQLiteTypes.TEXT;
    }
  },

  setTree: function(treebox) { this.treebox = treebox; },
  isContainer: function(row) { return false; },
  isSeparator: function(row) { return false; },
  isSorted: function(row) { return false; },
  getLevel: function(row) { return 0; },
  getImageSrc: function(row, col) { return null; },
  getRowProperties: function(row, properties) {},
  getCellProperties: function(row, col, properties) {
    var atomService = Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
    switch(this.aTypes[row][col.id]) {
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
  },

  getColumnProperties: function(colid, col, properties){},

  cycleHeader: function(col) {
      this.SortColumn(col);
  },

  //this function is used only for tree in execute tab
  SortColumn: function(col) {
    var index  = col.id; 
    var name = this.aColumns[index][0];
    var type = this.aColumns[index][1];
    var isnum = ((this.aColumns[index][2]==1)?1:0);
    this.aOrder[index] = (this.aOrder[index]==0)?1:0;
    var order = this.aOrder[index];
//alert(order+"="+name);
    
    this.SortTable(this.aTableData, index, order, isnum);  // sort the table
    this.treebox.invalidate();
  },

// This is the actual sorting method, extending the array.sort() method
  SortTable: function(table, col, order, isnum) {
    if (isnum) { // use numeric comparison 
        if (order == 0) { // ascending 
            this.columnSort = function (a,b){ return (a[col]-b[col]); };
        }
        else { // descending 
            this.columnSort = function (a,b){ return (b[col]-a[col]); };
        }
    }
    else { // use string comparison 
        if (order == 0){ // ascending 
            this.columnSort = function(a,b){
                return (a[col]<b[col])?-1:(a[col]>b[col])?1:0; };
        }
        else { // descending 
            this.columnSort = function(a,b){
                return (a[col]>b[col])?-1:(a[col]<b[col])?1:0; };
        }
    }
    // use array.sort(comparer) method
    table.sort(this.columnSort);
  }
};


function TreeDataTable(sTreeId) {
  this.mTreeId = sTreeId;
  this.treeTable = null; // Tree containing listing of current table
}

TreeDataTable.prototype = {
  // Initialize: Set up the treeview which will display the table contents
  init: function() {
    this.treeTable = document.getElementById(this.mTreeId);

    this.treeView = new KmDatabaseTreeView(this.mTreeId);
    this.treeView.init([], [], []);
    //init must be done before assigning to treeTable.view otherwise it does not work
    //this.treetable.view.init() also fails.
    this.treeTable.view = this.treeView;
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
    
    this.treeTable.boxObject.ensureRowIsVisible(this.treeTable.view.rowCount - 1);
  },
  getColumnValue: function(columnIdx) {
    var col = this.treeTable.columns.getColumnAt(columnIdx);
    return this.treeTable.view.getCellText(this.treeTable.currentIndex, col);
    
  }
};
