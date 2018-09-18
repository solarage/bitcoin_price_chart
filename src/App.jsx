import React, { Component } from 'react';
import moment from 'moment';
import logoBit from './bitcoin-graph.svg';
import './App.css';

import LineChart from './components/LineChart/LineChart';
import InfoBox from './components/InfoBox/InfoBox';
import ToolTip from './components/ToolTip/ToolTip';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingData: true,
      data: null,
      hoverLoc: null,
      activePoint: null
    }
  }

  componentDidMount() {
    const getData = () => {
      const url = 'https://api.coindesk.com/v1/bpi/historical/close.json';
      
      let status = (response) => {
        if(response.status !== 200) {
            return Promise.reject(new Error(response.statusText))
        }
        return Promise.resolve(response);
      } 

      fetch(url)
        .then(status)
        .then(response => response.json())
        .then((bitcoinData) => {
          const sortedData =[];
          let count = 0;

          for (let date in bitcoinData.bpi) {
            sortedData.push({
              date: moment(date).format('MMM DD'),
              price: bitcoinData.bpi[date].toLocaleString('us-EN', {style: 'currency', currency: 'USD'}),
              x: count,
              y: bitcoinData.bpi[date]
            });
            count++
          }
          this.setState({
            data: sortedData,
            fetchingData: false
          })
        })
        .catch(error => {
          console.error('error', error);
        });
    }

    getData();
  }

  handleChartHover(hoverLoc, activePoint) {
    this.setState({
      hoverLoc: hoverLoc,
      activePoint: activePoint
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logoBit} className="App-logo" alt="logo" />
        </header>
        <main className="App-body">
          <p className="App-title">Bitcoin Price Chart</p>
          <div className="info">
            { 
              !this.state.fetchingData ? 
              <InfoBox data={this.state.data} /> :
              null
            }
          </div>
          <div className="popup">
            { 
              this.state.hoverLoc ? 
              <ToolTip 
                hoverLoc={this.state.hoverLoc} 
                activePoint={this.state.activePoint} 
              /> :
              null
            }
          </div>
          <div className="chart">
            { 
              !this.state.fetchingData ? 
              <LineChart 
                data={this.state.data} 
                onChartHover={ (a,b) => this.handleChartHover(a,b)}
              /> :
              null
            }
          </div>
        </main>
        <footer className="App-footer">
          <div className="coindesk">Powered by <a href="http://www.coindesk.com/price/">CoinDesc</a></div>
        </footer>
      </div>
    );
  }
}

export default App;
