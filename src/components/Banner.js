import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        const { title} = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar  hasUndo= {this.props.hasUndo}
                    hasRedo= {this.props.hasRedo}
                    canClose= {this.props.canClose}
                    disableAllButtons={this.props.disableAllButtons} />
            </div>
        );
    }
}