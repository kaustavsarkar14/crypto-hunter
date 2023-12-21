export const modifyCoinObject = (data, currency) => {
    return {
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      image: data.image.large,
      desc: data.description.en,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      total_volume: data.market_data.total_volume.usd,
      current_price: data.market_data.current_price[currency.toLowerCase()],
      market_cap: data.market_data.market_cap.usd,
    };
  };