import jsTPS_Transaction from "../jsTPS.js"
/**
 * MoveItem_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class MoveItem_Transaction extends jsTPS_Transaction {
    constructor(spliceCallback,initOld, initNew) {
        super();
        this.oldItemIndex = initOld;
        this.newItemIndex = initNew;
        this.spliceCallback = spliceCallback
    }

    doTransaction() {
        //this.model.moveItem(this.oldItemIndex, this.newItemIndex);
        this.spliceCallback(this.oldItemIndex,this.newItemIndex)

    }
    
    undoTransaction() {
        
        this.spliceCallback(this.newItemIndex,this.oldItemIndex)
    }
}