import React, { Component } from 'react';

import './LineChart.css';

class LineChart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hoverLoc: null,
            activePoint: null
        }
    }

    getMinX() {
        const { data } = this.props;
        return data[0].x;
    }

    getMaxX() {
        const { data } = this.props;
        return data[data.length - 1].x;
    }

    getMinY() {
        const { data } = this.props;
        return data.reduce( (min, cur) => cur.y < min ? cur.y : min, data[0].y);
    }

    getMaxY() {
        const { data } = this.props;
        return data.reduce( (max, cur) => cur.y > max ? cur.y : max, data[0].y);
    }

    // get SVG coordinates

    getSvgX(x) {
        const { svgWidth, yLabelSize } = this.props;
        return yLabelSize + (x / this.getMaxX() * (svgWidth - yLabelSize));
    }

    getSvgY(y) {
        const { svgHeight, xLabelSize } = this.props;
        return ((svgHeight - xLabelSize) * this.getMaxY() - (svgHeight - xLabelSize) * y) / (this.getMaxY() - this.getMinY());
    }

    // draw SVG path

    drawPath() {
        const { data, color } = this.props;
        let pathD = "M " + this.getSvgX(data[0].x) + " " + this.getSvgY(data[0].y) + " ";

        data.map((point, i) => {
            return pathD +=  " L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y) + " ";
        });
        
        return (
            <path className="linechart_path" d={pathD} style={ {stroke: color} } />
        );
    }

    // draw grid axis

    drawAxis() {
        const { yLabelSize } = this.props;
        const minX = this.getMinX(), maxX = this.getMaxX();
        const minY = this.getMinY(), maxY = this.getMaxY();

        return(
            <g className="linechart_axis">
                <line 
                    x1={this.getSvgX(minX) - yLabelSize} y1={this.getSvgY(minY)}
                    x2={this.getSvgX(maxX)} y2={this.getSvgY(minY)}
                    strokeDasharray="5"
                />
                <line 
                    x1={this.getSvgX(minX)} y1={this.getSvgY(minY)}
                    x2={this.getSvgX(minX)} y2={this.getSvgY(maxY)}
                />
                <line 
                    x1={this.getSvgX(minX) - yLabelSize} y1={this.getSvgY(maxY)}
                    x2={this.getSvgX(maxX)} y2={this.getSvgY(maxY)}
                    strokeDasharray="5"
                />
            </g>
        );
    }    

    // draw area

    drawArea() {
        const { data, color } = this.props;
        let pathD = "M " + this.getSvgX(data[0].x) + " " + this.getSvgY(data[0].y) + " ";

        data.map((point, i) => {
            return pathD += " L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y) + " ";
        });

        pathD += "L " + this.getSvgX(this.getMaxX()) + " " + this.getSvgY(this.getMinY()) + " " + "L " + this.getSvgX(this.getMinX()) + " " + this.getSvgY(this.getMinY()) + " ";

        return (
            <path className="linechart_area" d={pathD} style={ {stroke: color} } />
        );
    }

    // draw labels

    drawLabels() {
        const { svgHeight, svgWidth, xLabelSize, yLabelSize } = this.props;
        const padding = 5;

        return(
            <g className='linechart_label'>
                {/* Y AXIS LABELS */}
                <g transform={`translate(${yLabelSize/2}, 20)`} textAnchor="middle">
                    <text>
                        {this.getMaxY().toLocaleString('us-EN', { style: 'currency', currency: 'USD'})}
                    </text>
                </g>
                <g transform={`translate(${yLabelSize/2}, ${svgHeight - xLabelSize - padding})`} textAnchor="middle">
                    <text>
                        {this.getMinY().toLocaleString('us-EN', { style: 'currency', currency: 'USD'})}
                    </text>
                </g>
                {/* X AXIS LABELS */}
                <text transform={`translate(${yLabelSize}, ${svgHeight})`} textAnchor="start">
                    {this.props.data[0].date}
                </text>
                <text transform={`translate(${svgWidth}, ${svgHeight})`} textAnchor="end">
                    {this.props.data[this.props.data.length - 1].date}
                </text>
            </g>
        )
    }

    // find closest point to mouse

    getCoords(e) {
        const { data, svgWidth, yLabelSize } = this.props;
        const svgLocation = document.querySelectorAll('.linechart')[0].getBoundingClientRect();
        const adjustment = (svgLocation.width - svgWidth) / 2; //padding
        const relativeLoc = e.clientX - svgLocation.left - adjustment;

        let svgData = [];
        data.map((point, i) => {
            return svgData.push({
                svgX: this.getSvgX(point.x),
                svgY: this.getSvgY(point.y),
                date: point.date,
                price: point.price
            });
        });
        
        let closestPoint = {};
        for (let i=0, c = svgWidth; i < svgData.length; i++) {
            if(Math.abs(svgData[i].svgX - this.state.hoverLoc) <= c) {
                c = Math.abs(svgData[i].svgX - this.state.hoverLoc);
                closestPoint = svgData[i];
            }
        }

        if(relativeLoc - yLabelSize < 0) {
            this.stopHover();
        } else {
            this.setState({
                hoverLoc: relativeLoc,
                activePoint: closestPoint
            })
            this.props.onChartHover(relativeLoc, closestPoint);
        }
    }

    // stop hover

    stopHover() {
        this.setState({
            hoverLoc: null,
            activePoint: null
        })
        this.props.onChartHover(null, null);
    }

    // make active point

    makeActivePoint() {
        const { color, pointRadius } = this.props;
        return(
            <circle 
                className="linechart_point"
                style={{stroke: color}}
                r={pointRadius}
                cx={this.state.activePoint.svgX}
                cy={this.state.activePoint.svgY}
            />
        )
    }

    // to do

    createLine() {
        const { svgHeight, xLabelSize } = this.props;
        return(
            <line className="hoverLine"
                x1={this.state.hoverLoc} y1={1}
                x2={this.state.hoverLoc} y2={svgHeight - xLabelSize}
            />
        )
    }

    render() {
        const { svgHeight, svgWidth } = this.props;

        return(

            <svg 
                width={svgWidth} 
                height={svgHeight} 
                className="linechart" 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                onMouseMove={ (e) => this.getCoords(e) }
                onMouseLeave={ () => this.stopHover() }
            >
                <g>
                    {this.drawPath()}
                    {this.drawArea()}
                    {this.drawAxis()}
                    {this.drawLabels()}
                    {this.state.hoverLoc ? this.createLine() : null}
                    {this.state.hoverLoc ? this.makeActivePoint() : null}
                </g>
            </svg>
        )
    }

}

// DEFAULT PROPS

LineChart.defaultProps = {
    data: [],
    color: '#2196F3',
    pointRadius: 5,
    svgWidth: 900,
    svgHeight: 300,
    xLabelSize: 20,
    yLabelSize: 80,
}

export default LineChart;