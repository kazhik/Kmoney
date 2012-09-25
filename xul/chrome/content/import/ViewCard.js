Components.utils.import("resource://gre/modules/NetUtil.jsm");

function ViewCard(db, cardTbl) {
  CreditCardImport.call(this, db, cardTbl);
}
ViewCard.prototype = Object.create(CreditCardImport.prototype);

ViewCard.prototype.onFileOpen = function(inputStream, status) {
  if (!Components.isSuccessCode(status)) {
    return;
  }

  var strBuff = "";
  
  strBuff = NetUtil.readInputStreamToString(inputStream, inputStream.available(),
    {"charset": "Shift_JIS"});

  var parser = new DOMParser();
  var htmlDoc;
  htmlDoc = parser.parseFromString(strBuff, "text/html"); 

  var payMonth = htmlDoc.getElementById("LblPayDte").textContent;
  payMonth = payMonth.replace(/年/g, "-");
  payMonth = payMonth.replace(/月\d+日/g, "");
  
  var elemTable = htmlDoc.getElementsByClassName("listtable2");
  if (elemTable.length === 0) {
    return;
  }
  
  var rowData = elemTable[0].getElementsByTagName("tr");
  if (rowData.length === 0) {
    return;
  }
  var columnData;
  var columnData2;
  var dataNo = 0;
  var newRecordArray = [];
  for (var i = 0; i < rowData.length; ++i) {
    columnData = rowData[i].getElementsByTagName("td");
    
    // カラム9個なら一段目とみなす
    if (columnData.length === 9) {
      var rec = {
        "transactionDate": "",
        "payAmount": 0,
        "payMonth" : payMonth,
        "boughtAmount": 0,
        "itemId": 0,
        "detail": "",
        "userId": this.userId,
        "cardId": this.cardId,
        "source": this.sourceType,
        "internal": 0,
        "remainingBalance": 0
      };

      dataNo++;
      var dateElem = htmlDoc.getElementById("RtUseInfoList__ctl" + dataNo + "_LblUseDte");
      rec["transactionDate"] = dateElem.textContent.replace(/\//g, "-");
      rec["detail"] = columnData[2].textContent.trim();
      var itemInfo = this.getItemInfo(rec["detail"]);
      if (itemInfo["itemId"] === undefined) {
        km_alert(km_getLStr("error.title"), km_getLStr("error.import.noConf"));
        return;
      }
      rec["itemId"] = itemInfo["itemId"];
      rec["internal"] = itemInfo["internal"];
      columnData2 = rowData[i].getElementsByTagName("th");
      rec["payAmount"] = columnData2[0].textContent.trim().replace(/,/g, "");
      
      // 二段目にある請求額（合計値）も取り出す
      columnData = rowData[i + 1].getElementsByTagName("td");
      rec["boughtAmount"] = columnData[0].textContent.trim().replace(/,/g, "");
      
      newRecordArray.push(rec);
    }
  }
  this.cardTable.executeInsert(newRecordArray);
  this.cardTable.load();
};

ViewCard.prototype.importDb = function(suicaHtmlFile, userId) {
  this.userId = userId;
  this.cardId = this.cardTable.getCardId("Viewカード", userId);
  this.loadSourceType("ビューカード");
  this.loadImportConf();

  NetUtil.asyncFetch(suicaHtmlFile, this.onFileOpen.bind(this));
  
};


