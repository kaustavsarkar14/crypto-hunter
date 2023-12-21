export default function getCoinPrices(id, days, priceType, currency) {
    return fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}&interval=daily`)
        .then(data => data.json())
        .then(data => data[priceType])
        .catch(err => console.log(err))
}