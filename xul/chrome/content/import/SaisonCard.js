Components.utils.import("resource://gre/modules/NetUtil.jsm");

function SaisonCard(db, cardTbl, itemMap) {
  this.mDb = db;
  this.cardTable = cardTbl;
  this.itemMap = itemMap;
  
  this.cardId = 0;
  this.userId = 0;
  
};

SaisonCard.prototype.getSourceType = function() {
    this.mDb.selectQuery("select rowid from km_source where type = 'セゾンカード'" );
    var records = this.mDb.getRecords();
    if (records.length === 1) {
      return records[0][0];
    }
    return 0;
};


SaisonCard.prototype.getItemInfo = function(detail) {
  // TODO: このマップは編集できるようにする
  var importItemArray = [
    { "detail": "その他",
      "itemId": this.itemMap["食材・生活用品"],
      "internal": 0,
      "default" : 1
    },
  ];
  
  var defaultItem = {};
  for (var i in importItemArray) {
    if (importItemArray[i]["default"] == 1) {
      defaultItem = importItemArray[i];
    } else if (detail.search(importItemArray[i]["detail"]) != -1) {
      return importItemArray[i];
    }
  }
  return defaultItem;

};

    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
                (
                        // Delimiters.
                        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                        // Quoted fields.
                        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                        // Standard fields.
                        "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
                );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                        strMatchedDelimiter.length &&
                        (strMatchedDelimiter != strDelimiter)
                        ){

                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push( [] );

                }


                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){

                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        var strMatchedValue = arrMatches[ 2 ].replace(
                                new RegExp( "\"\"", "g" ),
                                "\""
                                );

                } else {

                        // We found a non-quoted value.
                        var strMatchedValue = arrMatches[ 3 ];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    };
function convertZen2han(str) {
  for (var i = 0; i < 10; i++) {
    str = str.replace(new RegExp(
      new Array('０','１','２','３','４','５','６','７','８','９')[i], 'g'), i);  
  }
  return str;
};
SaisonCard.prototype.onFileOpen = function(inputStream, status) {
  if (!Components.isSuccessCode(status)) {
    return;
  }

  var strBuff = "";
  
  strBuff = NetUtil.readInputStreamToString(inputStream, inputStream.available(),
    {"charset": "Shift_JIS"});

  var rowArray = CSVToArray(strBuff, ",");
  
  if (rowArray.length === 0) {
    return;
  }
  var payMonth = "";
  var sourceType = this.getSourceType();
  for (var i = 0; i < rowArray.length; ++i) {
    
    if (rowArray[i].length === 0) {
      continue;
    }

    if (rowArray[i][0].match(/\d{4}\/\d{2}\/\d{2}$/)){
      var rec = {
        "transactionDate": "",
        "payAmount": 0,
        "payMonth" : payMonth,
        "boughtAmount": 0,
        "itemId": 0,
        "detail": "",
        "userId": this.userId,
        "cardId": this.cardId,
        "source": sourceType,
        "internal": 0,
        "remainingBalance": 0
      };
      rec["transactionDate"] = rowArray[i][0].replace("/", "-", "g");
      rec["boughtAmount"] = parseInt(rowArray[i][5]);
      strBuff = convertZen2han(rowArray[i][6]);
      strBuff = strBuff.replace("，", "");
      strBuff = strBuff.replace("円", "");
      strBuff = strBuff.replace("割引対象優待後金額：", "");
      rec["payAmount"] = parseInt(strBuff);
      rec["detail"] = rowArray[i][1];
      var itemInfo = this.getItemInfo(rowArray[i][1]);
      rec["itemId"] = itemInfo["itemId"];
      
      if (rowArray[i][3] != "１回") {
        // TODO: 一回払いでないときはどんなデータになる？
      }
      this.cardTable.addNewRecord(rec);
      
    } else if (rowArray[i].length > 6 &&
      rowArray[i][6].match(/割引除外金額　　　：[０-９]+円/) != null ) {
      
      matched = rowArray[i][6].match(/割引除外金額　　　：([０-９]+)円/);
      this.cardTable.updateLastPayment(convertZen2han(matched[1]));
    } else if (rowArray[i][0] === "お支払日") {
      matched = rowArray[i][1].match(/(\d{4})\/(\d{2})\/\d{2}$/);
      payMonth = matched[1] + "-" + matched[2];
    }
    
  }
  this.cardTable.executeInsert();
};

SaisonCard.prototype.importDb = function(csvFile, userId) {
  this.userId = userId;
  this.cardId = this.cardTable.getCardId("セゾンカード", userId);

  NetUtil.asyncFetch(csvFile, this.onFileOpen.bind(this));
  
};


