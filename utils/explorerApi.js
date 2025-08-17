import axios from 'axios';

const ZETACHAIN_API = 'https://api-testnet.zetachain.io/api';

export const fetchTransactionsByAddress = async (address) => {
  try {
    const response = await axios.get(`${ZETACHAIN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc`);
    
    if (response.data.status === '1') {
      return response.data.result.map(tx => ({
        id: tx.hash,
        type: getTransactionType(tx, address),
        asset: 'ZETA', // Default, can be parsed from input data if needed
        chain: 'ZetaChain',
        amount: parseFloat(ethers.formatEther(tx.value || '0')),
        timestamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
        status: parseInt(tx.txreceipt_status) === 1 ? 'completed' : 'failed',
        txHash: tx.hash,
        from: tx.from,
        to: tx.to
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Helper to determine transaction type
const getTransactionType = (tx, userAddress) => {
  // This is a simplified version - you'll need to adjust based on your contract interactions
  if (tx.to?.toLowerCase() === userAddress.toLowerCase()) {
    return 'receive';
  } else if (tx.from?.toLowerCase() === userAddress.toLowerCase()) {
    return 'send';
  }
  return 'contract';
};
