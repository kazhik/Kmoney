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
  // Last row/col that was clicked on (may be inaccurate if scrolling happened)
  lastRow: -1,
  lastCol: null,

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

  // sFormat: csv, csv-excel, sql
  exportAllRows: function(sFormat) {
    var aOut = [];
    for (var iRow = 0; iRow < this.treeTable.view.rowCount; iRow++) {
      aOut.push(this.GetRowData(iRow, sFormat));
    }

    if (aOut.length > 0)
      return aOut.join("\n");

    return "";
  },


  // UserTreeClick: Handle the user clicking on the tree
  UserTreeClick: function(ev) {
  // This event happens AFTER the window has scrolled (if necessary). This means that if the user clicked on an element that is partially off screen, and the screen scrolls to fully display it, then the mouse may no longer be over the correct element.
  //if (ev.button == 2) // Right-click
  //store the row/column that the click occurred on; used when copying cell text
    if (ev && this.treeTable && ev.type == "click") {
      var row = {}, col = {}, obj = {};
      this.treeTable.treeBoxObject.getCellAt(ev.clientX, ev.clientY, row, col, obj);
      //Issue #392: if the click is not over a row, row.value = -1
      if (row && row.value != -1 && col && col.value) {
//alert(row.value + "=" + obj.value);
        // clicked on a cell
        this.lastRow = row.value;
        this.lastCol = col.value;
      }
      else {
        this.lastRow = null;
        this.lastCol = null;
      }
    }
  },

  AddTreecol: function(treecols, sId, col, sColType, iWidth, bLast, bExtraRowId, sBgColor) {
    var treecol = document.createElement("treecol");
    treecol.setAttribute("label", col);
    treecol.setAttribute("sDataType", sColType);
    if (bExtraRowId)
      treecol.setAttribute("extraRowId", true);
    treecol.setAttribute("id", sId);
    treecol.setAttribute("width", iWidth);
    treecol.setAttribute("minwidth", 60);
    treecol.setAttribute("persist", "width");
    //Issue #378
    //treecol.setAttribute("context", 'mp-data-treecol');
    if (sBgColor != null)
      treecol.setAttribute("style", "color:"+sBgColor);

    treecols.appendChild(treecol);

    //add a splitter after every column
    var splitter = document.createElement("splitter");
    splitter.setAttribute("class", "tree-splitter");
    splitter.setAttribute("resizebefore", "closest");
    splitter.setAttribute("resizeafter", "grow");
//    splitter.setAttribute("oncommand", "SQLiteManager.saveBrowseTreeColState(this)");
    treecols.appendChild(splitter);
  },

  // iExtraColForRowId: indicates column number for the column which is a rowid
  //  0 means no extra rowid, column numbering begins with 1
  //  use this while copying Issue #151
  createColumns: function(aColumns, iExtraColForRowId, aSortInfo) {
    var treecols = this.treeTable.firstChild;
    KmGlobals.$empty(treecols);

    var iColumnCount = 0;
    var iRow;
    var iWidth, iTotalWidth, iMaxWidth;
    var sColType;
    var allCols = [];
    for (var col in aColumns) {
      iColumnCount = iColumnCount + 1;
      var aTemp = [aColumns[col][0], aColumns[col][1]];
      allCols.push(aTemp);
    }

    var iTreeWidth = this.treeTable.boxObject.width;
    for (var iColumn = 0; iColumn < iColumnCount; iColumn++) {
      iTotalWidth = 0;
      iMaxWidth = 0;
      iTotalWidth = iTreeWidth/iColumnCount;
      if (iTotalWidth < 60) iTotalWidth = 60;

      sColType = '';

      var sBgColor = null;
      for(var i = 0; i < aSortInfo.length; i++) {
        if (aSortInfo[i][0] == allCols[iColumn][0]) {
          switch (aSortInfo[i][1]) {
            case "asc":
              sBgColor = "green";
              break;
            case "desc":
              sBgColor = "red";
              break;
          }
        }
      }
      var bExtraColForRowId = (iColumn==iExtraColForRowId-1) ? true : false;
      this.AddTreecol(treecols, iColumn, allCols[iColumn][0], sColType, iTotalWidth,
                      (iColumn==iColumnCount-1?true:false), bExtraColForRowId, sBgColor);
    }
  },

  adjustColumns: function(objColInfo) {
    if (typeof objColInfo.arrId == "undefined" || typeof objColInfo.arrWidth == "undefined")
      return;
    var aCols = this.treeTable.querySelectorAll("treecol");
    for (var i = 0; i < aCols.length; i++) {
      var pos = objColInfo.arrId.indexOf(aCols.item(i).id);
      if (pos >= 0)
        aCols.item(i).width = objColInfo.arrWidth[pos];
    }
  },

  hideColumns: function(treeColsName, colLabels) {
    var treecols = $$(treeColsName);
    var children = treecols.childNodes;
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName == 'treecol') {
        for (var j = 0; j < colLabels.length; j++) {
          if (children[i].getAttribute('label') == colLabels[j]) {
            children[i].setAttribute('hidden', 'true');
          }
        }
      }
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
