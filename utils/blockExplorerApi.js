import axios from 'axios';

// API endpoints for different testnets
const EXPLORER_APIS = {
  zetachain: {
    name: 'ZetaChain Testnet',
    url: 'https://zetachain-athens-3.blockscout.com/api/v2/addresses',
    txUrl: 'https://zetachain-athens-3.blockscout.com/tx',
    chainId: 7001,
    nativeCurrency: 'ZETA'
  },
  avalanche: {
    name: 'Avalanche Fuji',
    url: 'https://api-testnet.snowtrace.io/api',
    apiKey: 'YOUR_SNOWTRACE_API_KEY', 
    txUrl: 'https://testnet.snowtrace.io/tx',
    chainId: 43113,
    nativeCurrency: 'AVAX'
  },
  base: {
    name: 'Base Sepolia',
    url: 'https://api-sepolia.basescan.org/api',
    apiKey: 'BASESCAN_API_KEY', 
    txUrl: 'https://sepolia.basescan.org/tx',
    chainId: 84532,
    nativeCurrency: 'ETH'
  },
  bsc: {
    name: 'BSC Testnet',
    url: 'https://api-testnet.bscscan.com/api',
    apiKey: 'ETHERSCAN_API_KEY', 
    txUrl: 'https://testnet.bscscan.com/tx',
    chainId: 97,
    nativeCurrency: 'BNB'
  }
};

// Helper function to fetch transactions from a specific explorer
const fetchChainTransactions = async (address, chain) => {
  const config = EXPLORER_APIS[chain];
  if (!config) return [];

  try {
    let response;
    
    if (chain === 'zetachain') {
      // Blockscout API
      response = await axios.get(`${config.url}/${address}/transactions`, {
        params: {
          filter: 'to|from',
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          page: 1,
          offset: 10
        }
      });
      
      return (response.data.items || []).map(tx => ({
        hash: tx.hash,
        from: tx.from.hash,
        to: tx.to?.hash || '',
        value: tx.value,
        timestamp: tx.timestamp,
        status: tx.status === '1' ? 'success' : 'failed',
        chain: config.name,
        chainId: config.chainId,
        explorerUrl: `${config.txUrl}/${tx.hash}`,
        nativeCurrency: config.nativeCurrency
      }));
    } else {
      // Etherscan-compatible API (Snowtrace, Basescan, BscScan)
      response = await axios.get(config.url, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 10,
          sort: 'desc',
          apikey: config.apiKey
        }
      });

      return (response.data.result || []).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
        status: parseInt(tx.txreceipt_status) === 1 ? 'success' : 'failed',
        chain: config.name,
        chainId: config.chainId,
        explorerUrl: `${config.txUrl}/${tx.hash}`,
        nativeCurrency: config.nativeCurrency
      }));
    }
  } catch (error) {
    console.error(`Error fetching ${chain} transactions:`, error);
    return [];
  }
};

// Main function to fetch all transactions across all chains
export const fetchAllTransactions = async (address) => {
  if (!address) return [];
  
  const chains = Object.keys(EXPLORER_APIS);
  const allTxs = await Promise.all(
    chains.map(chain => fetchChainTransactions(address, chain))
  );
  
  // Flatten and sort all transactions by timestamp (newest first)
  return allTxs.flat().sort((a, b) => b.timestamp - a.timestamp);
};

// Get token transfer events (optional)
export const fetchTokenTransfers = async (address, chain) => {
  const config = EXPLORER_APIS[chain];
  if (!config || chain === 'zetachain') return []; // ZetaChain uses different API
  
  try {
    const response = await axios.get(config.url, {
      params: {
        module: 'account',
        action: 'tokentx',
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 10,
        sort: 'desc',
        apikey: config.apiKey
      }
    });

    return (response.data.result || []).map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      tokenSymbol: tx.tokenSymbol,
      tokenDecimal: tx.tokenDecimal,
      timestamp: parseInt(tx.timeStamp) * 1000,
      status: parseInt(tx.txreceipt_status) === 1 ? 'success' : 'failed',
      chain: config.name,
      chainId: config.chainId,
      explorerUrl: `${config.txUrl}/${tx.hash}`,
      isTokenTransfer: true,
      tokenName: tx.tokenName
    }));
  } catch (error) {
    console.error(`Error fetching ${chain} token transfers:`, error);
    return [];
  }
};
