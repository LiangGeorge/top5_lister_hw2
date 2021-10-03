import jsTPS_Transaction from "../jsTPS.js"

/**
 * ChangeItem_Transaction
 * 
 * This class represents a transaction that updates the text
 * for a given item. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class ChangeItem_Transaction extends jsTPS_Transaction {
    constructor(changeItemCallback,id,initOldText, initNewText) {
        super();
        this.changeItemCallback = changeItemCallback;
        this.id = id;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        //this.model.changeItem(this.id, this.newText);
        this.changeItemCallback(this.id,this.newText);
    }
    
    undoTransaction() {
        //console.log(this)
        //this.model.changeItem(this.id, this.oldText);
        this.changeItemCallback(this.id,this.oldText)
    }
}