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
    handleClick = (event) => {
        if (event.detail === 2){
            this.handleToggleEdit(event);
        }
    }
    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
    }
    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = () => {
        let key = this.props.itemName;
        let textValue = this.state.text;
        console.log("Item handleBlur: " + textValue);
        //Alter the name in memory
        // this.props.renameItemCallback(key, textValue);
        this.handleToggleEdit();
    }

    render(){
        if (this.state.editActive){
            return (
                <input className="top5-item" type="text"
                onKeyPress={this.handleKeyPress}
                onBlur={this.handleBlur}
                onChange={this.handleUpdate}
                defaultValue={this.state.text}
                />
            )
        }else{
            return <div className="top5-item" onClick={this.handleClick}>
                {this.state.text}
                </div>
        }
        
        //return <div></div>
        
    }
}