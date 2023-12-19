import convertDate from "./convertDate";

export default function settingChartData(setChartData, prices1, days, prices2) {
    if (prices2) {
        setChartData({
            labels: prices1.map(item => convertDate(item[0], days)),
            datasets: [{
                label: "Crypto 1",
                data: prices1.map(item => item[1]),
                borderColor: "#3a80e9",
                tension: 0.25,
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                label: "Crypto 2",
                data: prices2.map(item => item[1]),
                borderColor: "#61c96f",
                tension: 0.25,
                pointRadius: 0,
                yAxisID: 'y1',
            }]
        })
    }
    else {
        setChartData({
            labels: prices1.map(item => convertDate(item[0], days)),
            datasets: [{
                label: "price",
                data: prices1.map(item => item[1]),
                borderColor: "#3a80e9",
                tension: 0.25,
                pointRadius: 0,
                yAxisID: 'y',
            }]
        })
    }
}