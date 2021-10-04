import React from 'react';
import './App.css';
import jsTPS from './jsTPS.js'
// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'
import ChangeItemTransaction from './transactions/ChangeItem_Transaction.js'
import MoveItemTransaction from './transactions/MoveItem_Transaction.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        this.tps = new jsTPS();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            currentListHeldItem : null,
            currentListOverItem : null,
            listToDelete: null,
            hasUndo: false,
            hasRedo: false,
            canClose: false,
            canAdd: true,
            disableAllButtons: false,
        }
    }
    keyPressFunction = (e) =>{
        // console.log("Key Pressing")
        // console.log(e)
        if (e.ctrlKey && e.key === "y"){
            
            if (!this.state.disableAllButtons && this.state.hasRedo){
                this.redo();
            }
        }
        else if (e.ctrlKey && e.key === "z"){
            // console.log("fired")
            // console.log(e.ctrlKey)
            // console.log(e.keyCode)
            // console.log(this.state.disableAllButtons)
            // console.log(this.state.hasUndo)
            if (!this.state.disableAllButtons && this.state.hasUndo){
                this.undo();
            }
        }
        // console.log(e.ctrlKey)
        // console.log(e.keyCode)
    }
    componentDidMount(){
        //console.log("reached")
        window.addEventListener("keydown", this.keyPressFunction);
    }
    componentWillUnmount(){
        window.removeEventListener("keydown", this.keyPressFunction);
    }

    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            canAdd: false,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    renameItemRegular = (key,text) => {
        
        let newCurrentListItems = [...this.state.currentList.items]
            //Rename the item
            // console.log("Text: ",text)
            for (let i = 0; i < newCurrentListItems.length; i++){
                //console.log(key)
                if (key === i){
                    newCurrentListItems[i] = text;
                }
            }

            this.setState(prevState => ({
                currentList: {
                    ...prevState.currentList,
                    items: newCurrentListItems, 
                },
                sessionData: prevState.sessionData,
                hasUndo: true
            }),() => {
               
                //Make sure changes are saved to Local Storage 
                let list = this.db.queryGetList(this.state.currentList.key)
                //console.log(list)
                list.items = newCurrentListItems
                this.db.mutationUpdateList(list)
                //Don't touch session data because it should be the same
                //console.log(this.state)
                
            })
            
    }
    updateUndoRedoState = () =>{
        this.setState(prevState => ({
            hasRedo: this.tps.hasTransactionToRedo(),
            hasUndo: this.tps.hasTransactionToUndo(),
        }))
        
        // this.hasRedo = this.tps.hasTransactionToRedo;
        // this.hasUndo = this.tps.hasTransactionToUndo;
    }
    redo = () =>{
        //console.log("Redoing!!!!!")
        if (this.tps.hasTransactionToRedo){
            this.tps.doTransaction();
        }
        this.updateUndoRedoState();
        //Save changes to database 
        let list = this.db.queryGetList(this.state.currentList.key);
        this.db.mutationUpdateList(list);

    };

    undo = () =>{
        //console.log("Undoing!!!!")
        if (this.tps.hasTransactionToUndo){
            //console.log("Has Transaction to Undo So Undo")
            this.tps.undoTransaction();
        }
        this.updateUndoRedoState();
        //console.log(this.tps)
        //Save changes to database
        let list = this.db.queryGetList(this.state.currentList.key);
        this.db.mutationUpdateList(list);
    }

    renameItemCallback = (key, newName, oldName) => {
        //Find the one to remove (Copying stuff)
        if (newName !== oldName){
            let renameTransaction = new ChangeItemTransaction(this.renameItemRegular,key,oldName,newName);
            this.tps.addTransaction(renameTransaction);
            console.log(this.tps)
            
        }
    }

    itemHoldCallback = (itemKey) =>{
        
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            currentListHeldItem: itemKey,
            currentListOverItem: prevState.currentListOverItem
        }))
    }

    itemDragOverCallback = (overItemKey) =>{
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            currentListHeldItem: prevState.currentListHeldItem,
            currentListOverItem: overItemKey
        }))
    }

    itemDragLeaveCallback = () =>{
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            currentListHeldItem: prevState.currentListHeldItem,
            //Empty out the list over item if we leave it 
            currentListOverItem: null
        }))
    }
    itemSpliceIntoPlace = (oldIndex,targetIndex) =>{
        let newCurrentListItems = [...this.state.currentList.items];
        //Remove the element that we are currently Holding
        let removedArray = newCurrentListItems.splice(oldIndex,1);
        newCurrentListItems.splice(targetIndex,0,removedArray[0]);
        //console.log(newCurrentListItems)
        return newCurrentListItems;
    
    }
    itemSpliceCallback = (oldIndex,targetIndex) =>{
        let newCurrentListItems = this.itemSpliceIntoPlace(oldIndex,targetIndex);
        //console.log(...this.state.currentList)
        this.setState(prevState => ({
            currentList:{
                ...prevState.currentList,
                items: newCurrentListItems,
                
            },
            hasUndo: true,
            currentListHeldItem : null,
            currentListOverItem : null,
            sessionData: prevState.sessionData, 
        }), () => {
            //console.log("CURRENT STATE",this.state.currentList.items)
            let list = this.db.queryGetList(this.state.currentList.key)
            list.items = newCurrentListItems
            this.db.mutationUpdateList(list)
        })
    }

    itemDropCallback = () =>{
        if (this.state.currentListHeldItem !== this.state.currentListOverItem){
            let moveTransaction = new MoveItemTransaction(this.itemSpliceCallback,this.state.currentListHeldItem,this.state.currentListOverItem);
            this.tps.addTransaction(moveTransaction);
            //console.log(this.tps)
        
        }

    }
    renameList = (key, newName) => {
        if (this.state.currentList.name !== newName){
            let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
            // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
            for (let i = 0; i < newKeyNamePairs.length; i++) {
                let pair = newKeyNamePairs[i];
                if (pair.key === key) {
                    pair.name = newName;
                }
            }
            this.sortKeyNamePairsByName(newKeyNamePairs);

            // WE MAY HAVE TO RENAME THE currentList
            let currentList = this.state.currentList;
            if (currentList.key === key) {
                currentList.name = newName;
            }

            this.setState(prevState => ({
                currentList: prevState.currentList,
                sessionData: {
                    nextKey: prevState.sessionData.nextKey,
                    counter: prevState.sessionData.counter,
                    keyNamePairs: newKeyNamePairs
                }
            }), () => {
                // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
                // THE TRANSACTION STACK IS CLEARED
                let list = this.db.queryGetList(key);
                list.name = newName;
                this.db.mutationUpdateList(list);
                this.db.mutationUpdateSessionData(this.state.sessionData);
                this.tps.clearAllTransactions();
                this.updateUndoRedoState();
            });
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            canClose: true,
            canAdd: false,
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            this.tps.clearAllTransactions();
            this.updateUndoRedoState();
            // ANY AFTER EFFECTS?
            // console.log(key)
            // console.log("Can Close: ",this.state.canClose)
            // console.log("Disable All Buttons: ", this.state.disableAllButtons)
            // console.log(this.state.currentList)
        });
    }

    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData,
            currentListHeldItem : null,
            currentListOverItem : null,
            hasUndo: false,
            hasRedo: false,
            canClose: false,
            canAdd: true,
        }), () => {
            // ANY AFTER EFFECTS?
            this.tps.clearAllTransactions();
            
        });
    }
    deleteList = (listKNPair) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.setState(prevState =>({
            listToDelete: listKNPair
        }))
        this.showDeleteListModal();
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }

    executeDelete = () =>{
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        //console.log(this.state.listToDelete)
        let indexToRemove = null;
        
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === this.state.listToDelete.key) {
                indexToRemove = i
            }
        }

        //Decrement the keys of every element after the indexToRemove
        for(let i = indexToRemove + 1; i < newKeyNamePairs.length;i++){
            newKeyNamePairs[i].key -= 1
        }

        //Remove the keyname pair that isn't going to be there
        newKeyNamePairs.splice(indexToRemove,1);
        //console.log(newKeyNamePairs)
        if (this.state.currentList !== null && this.state.currentList.key === this.state.listToDelete.key){
            this.setState(prevState => ({
                currentList: null,
                canClose: false,
                sessionData: {
                    nextKey: prevState.sessionData.nextKey - 1,
                    counter: prevState.sessionData.counter - 1,
                    keyNamePairs: newKeyNamePairs,
                }
            }), () => {
                // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
                // THE TRANSACTION STACK IS CLEARED

                // let list = this.db.queryGetList(key);
                // list.name = newName;
                // this.db.mutationUpdateList(list);
                
                this.db.mutationUpdateSessionData(this.state.sessionData);
            });
        }else{
            this.setState(prevState => ({
                currentList: prevState.currentList,
                sessionData: {
                    nextKey: prevState.sessionData.nextKey - 1,
                    counter: prevState.sessionData.counter - 1,
                    keyNamePairs: newKeyNamePairs
                }
            }), () => {
                // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
                // THE TRANSACTION STACK IS CLEARED

                // let list = this.db.queryGetList(key);
                // list.name = newName;
                // this.db.mutationUpdateList(list);
                
                this.db.mutationUpdateSessionData(this.state.sessionData);
            });
        }
    }
    //All buttons disabled when editing list names or editing item names 
    toggleDisableButtons = () => {
        // console.log("Test")
        // console.log(this.state.canAdd)
        this.setState(prevState =>({
            disableAllButtons : !prevState.disableAllButtons
        }))
        // this.disableAllButtons = !this.disableAllButtons;
    }
    // setListToDeleteCallback(listKNPair){
    //     this.setState(prevState => ({
    //         listToDelete: listKNPair,
    //     }))
    // }
    render() {
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    hasUndo= {this.state.hasUndo}
                    hasRedo= {this.state.hasRedo}
                    canClose= {this.state.canClose}
                    disableAllButtons={this.state.disableAllButtons} 
                    />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    toggleDisableButtonsCallback={this.toggleDisableButtons}
                    disableAllButtons={this.state.disableAllButtons}
                    canAdd = {this.state.canAdd}
                    //setListToDeleteCallback={this.setListToDeleteCallback}
                />
                <Workspace
                    currentList={this.state.currentList}
                    //We need to pass this because it can be green
                    currentListOverItem={this.state.currentListOverItem}
                    currentListHeldItem={this.state.currentListHeldItem}
                    renameItemCallback={this.renameItemCallback} 
                    itemHoldCallback={this.itemHoldCallback}
                    itemDragOverCallback={this.itemDragOverCallback}
                    itemDragLeaveCallback={this.itemDragLeaveCallback}
                    itemDropCallback={this.itemDropCallback}
                    toggleDisableButtonsCallback={this.toggleDisableButtons}
                    />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    listKeyPair={this.state.listToDelete}
                    executeDeleteCallback={this.executeDelete}
                />
            </div>
        );
    }
}

export default App;
