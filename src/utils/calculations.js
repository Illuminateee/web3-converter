export function getPriceFromTick(tick, decimals0, decimals1) {
  return Math.pow(1.0001, tick) * Math.pow(10, decimals1 - decimals0);
}

export function applyPriceImpact(amount, priceImpactPercentage) {
  return parseFloat(amount) * (1 + priceImpactPercentage / 100);
}

export function formatNumber(number, maxDecimals = 2) {
  return number.toLocaleString('en-US', {maximumFractionDigits: maxDecimals});
}