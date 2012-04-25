//localized description for this extension
pref("extensions.{kmoney@kazhik.net}.description", "chrome://kmoney/locale/strings.properties");

pref("extensions.kmoney.autoBackup", "off");//on, off, prompt

//false = do not open any db on start, true = open last used db on start
pref("extensions.kmoney.openWithLastDb", true);
pref("extensions.kmoney.promptForLastDb", true);


//default extension for sqlite db files
pref("extensions.kmoney.sqliteFileExtensions", "sqlite");

//how many records to display when browsing and searching; -1 means all
pref("extensions.kmoney.displayNumRecords", 100);

//stores JSON object for MRU
pref("extensions.kmoney.jsonMruData", '{"meta":{"version":"1"},"size":10,"list":[]}');

