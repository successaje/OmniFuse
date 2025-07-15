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
    GATEWAY: '0x0c487a766110c85d301d96e33579c5b317fa4995',
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
};

// Common ZRC-20 token addresses on ZetaChain Athens testnet
export const ZRC20_TOKENS = {
  ZETA_TESTNET: {
    // These are example addresses - replace with actual ZRC-20 addresses
    USDC: '0x236b0de675cc8f46ae186897fccefe3370c9eded', // Example
    ETH: '0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe', // Example
    // Add more as needed
  },
};

// Pyth price feed IDs for assets
export const PYTH_PRICE_IDS = {
  // These are example IDs - replace with actual Pyth price feed IDs
  USDC: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  // Add more as needed
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