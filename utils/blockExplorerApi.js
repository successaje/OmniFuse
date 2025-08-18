import axios from 'axios';

// API endpoints for different testnets
const EXPLORER_APIS = {
  zetachain: {
    name: 'ZetaChain Testnet',
    url: 'https://zetachain-athens-3.blockscout.com/api/v2/addresses',
    txUrl: 'https://zetachain-athens-3.blockscout.com/tx',
    chainId: 7001,
    nativeCurrency: 'ZETA',
    type: 'blockscout'
  },
  avalanche: {
    name: 'Avalanche Fuji',
    url: 'https://api-testnet.snowtrace.io/api',
    apiKey: process.env.NEXT_PUBLIC_SNOWTRACE_API_KEY || 'YOUR_SNOWTRACE_API_KEY',
    txUrl: 'https://testnet.snowtrace.io/tx',
    chainId: 43113,
    nativeCurrency: 'AVAX',
    type: 'etherscan'
  },
  base: {
    name: 'Base Sepolia',
    url: 'https://api-sepolia.basescan.org/api',
    apiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || 'YOUR_BASESCAN_API_KEY',
    txUrl: 'https://sepolia.basescan.org/tx',
    chainId: 84532,
    nativeCurrency: 'ETH',
    type: 'etherscan'
  },
  bsc: {
    name: 'BSC Testnet',
    url: 'https://api-testnet.bscscan.com/api',
    apiKey: process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || 'YOUR_BSCSCAN_API_KEY',
    txUrl: 'https://testnet.bscscan.com/tx',
    chainId: 97,
    nativeCurrency: 'BNB',
    type: 'etherscan'
  }
};

// Helper function to fetch transactions from a specific explorer
const fetchChainTransactions = async (address, chain) => {
  const config = EXPLORER_APIS[chain];
  if (!config) return [];

  try {
    let transactions = [];
    
    // 1. Fetch native token transactions
    if (config.type === 'blockscout') {
      // Blockscout API (ZetaChain)
      const response = await axios.get(`${config.url}/${address}/transactions`, {
        params: {
          filter: 'to|from',
          startblock: 0,
          endblock: 99999999,
          sort: 'desc',
          page: 1,
          offset: 10
        },
        timeout: 10000 // 10 second timeout
      });
      
      transactions = (response.data.items || []).map(tx => ({
        hash: tx.hash,
        from: tx.from?.hash || tx.from_address || '',
        to: tx.to?.hash || tx.to_address || '',
        value: tx.value || '0',
        timestamp: new Date(tx.timestamp || Date.now()).getTime(),
        status: tx.status === '1' || tx.status === '0x1' ? 'success' : 'failed',
        chain: config.name,
        chainId: config.chainId,
        explorerUrl: `${config.txUrl}/${tx.hash}`,
        nativeCurrency: config.nativeCurrency,
        tokenSymbol: config.nativeCurrency,
        tokenDecimal: 18
      }));
    } else {
      // Etherscan-compatible API (Base, BSC, Avalanche)
      const [txResponse, tokenTxResponse] = await Promise.allSettled([
        // Native token transfers
        axios.get(config.url, {
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
          },
          timeout: 10000
        }),
        // Token transfers
        axios.get(config.url, {
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
          },
          timeout: 10000
        })
      ]);

      // Process native transactions
      const nativeTxs = txResponse.status === 'fulfilled' && txResponse.value.data.result 
        ? txResponse.value.data.result.map(tx => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            timestamp: parseInt(tx.timeStamp) * 1000,
            status: parseInt(tx.txreceipt_status) === 1 ? 'success' : 'failed',
            chain: config.name,
            chainId: config.chainId,
            explorerUrl: `${config.txUrl}/${tx.hash}`,
            nativeCurrency: config.nativeCurrency,
            tokenSymbol: config.nativeCurrency,
            tokenDecimal: 18
          }))
        : [];

      // Process token transfers
      const tokenTxs = tokenTxResponse.status === 'fulfilled' && tokenTxResponse.value.data.result 
        ? tokenTxResponse.value.data.result.map(tx => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            timestamp: parseInt(tx.timeStamp) * 1000,
            status: parseInt(tx.txreceipt_status) === 1 ? 'success' : 'failed',
            chain: config.name,
            chainId: config.chainId,
            explorerUrl: `${config.txUrl}/${tx.hash}`,
            nativeCurrency: config.nativeCurrency,
            tokenSymbol: tx.tokenSymbol || 'TOKEN',
            tokenDecimal: parseInt(tx.tokenDecimal) || 18
          }))
        : [];

      transactions = [...nativeTxs, ...tokenTxs];
    }

    return transactions;
  } catch (error) {
    console.error(`Error fetching ${chain} transactions:`, error);
    return [];
  }
};

// Main function to fetch all transactions across all chains
export const fetchAllTransactions = async (address) => {
  if (!address) return [];
  
  const chains = ['zetachain', 'base', 'avalanche', 'bsc']; // Define the order of chains
  
  try {
    // Fetch transactions from all chains in parallel
    const allTxs = await Promise.all(
      chains.map(chain => 
        fetchChainTransactions(address, chain).catch(error => {
          console.error(`Error fetching ${chain} transactions:`, error);
          return []; // Return empty array if a chain fails
        })
      )
    );
    
    // Flatten, filter out failed transactions, and sort by timestamp (newest first)
    return allTxs
      .flat()
      .filter(tx => tx && tx.hash) // Ensure valid transactions
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error in fetchAllTransactions:', error);
    return [];
  }
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
