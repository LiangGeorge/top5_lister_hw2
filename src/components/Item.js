import React from "react";


export default class Item extends React.Component{
    constructor(props){
        super(props);
        //console.log(props)

        this.state = {
          
            text: this.props.itemName,
            editActive: false,
        };
    }
    
    handleOnDrag = (event,itemNum) =>{
        event.preventDefault();
        event.stopPropagation();
        //console.log("Holding Item: " + itemNum);
        this.props.itemHoldCallback(itemNum);
      
        // console.log(event)
    }

    handleOnDragOver = (event,itemNum) =>{
        event.preventDefault();
        event.stopPropagation();
        //console.log("Dragging Over: " + itemNum);
        this.props.itemDragOverCallback(itemNum);

    }
    handleOnDrop = (event)=>{
        event.preventDefault();
        event.stopPropagation();
        //console.log("Dropped");
        this.props.itemDropCallback();
    }
    handleOnDragLeave = (event,itemNum)=>{
        event.preventDefault();
        event.stopPropagation();
        this.props.itemDragLeaveCallback(itemNum)
    }
    handleDoubleClick = () => {
        this.handleToggleEdit();
    }
    handleToggleEdit = () =>{
        this.setState({
            editActive: !this.state.editActive
        })
    }


    //Preserve the state at the top level unless absolutely necessary to change aka pressing Enter or onBlur 
    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }

    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = () => {
        let key = this.props.itemNum;
        //console.log(this.state)
        let textValue = this.state.text;
        console.log("Item handleBlur: " + textValue);
        //Alter the name in memory
        //Pass in the key for which item to change, get the local state text, get original text 
        this.props.renameItemCallback(key, textValue, this.props.itemName);
        this.handleToggleEdit();
    }

    render(){
        if (this.state.editActive){
            return (
                <input className="top5-item" type="text"
                onKeyPress={(e) => this.handleKeyPress(e)}
                onBlur={() => this.handleBlur()}
                onChange={(e) => this.handleUpdate(e)}
                defaultValue={this.props.itemName}
                autoFocus/>
            )
        }else{
            //console.log(this.props)
            //console.log(this.props)
            if (this.props.currentListOverItem !== null && this.props.itemNum === this.props.currentListOverItem && this.props.currentListOverItem !== this.props.currentListHeldItem){
                //console.log(this.props.currentListOverItem)
                return (
                    <div id = {"item-"+this.props.itemNum} className="top5-item top5-item-dragged-to" 
                    onDoubleClick={()=>this.handleDoubleClick()}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={(e)=>this.handleOnDragLeave(e,this.props.itemNum)}
                    onDrop={(e)=>this.handleOnDrop(e)}
                    >
                    {this.props.itemName}
                    </div>
                )
            }
            else{
                return (<div draggable="true" id = {"item-"+this.props.itemNum} className="top5-item" 
                    onDoubleClick={()=>this.handleDoubleClick()}
                    onDrag={(e)=>this.handleOnDrag(e,this.props.itemNum)}
                    onDragOver={(e) => this.handleOnDragOver(e,this.props.itemNum)}
                    >
                    {this.props.itemName}
                    </div>
                )
            }
        }
        
    
        
    }
}