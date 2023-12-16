import { modifyCoinObject } from "./modifyCoinObject"

export default function getCoinDetails(id) {
    return fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
        .then(data => data.json())
        .then(data => {
            return modifyCoinObject(data)
        })
        .catch(err => console.log(err))
}