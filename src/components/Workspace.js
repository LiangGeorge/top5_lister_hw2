import React from "react";
import Item from "./Item";

export default class Workspace extends React.Component {
    render() {
        const {
            currentList
        } = this.props
        return (
            <div id="top5-workspace">
                <div id="workspace-edit">
                    <div id="edit-numbering">
                       
                        <div className="item-number">1.</div>
                        
                        <div className="item-number">2.</div>
                    
                        <div className="item-number">3.</div>
                        
                        <div className="item-number">4.</div>
                        

                        <div className="item-number">5.</div>
                    </div>
                    <div id="edit-items">
                        {currentList ? currentList.items.map((item) => (<Item key={item} itemName={item} />)) : null } 
                        {/* {currentList ? console.log(currentList.items) : null }  */}
                    </div>

                    
                </div>
            </div>
        )
    }
}