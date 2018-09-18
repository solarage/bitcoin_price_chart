import React, { Component } from 'react';
import './ToolTip.css';

class ToolTip extends Component {

    render() {
        const { hoverLoc, activePoint } = this.props;
        const svgLocation = document.querySelectorAll('.linechart')[0].getBoundingClientRect();
        
        let placementStyles = {};
        let width = 100;
        placementStyles.width = width + 'px';
        placementStyles.left = hoverLoc + svgLocation.left - (width / 2);

        return(
            <div className="hover-block" style={ placementStyles }>
                <div className="date">{ activePoint.date }</div>
                <div className="price">{ activePoint.price }</div>
            </div>
        )
    }
}

export default ToolTip;

