export const convertNumbers = (number) => {
  const numberWithCommas = number.toLocaleString();
  const arr = numberWithCommas.split(",");
  
  if (arr.length === 5) {
      // Trillions
      return formatNumber(arr, 2, "T");
  } else if (arr.length === 4) {
      // Billions
      return formatNumber(arr, 2, "B");
  } else if (arr.length === 3) {
      // Millions
      return formatNumber(arr, 2, "M");
  } else if (arr.length === 2) {
      // Thousands
      return formatNumber(arr, 2, "K");
  } else {
      // Hundreds
      return numberWithCommas;
  }
};


const formatNumber = (arr, decimalPlaces, suffix) => {
  const decimalPart = arr[1].slice(0, 2);

  if (parseInt(decimalPart, 10) === 0) {
      // If all zeros after decimal, don't show decimals
      return arr[0] + suffix;
  } else {
      // Otherwise, show 2 decimal places
      return arr[0] + "." + decimalPart + suffix;
  }
};