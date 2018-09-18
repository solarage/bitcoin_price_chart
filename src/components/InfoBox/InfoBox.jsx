import React, { Component } from 'react';
import moment from 'moment';
import './InfoBox.css';

class InfoBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPrice: null,
            monthChangeDol: null,
            monthChangePerc: null,
            updateAt: null
        }
    }

    componentDidMount() {
        this.getData = () => {
            const { data } = this.props;
            const url = 'https://api.coindesk.com/v1/bpi/currentprice.json';
            
            let status = (response) => {
                if(response.status !== 200) {
                    return Promise.reject(new Error(response.statusText))
                }
                return Promise.resolve(response);
            }

            fetch(url)
                .then(status)
                .then(response => response.json())
                .then(bitcoinData => {
                    const price = bitcoinData.bpi.USD.rate_float;
                    const changeDol = price -data[0].y;
                    const changePerc = (price - data[0].y) / data[0].y * 100;

                    this.setState({
                        currentPrice: bitcoinData.bpi.USD.rate_float,
                        monthChangeDol: changeDol.toLocaleString('us-EN', { style: 'currency', currency: 'USD' }),
                        monthChangePerc: changePerc.toFixed(2) + '%',
                        updateAt: bitcoinData.updated 
                    })
                })
                .catch((error) => {
                    console.error('error', error);
                });
        }

        this.getData();
        this.refresh = setInterval(() => this.getData(), 120000);
    }

    componentWillUnmount() {
        clearInterval(this.refresh);
    }

    render() {
        return(
            <div className="data-container">
                {
                    this.state.currentPrice ?
                    <div className="left box">
                        <div className="heading">
                            {this.state.currentPrice.toLocaleString('us-EN', { style: 'currency', currency: 'USD' })}
                        </div>
                        <div className="subtext">
                            {'Updated ' + moment(this.state.updateAt).fromNow()}
                        </div>
                    </div> :
                    null
                }
                {
                    this.state.currentPrice ?
                    <div className="middle box">
                        <div className="heading">{this.state.monthChangeDol}</div>
                        <div className="subtext">Change Since Last Month (USD)</div>
                    </div> :
                    null
                }
                <div className="right box">
                    <div className="heading">{this.state.monthChangePerc}</div>
                    <div className="subtext">Change Since Last Month (%)</div>
                </div>
            </div>
        )
    }
}

export default InfoBox;

