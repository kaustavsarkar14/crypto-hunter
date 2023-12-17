import convertDate from "./convertDate";

export default function settingChartData(setChartData, prices, days) {
    setChartData({
        labels: prices.map(item => convertDate(item[0], days)),
        datasets: [{
            label: "price",
            data: prices.map(item => item[1]),
            fill: false,
            borderColor: '#3a80e9',
            backgroundColor: 'rgba(58, 128, 233, 1)',
            tension: 0.25,
            borderWidth: 2,
            pointRadius: 0,
        }]
    })
}