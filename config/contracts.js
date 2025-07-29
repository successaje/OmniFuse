// Contract addresses for deployed OmniFuse contracts
export const CONTRACT_ADDRESSES = {
  // ZetaChain Athens Testnet
  ZETA_TESTNET: {
    OMNIVAULT: '0x7b65E735F1b43102f672Dc04B6E33a424a955c13',
    GATEWAY: '0x6c533f7fe93fae114d0954697069df33c9b74fd7',
    PYTH: '0x0708325268dF9F66270F1401206434524814508b',
  },
  // Base Sepolia Testnet
  BASE_SEPOLIA: {
    OMNIVEXECUTOR: '0xFC6F253F59eD5D63b7db932b51Fa99c2e99D4145',
    GATEWAY: '0x0c487a766110c85d301d96e33579c5b317fa4995', // updated to provided address
  },
  // Avalanche Fuji Testnet
  AVALANCHE_FUJI: {
    OMNIVEXECUTOR: '0x857a55F93d14a348003356A373D2fCc926b18A7E',
    GATEWAY: '0x0dA86Dc3F9B71F84a0E97B0e2291e50B7a5df10f',
  },
};

// Network configurations
export const NETWORKS = {
  ZETA_TESTNET: {
    id: 7001,
    name: 'ZetaChain Athens Testnet',
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    explorer: 'https://zetachain-testnet.blockscout.com',
    nativeCurrency: {
      name: 'ZETA',
      symbol: 'ZETA',
      decimals: 18,
    },
  },
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia Testnet',
    rpcUrl: 'https://sepolia.base.org',
    explorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  AVALANCHE_FUJI: {
    id: 43113,
    name: 'Avalanche Fuji',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://testnet.snowtrace.io',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
  },
};

// Common ZRC-20 token addresses on ZetaChain Athens testnet
export const ZRC20_TOKENS = {
  ZETA_TESTNET: {
    
    USDC: '0x236b0de675cc8f46ae186897fccefe3370c9eded', 
    ETH: '0x236b0DE675cC8F46AE186897fCCeFe3370C9eDeD', 
    
  },
};

// Pyth price feed IDs for assets
export const PYTH_PRICE_IDS = {
  
  USDC: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  BSCUSD: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
  AVAXUSD: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
  
};

// Cross-chain configuration
export const CROSS_CHAIN_CONFIG = {
  // Chain IDs for cross-chain operations
  CHAIN_IDS: {
    ZETA_TESTNET: 7001,
    BASE_SEPOLIA: 84532,
    ETHEREUM_SEPOLIA: 11155111,
    BSC_TESTNET: 97,
    AVALANCHE_FUJI: 43113,
  },
  // Default gas limits for cross-chain calls
  DEFAULT_GAS_LIMITS: {
    SUPPLY: 500000,
    BORROW: 500000,
    REPAY: 500000,
    WITHDRAW: 500000,
    LIQUIDATE: 500000,
  },
};

// Asset configuration for cross-chain assets
export const ASSETS = [
  {
    symbol: "USDC.FUJI",
    type: "ERC20",
    decimals: 6,
    zrc20: {
      address: "0x8344d6f84d26f998fa070BbEA6D2E15E359e2641",
      chain: "ZETA_TESTNET",
    },
    erc20: {
      address: "0x5425890298aed601595a70AB815c96711a31Bc65",
      chain: "AVALANCHE_FUJI",
    },
  },
  {
    symbol: "USDC.BSC",
    type: "ERC20",
    decimals: 6,
    zrc20: {
      address: "0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7",
      chain: "ZETA_TESTNET",
    },
    erc20: {
      address: "0x64544969ed7EBf5f083679233325356EbE738930",
      chain: "BSC_TESTNET",
    },
  },
  {
    symbol: "ETH.BASESEPOLIA",
    type: "Gas",
    decimals: 18,
    zrc20: {
      address: "0x236b0DE675cC8F46AE186897fCCeFe3370C9eDeD",
      chain: "ZETA_TESTNET",
    },
    erc20: null, // Native gas, not ERC20
  },
];

// Helper function to get contract address by network and contract type
export const getContractAddress = (network, contractType) => {
  const networkConfig = CONTRACT_ADDRESSES[network];
  if (!networkConfig) {
    throw new Error(`Network ${network} not configured`);
  }
  
  const address = networkConfig[contractType];
  if (!address) {
    throw new Error(`Contract ${contractType} not found for network ${network}`);
  }
  
  return address;
};

// Helper function to get network configuration
export const getNetworkConfig = (network) => {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Network ${network} not configured`);
  }
  return config;
};

// Helper function to get ZRC-20 token address
export const getZRC20Address = (network, token) => {
  const tokens = ZRC20_TOKENS[network];
  if (!tokens) {
    throw new Error(`Network ${network} not configured for ZRC-20 tokens`);
  }
  
  const address = tokens[token];
  if (!address) {
    throw new Error(`Token ${token} not found for network ${network}`);
  }
  
  return address;
};

// Helper function to get Pyth price feed ID
export const getPythPriceId = (token) => {
  const priceId = PYTH_PRICE_IDS[token];
  if (!priceId) {
    throw new Error(`Pyth price feed ID not found for token ${token}`);
  }
  return priceId;
}; 

// Helper to get asset config by symbol and network
export function getAssetConfig(symbol, network) {
  return ASSETS.find(
    (asset) =>
      asset.symbol === symbol &&
      (asset.erc20?.chain === network || asset.zrc20.chain === network)
  );
} 