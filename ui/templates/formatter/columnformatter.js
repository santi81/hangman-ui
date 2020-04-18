sap.ui.core.Element.extend("hangman.formatter.columnformatter", {
colorFormatter:function(value) {
    this.addStyleClass("mybackground_listitem");
    return value;
}
});
Formatter = new hangman.formatter.columnformatter();