export function formatNumber(num) {
  if (num === undefined || num === null) return 'N/A';
  
  // If it's the max uint256 value, return 'MAX' or '∞'
  const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
  if (num.toString() === maxUint256) {
    return '∞';
  }
  
  // If it's a very large number, use exponential notation
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (number > 1e6) {
    return number.toExponential(2);
  }
  
  // For regular numbers, format with 2 decimal places
  return number.toFixed(2);
}

export function formatHealthFactor(hf) {
  if (hf === undefined || hf === null) return 'N/A';
  
  const number = typeof hf === 'string' ? parseFloat(hf) : hf;
  
  // If it's the max uint256 value, return '∞' (infinite)
  const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
  if (hf.toString() === maxUint256) {
    return '∞';
  }
  
  // For health factors, we typically want 2 decimal places
  return number.toFixed(2);
}
