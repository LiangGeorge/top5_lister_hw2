import React from "react";

export default class EditToolbar extends React.Component {
    keyPressFunction = (e) =>{
        if (e.ctrlKey && e.keyCode === 89){
            if (!this.props.disableAllButtons && this.props.hasRedo){
                this.props.redoCallback();
            }
        }
        if (e.ctrlKey && e.keyCode === 90){
            if (!this.props.disableAllButtons && this.props.hasRedo){
                this.props.undoCallback();
            }
        }
        // console.log(e.ctrlKey)
        // console.log(e.keyCode)
    }
    componentDidMount(){
        //console.log("reached")
        //document.addEventListener("keydown", this.keyPressFunction, false);
    }
    componentWillUnmount(){
        //document.removeEventListener("keydown", this.keyPressFunction, false);
    }
    render() {
        // console.log(this.props)
        // console.log("Can Close: ",this.props.canClose)
        // console.log("Disable All Buttons: ", this.props.disableAllButtons)
        return (
            <div id="edit-toolbar">
                <button
                    id='undo-button' 
                    className={"top5-button " + ((this.props.disableAllButtons) ?  "disabled top5-button-disabled" : (this.props.hasUndo ? "": "disabled top5-button-disabled"))}
                    onClick={() => this.props.undoCallback()} disabled={((this.props.disableAllButtons) ?  true : (this.props.hasUndo ? false: true))}
                   >
                        &#x21B6;
                </button>
                <button
                    id='redo-button'
                    className={"top5-button " + ((this.props.disableAllButtons) ?  "disabled top5-button-disabled" : (this.props.hasRedo ? "": "disabled top5-button-disabled"))}
                    onClick={()=> this.props.redoCallback()} disabled={((this.props.disableAllButtons) ?  true : (this.props.hasRedo ? false: true))} >
                        &#x21B7;
                </button>
                <button
                    id='close-button'
                    className={"top5-button " + ((this.props.disableAllButtons) ?  "disabled top5-button-disabled" : (this.props.canClose ? "": "disabled top5-button-disabled"))}
                    onClick={()=> this.props.closeCallback()} disabled={((this.props.disableAllButtons) ?  true : (this.props.canClose ? false: true))} >
                        &#x24E7;
                </button>
            </div>
        )
    }
}