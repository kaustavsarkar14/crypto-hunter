import convertDate from "./convertDate";

export default function settingChartData(setChartData, prices1, days, prices2) {
    if (prices2) {
        setChartData({
            labels: prices1.map(item => convertDate(item[0], days)),
            datasets: [{
                label: "Crypto 1",
                data: prices1.map(item => item[1]),
                fill: false,
                borderColor: '#3a80e9',
                backgroundColor: 'rgba(58, 128, 233, 1)',
                tension: 0.25,
                borderWidth: 2,
                pointRadius: 0,
                yAxisID : "Crypto 1"
            },
            {
                label: "Crypto 2",
                data: prices2.map(item => item[1]),
                fill: false,
                borderColor: '#61c96f',
                backgroundColor: 'rgba(58, 128, 233, 1)',
                tension: 0.25,
                borderWidth: 2,
                pointRadius: 0,
                yAxisID : "Crypto 2"
            }]
        })
    }
    else {
        setChartData({
            labels: prices1.map(item => convertDate(item[0], days)),
            datasets: [{
                label: "price",
                data: prices1.map(item => item[1]),
                fill: false,
                borderColor: '#3a80e9',
                backgroundColor: 'rgba(58, 128, 233, 1)',
                tension: 0.25,
                borderWidth: 2,
                pointRadius: 0,
                yAxisID : "Crypto 1"
            }]
        })
    }
}