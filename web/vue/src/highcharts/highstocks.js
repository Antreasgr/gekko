import _ from 'lodash';
import * as Highcharts from 'highcharts/highstock'

export default function (_data, _trades, _height, _indicatorResults) {
    // console.log("trades: ", _trades);
    // console.log("trades: ", _indicatorResults);
    var dataLength = _data.length;

    const trades = _trades.map(t => {
        return [
            +moment.utc(t.date).toDate(),
            t.price,
            t.action
        ]
    });

    const ohlc = _data.map(c => {
        return [
            +moment.utc(c.start).toDate(),
            c.open,
            c.high,
            c.low,
            c.close
        ]
    });

    const volume = _data.map(c => {
        return [
            +moment.utc(c.start).toDate(),
            c.volume,
        ]
    });

    const vwp = _data.map(c => {
        return [
            +moment.utc(c.start).toDate(),
            c.vwp,
        ]
    });

    var sellflags = _trades.filter(c => c.action == "sell").map(c => {
        return {
            x: +moment.utc(c.date).toDate(),
            title: "sell",
            text: "sell at " + c.price
        }
    });

    var buyflags = _trades.filter(c => c.action == "buy").map(c => {
        return {
            x: +moment.utc(c.date).toDate(),
            title: "buy",
            text: "buy at " + c.price
        }
    });

    var indSeries = [];
    // 60% is for main chart, indicators have the other 40percent to share with volume
    var top = 0.6, height = 0.4, yAxes = [];
    if (_indicatorResults) {
        var indicatorEntries = Object.entries(_indicatorResults);
        height = 0.4 / (indicatorEntries.length + 1);
        for (let i = 0; i < indicatorEntries.length; i++) {
            var is = {
                name: indicatorEntries[i][0],
                data: indicatorEntries[i][1].map(r => { return [+moment.utc(r.date).toDate(), r.result ? r.result : 0] }),
                yAxis: i + 1
            };

            yAxes.push({
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: indicatorEntries[i][0]
                },
                top: ((top + (i * height)) * 100).toFixed(0) + '%',
                height: (height * 100).toFixed(0) + '%',
                offset: 0,
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            });

            indSeries.push(is);
        }
    }

    var series = [...indSeries, {
        type: 'candlestick',
        name: 'AAPL',
        data: ohlc,
        dataGrouping: false,
        id: "candleseries"
    },
    {
        name: 'vwp',
        data: vwp,
        id: 'vwpseries'
    },
    {
        type: 'column',
        name: 'Volume',
        data: volume,
        yAxis: indSeries.length + 1,
        dataGrouping: false
    },
    {
        type: "flags",
        data: sellflags,
        onSeries: 'candleseries',
        shape: 'circlepin',
        color: "#ff0000",
        width: 6
    },
    {
        type: "flags",
        data: buyflags,
        onSeries: 'candleseries',
        shape: 'circlepin',
        color: "#00ff00",
        width: 6
    }
    ];

    // create the chart
    Highcharts.stockChart('chart', {
        rangeSelector: {
            selected: 1
        },
        title: {
            text: 'AAPL Chart'
        },

        yAxis: [
            {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, 
            ...yAxes,
            {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: ((top + (indSeries.length * height)) * 100).toFixed(0) + '%',
                height: (height * 100).toFixed(0) + '%',
                offset: 0,
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }],

        tooltip: {
            split: true
        },
        series: series
    });
}