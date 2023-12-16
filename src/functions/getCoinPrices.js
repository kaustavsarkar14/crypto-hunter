export default function getCoinPrices(id, days) {
    return fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`)
        .then(data => data.json())
        .then(data => data.prices)
        .catch(err => console.log(err))
}