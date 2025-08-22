import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { useAccount, useDisconnect } from 'wagmi';
import { ethers } from 'ethers';
import { formatHealthFactor } from '../utils/format';
import LandingHeader from '../components/LandingHeader';
import { useOmniFuse } from '../hooks/useOmniFuse';
import AssetNetworkSelector from '../components/AssetNetworkSelector';
import { contractService } from '../services/contractService';
import { fetchAllTransactions } from '../utils/blockExplorerApi';
import dynamic from 'next/dynamic';
import { avaxData } from '../alchemy-sdk-script';

// Dynamically import PortfolioChart with no SSR to avoid window is not defined errors
const PortfolioChart = dynamic(
  () => import('../components/PortfolioChart'),
  { ssr: false }
);

// alchemy history api integration


// Helper function to format user portfolio data
const formatUserPortfolio = (userPosition, positions = []) => {
  if (!userPosition) {
    return {
      totalValue: 0,
      totalBorrowed: 0,
      netWorth: 0,
      healthFactor: 0,
      activePositions: 0,
      chains: []
    };
  }

  const collateralUsd = parseFloat(ethers.formatUnits(userPosition.collateralUsd, 18));
  const debtUsd = parseFloat(ethers.formatUnits(userPosition.debtUsd, 18));
  const healthFactor = parseFloat(ethers.formatUnits(userPosition.healthFactor, 18));
  
  // Get unique chains from positions
  const chains = [...new Set(positions.map(pos => pos.chain))];
  
  // Calculate active positions (positions with supplied or borrowed amount > 0)
  const activePositions = positions.filter(pos => 
    parseFloat(ethers.formatUnits(pos.supplied, 18)) > 0 || 
    parseFloat(ethers.formatUnits(pos.borrowed, 18)) > 0
  ).length;

  return {
    totalValue: collateralUsd,
    totalBorrowed: debtUsd,
    netWorth: collateralUsd - debtUsd,
    healthFactor: healthFactor,
    activePositions: activePositions,
    chains: chains.length > 0 ? chains : ['ZetaChain']
  };
};

// Helper to get asset icon
const getAssetIcon = (asset) => {
  const icons = {
    'USDC': '/logos/usd-coin-usdc-logo.png',
    'USDT': '/logos/tether-usdt-logo.png',
    'WETH': '/logos/ethereum-eth-logo.png',
    'WBTC': '/logos/wrapped-bitcoin-wbtc-logo.png',
    'ZETA': '/logos/zetachain.png',
    'SOL': '/logos/solana-sol-logo.png',
    'AVAX': '/logos/avalanche-avax-logo.png',
    'MATIC': '/logos/polygon-matic-logo.png',
    'BNB': '/logos/bnb-bnb-logo.png',
    'ARB': '/logos/arbitrum-arb-logo.png',
    'OP': '/logos/optimism-op-logo.png',
    'FTM': '/logos/fantom-ftm-logo.png'
  };
  return icons[asset] || '/logos/ethereum-eth-logo.png';
};

// Helper to get chain icon
const getChainIcon = (chain) => {
  const icons = {
    'Ethereum': '/logos/ethereum-eth-logo.png',
    'ZetaChain': '/logos/zetachain.png',
    'Avalanche': '/logos/avalanche-avax-logo.png',
    'Solana': '/logos/solana-sol-logo.png',
    'Polygon': '/logos/polygon-matic-logo.png',
    'BNB Chain': '/logos/bnb-bnb-logo.png',
    'Arbitrum': '/logos/arbitrum-arb-logo.png',
    'Optimism': '/logos/optimism-op-logo.png',
    'Fantom': '/logos/fantom-ftm-logo.png',
    'Base': '/logos/base-logo.png',
    'Aurora': '/logos/aurora-aoa-logo.png',
    'Aptos': '/logos/aptos-apt-logo.png',
    'Sui': '/logos/sui-sui-logo.png',
    'Aptos': '/logos/aptos-apt-logo.png',
    'Near': '/logos/near-protocol-near-logo.png',
    'Flow': '/logos/flow-flow-logo.png',
    'Starknet': '/logos/starknet-stark-logo.png',
    'zkSync': '/logos/zksync-zksync-logo.png',
    'Polygon zkEVM': '/logos/polygon-zkevm-logo.png',
    'Mantle': '/logos/mantle-mnt-logo.png',
    'Linea': '/logos/linea-logo.png',
    'Scroll': '/logos/scroll-logo.png',
    'Manta': '/logos/manta-network-logo.png',
    'Metis': '/logos/metis-metis-logo.png',
    'Celo': '/logos/celo-celo-logo.png',
    'Moonbeam': '/logos/moonbeam-glmr-logo.png',
    'Moonriver': '/logos/moonriver-movr-logo.png',
    'Harmony': '/logos/harmony-one-logo.png',
    'Cronos': '/logos/cronos-cro-logo.png',
    'Kava': '/logos/kava-kava-logo.png',
    'Klaytn': '/logos/klaytn-klay-logo.png',
    'Astar': '/logos/astar-astr-logo.png',
    'Oasis': '/logos/oasis-network-rose-logo.png',
    'Velas': '/logos/velas-vlx-logo.png',
    'IoTeX': '/logos/iotex-iotx-logo.png',
    'Hedera': '/logos/hedera-hbar-logo.png',
    'Algorand': '/logos/algorand-algo-logo.png',
    'Tezos': '/logos/tezos-xtz-logo.png',
    'Avalanche C-Chain': '/logos/avalanche-avax-logo.png',
    'Avalanche X-Chain': '/logos/avalanche-avax-logo.png',
    'Avalanche P-Chain': '/logos/avalanche-avax-logo.png',
    'Arbitrum Nova': '/logos/arbitrum-nova-logo.png',
    'Arbitrum One': '/logos/arbitrum-arb-logo.png',
    'Optimism': '/logos/optimism-op-logo.png',
    'Base': '/logos/base-logo.png',
    'Polygon zkEVM': '/logos/polygon-zkevm-logo.png',
    'zkSync Era': '/logos/zksync-era-logo.png',
    'Starknet': '/logos/starknet-stark-logo.png',
    'Linea': '/logos/linea-logo.png',
    'Scroll': '/logos/scroll-logo.png',
    'Mantle': '/logos/mantle-mnt-logo.png',
    'Metis': '/logos/metis-metis-logo.png',
    'Boba Network': '/logos/boba-network-logo.png',
    'Aurora': '/logos/aurora-aoa-logo.png',
    'Celo': '/logos/celo-celo-logo.png',
    'Gnosis': '/logos/gnosis-gno-logo.png',
    'Fuse': '/logos/fuse-network-fuse-logo.png',
    'Moonbeam': '/logos/moonbeam-glmr-logo.png',
    'Moonriver': '/logos/moonriver-movr-logo.png',
    'Astar': '/logos/astar-astr-logo.png',
    'Shiden': '/logos/shiden-sdn-logo.png',
    'Kusama': '/logos/kusama-ksm-logo.png',
    'Polkadot': '/logos/polkadot-dot-logo.png',
    'Acala': '/logos/acala-aca-logo.png',
    'Karura': '/logos/karura-kar-logo.png',
    'Parallel': '/logos/parallel-heiko-logo.png',
    'Bifrost': '/logos/bifrost-bnc-logo.png',
    'Interlay': '/logos/interlay-intr-logo.png',
    'Kintsugi': '/logos/kintsugi-kin-logo.png',
    'Khala': '/logos/khala-pha-logo.png',
    'Crust': '/logos/crust-cru-logo.png',
    'Darwinia': '/logos/darwinia-ring-logo.png',
    'Crab': '/logos/crab-crab-logo.png',
    'Pangolin': '/logos/pangolin-png-logo.png',
    'Pangoro': '/logos/pangoro-pgo-logo.png',
    'Clover': '/logos/clover-clv-logo.png',
    'Phala': '/logos/phala-network-pha-logo.png',
    'Crust': '/logos/crust-cru-logo.png',
    'Litentry': '/logos/litentry-lit-logo.png',
    'Centrifuge': '/logos/centrifuge-cfg-logo.png',
    'Astar': '/logos/astar-astr-logo.png',
    'Shiden': '/logos/shiden-sdn-logo.png',
    'Bifrost': '/logos/bifrost-bnc-logo.png',
    'Moonriver': '/logos/moonriver-movr-logo.png',
    'Moonbeam': '/logos/moonbeam-glmr-logo.png',
    'Acala': '/logos/acala-aca-logo.png',
    'Karura': '/logos/karura-kar-logo.png',
    'Kintsugi': '/logos/kintsugi-kin-logo.png',
    'Khala': '/logos/khala-pha-logo.png',
    'Crust': '/logos/crust-cru-logo.png',
    'Litentry': '/logos/litentry-lit-logo.png',
    'Centrifuge': '/logos/centrifuge-cfg-logo.png',
    'Parallel': '/logos/parallel-heiko-logo.png',
    'Interlay': '/logos/interlay-intr-logo.png',
    'Darwinia': '/logos/darwinia-ring-logo.png',
    'Crab': '/logos/crab-crab-logo.png',
    'Pangolin': '/logos/pangolin-png-logo.png',
    'Pangoro': '/logos/pangoro-pgo-logo.png',
    'Clover': '/logos/clover-clv-logo.png',
    'Phala': '/logos/phala-network-pha-logo.png',
    'Crust': '/logos/crust-cru-logo.png',
    'Litentry': '/logos/litentry-lit-logo.png',
    'Centrifuge': '/logos/centrifuge-cfg-logo.png',
    'Astar': '/logos/astar-astr-logo.png',
    'Shiden': '/logos/shiden-sdn-logo.png',
    'Bifrost': '/logos/bifrost-bnc-logo.png',
    'Moonriver': '/logos/moonriver-movr-logo.png',
    'Moonbeam': '/logos/moonbeam-glmr-logo.png',
    'Acala': '/logos/acala-aca-logo.png',
    'Karura': '/logos/karura-kar-logo.png',
    'Kintsugi': '/logos/kintsugi-kin-logo.png',
    'Khala': '/logos/khala-pha-logo.png',
    'Crust': '/logos/crust-cru-logo.png',
    'Litentry': '/logos/litentry-lit-logo.png',
    'Centrifuge': '/logos/centrifuge-cfg-logo.png',
    'Parallel': '/logos/parallel-heiko-logo.png',
    'Interlay': '/logos/interlay-intr-logo.png',
    'Darwinia': '/logos/darwinia-ring-logo.png',
    'Crab': '/logos/crab-crab-logo.png',
    'Pangolin': '/logos/pangolin-png-logo.png',
    'Pangoro': '/logos/pangoro-pgo-logo.png',
    'Clover': '/logos/clover-clv-logo.png',
    'Phala': '/logos/phala-network-pha-logo.png',
    'Crust': '/logos/crust-cru-logo.png',
    'Litentry': '/logos/litentry-lit-logo.png',
    'Centrifuge': '/logos/centrifuge-cfg-logo.png',
    'Astar': '/logos/astar-astr-logo.png',
    'Shiden': '/logos/shiden-sdn-logo.png',
    'Bifrost': '/logos/bifrost-bnc-logo.png',
    'Moonriver': '/logos/moonriver-movr-logo.png',
    'Moonbeam': '/logos/moonbeam-glmr-logo.png',
    'Acala': '/logos/acala-aca-logo.png',
    'Karura': '/logos/karura-kar-logo.png',
    'Kintsugi': '/logos/kintsugi-kin-logo.png',
    'Khala': '/logos/khala-pha-logo.png',
    'Crust': '/logos/crust-cru-logo.png',
    'Litentry': '/logos/litentry-lit-logo.png',
    'Centrifuge': '/logos/centrifuge-cfg-logo.png',
    'Parallel': '/logos/parallel-heiko-logo.png',
    'Interlay': '/logos/interlay-intr-logo.png',
    'Darwinia': '/logos/darwinia-ring-logo.png',
    'Crab': '/logos/crab-crab-logo.png',
    'Pangolin': '/logos/pangolin-png-logo.png',
    'Pangoro': '/logos/pangoro-pgo-logo.png',
    'Clover': '/logos/clover-clv-logo.png',
    'Phala': '/logos/phala-network-pha-logo.png',
    'Crust': '/logos/crust-cru-logo.png',
    'Litentry': '/logos/litentry-lit-logo.png',
    'Centrifuge': '/logos/centrifuge-cfg-logo.png'
  };
  return icons[chain] || '/logos/ethereum-eth-logo.png';
};

// Format lending positions from contract data
const formatLendingPositions = (positions = []) => {
  return positions.map((position, index) => {
    // Ensure value is a number for the chart
    const value = typeof position.value === 'number' ? position.value : 0;
    
    return {
      id: `${position.asset}-${position.chain}-${index}`,
      asset: position.asset,
      chain: position.chain,
      icon: getAssetIcon(position.asset),
      chainIcon: getChainIcon(position.chain),
      supplied: position.supplied || 0,
      borrowed: position.borrowed || 0,
      apy: position.apy || 0,
      value: value,
      utilization: position.utilization || 0,
      isCrossChain: true
    };
  });
};

// Initial empty positions
const initialLendingPositions = [
  {
    id: 'usdc-eth-1',
    asset: 'USDC',
    chain: 'Ethereum',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/ethereum-eth-logo.png',
    supplied: 0,
    borrowed: 0,
    apy: 4.25,
    value: 25000,
    utilization: 0,
    isCrossChain: true
  },
  {
    id: 'eth-base-1',
    asset: 'ETH',
    chain: 'Base',
    icon: '/logos/ethereum-eth-logo.png',
    chainIcon: '/logos/base.png',
    supplied: 0,
    borrowed: 15000,
    apy: 6.30,
    value: 15000,
    utilization: 100,
    isCrossChain: true
  },
  {
    id: 'zeta-zeta-1',
    asset: 'ZETA',
    chain: 'ZetaChain',
    icon: '/logos/zetachain.png',
    chainIcon: '/logos/zetachain.png',
    supplied: 35000,
    borrowed: 0,
    apy: 5.85,
    value: 35000,
    utilization: 0,
    isCrossChain: true
  },
  {
    id: 'usdc-avax-1',
    asset: 'USDC.AVAX',
    chain: 'Avalanche',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/avalanche-avax-logo.png',
    supplied: 20000,
    borrowed: 0,
    apy: 4.85,
    value: 20000,
    utilization: 0,
    isCrossChain: true
  },
  {
    id: 'sol-sol-1',
    asset: 'SOL',
    chain: 'Solana',
    icon: '/logos/solana-sol-logo.png',
    chainIcon: '/logos/solana-sol-logo.png',
    supplied: 0,
    borrowed: 10000,
    apy: 6.25,
    value: 10000,
    utilization: 100,
    isCrossChain: true
  },
  {
    id: 'usdt-bsc-1',
    asset: 'USDT.BSC',
    chain: 'BNB Chain',
    icon: '/logos/tether-usdt-logo.png',
    chainIcon: '/logos/bnb-bnb-logo.png',
    supplied: 15000,
    borrowed: 0,
    apy: 4.35,
    value: 15000,
    utilization: 0,
    isCrossChain: true
  }
];

const recentTransactions = [
  {
    id: 'tx-1',
    type: 'supply',
    asset: 'USDC',
    chain: 'Ethereum',
    amount: 10000,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: 'tx-2',
    type: 'borrow',
    asset: 'ETH.BASE',
    chain: 'Base',
    amount: 5000,
    timestamp: '2024-01-14T15:45:00Z',
    status: 'completed'
  },
  {
    id: 'tx-3',
    type: 'repay',
    asset: 'SOL',
    chain: 'Solana',
    amount: 2000,
    timestamp: '2024-01-13T09:20:00Z',
    status: 'completed'
  },
  {
    id: 'tx-4',
    type: 'cross-chain',
    asset: 'ZETA',
    fromChain: 'ZetaChain',
    toChain: 'Ethereum',
    amount: 5000,
    timestamp: '2024-01-12T14:15:00Z',
    status: 'completed'
  },
  {
    id: 'tx-4',
    type: 'cross-chain',
    asset: 'ZETA',
    fromChain: 'ZetaChain',
    toChain: 'Ethereum',
    amount: 5000,
    timestamp: '2024-01-12T14:15:00Z',
    status: 'completed'
  }
];

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  return `$${num.toLocaleString()}`;
};

// Format date to relative time (e.g., "2 hours ago")
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

// Format date to readable format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default function Dashboard() {
  const { theme } = useTheme();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [showMobileConnect, setShowMobileConnect] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lendingPositions, setLendingPositions] = useState(initialLendingPositions);
  const [isLoadingTxs, setIsLoadingTxs] = useState(false);
  const [isLoadingTxss, setIsLoadingTxss] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionss, setTransactionss] = useState([]);
  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    totalBorrowed: 0,
    netWorth: 0,
    healthFactor: 0,
    activePositions: 0,
    chains: []
  });

  // alchemy avax data helper function
  const mapAlchemyTransfers = (alchemyTransfers) => {
    return alchemyTransfers.map((tx, i) => ({
      id: tx.hash || i,                       // unique key
      type: tx.from.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase()
        ? "send"
        : "receive",                          // sent or received
      asset: tx.asset || "AVAX",              // token symbol
      amount: tx.value || 0,                  // token amount
      timestamp: Date.now(),                  // Alchemy doesn't return timestamp directly, needs an extra call. For now use Date.now()
      status: "success",                      // assume success if it's in transfers
      explorerUrl: `https://testnet.snowtrace.io/tx/${tx.hash}`,  // block explorer link
      chain: "Avalanche Fuji",                // your chain label
      chainIcon: "/logos/avax-logo.png",      // your chain icon
      icon: "/logos/avax-logo.png",           // token icon placeholder
    }));
  };

  useEffect(() => {
    const fetchTxs = async () => {
      setIsLoadingTxss(true);
      // const avaxData = await avaxAlchemy.core.getAssetTransfers({
      //   fromAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      //   category: ["external"],
      //   order: "desc",
      //   maxCount: 20,
      // });
  
      const mapped = mapAlchemyTransfers(avaxData.transfers);
      setTransactionss(mapped);
      setIsLoadingTxss(false);
    };
  
    fetchTxs();
  }, []);

  // Prepare chart data from lending positions
  const chartData = useMemo(() => {
    if (!lendingPositions || lendingPositions.length === 0) return [];
    
    // Group by asset and sum values
    const assetMap = new Map();
    
    lendingPositions.forEach(position => {
      if (!position.asset || position.value <= 0) return;
      
      const assetName = position.asset.split('.')[0]; // Remove chain suffix if present
      const value = typeof position.value === 'number' ? position.value : 0;
      
      if (assetMap.has(assetName)) {
        assetMap.set(assetName, assetMap.get(assetName) + value);
      } else {
        assetMap.set(assetName, value);
      }
    });
    
    // Convert to array and sort by value (descending)
    return Array.from(assetMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        total: Array.from(assetMap.values()).reduce((a, b) => a + b, 0)
      }))
      .sort((a, b) => b.value - a.value);
  }, [lendingPositions]);

  // Fetch user position and lending positions
  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      setLendingPositions(initialLendingPositions);
      setPortfolio({
        totalValue: 0,
        totalBorrowed: 0,
        netWorth: 0,
        healthFactor: 0,
        activePositions: 0,
        chains: []
      });
      return;
    }

    const fetchPortfolioData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user position
        const userPosition = await contractService.getUserPosition(address);
        
        // Fetch user's lending positions
        let positions = await contractService.getUserPositions(address);
        
        // If no positions from contract, use mock data
        if (!positions || positions.length === 0) {
          positions = initialLendingPositions;
        }
        
        // Format positions
        const formattedPositions = formatLendingPositions(positions);
        
        // Update state
        setLendingPositions(formattedPositions);
        setPortfolio(formatUserPortfolio(userPosition, positions));
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        // Fallback to mock data on error
        setLendingPositions(initialLendingPositions);
        setPortfolio({
          totalValue: 100000,
          totalBorrowed: 40000,
          netWorth: 60000,
          healthFactor: 1.8,
          activePositions: 3,
          chains: ['Ethereum', 'Base', 'Avalanche', 'ZetaChain', 'BNB Chain', 'Solana']
        });
        setError('Using demo data. Live data unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();

    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchPortfolioData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [address]);

  // Track if component is mounted
  const [mounted, setMounted] = useState(false);
  
  // Fetch transactions from all supported chains
  const fetchTransactions = async () => {
    if (!address) {
      setTransactions([]);
      return;
    }
    
    try {
      setIsLoadingTxs(true);
      const allTxs = await fetchAllTransactions(address);
      
      // Process and format transactions
      const formattedTxs = allTxs.map(tx => {
        // Determine if this is a send or receive transaction
        const isSend = tx.from?.toLowerCase() === address.toLowerCase();
        const amount = tx.value ? ethers.formatUnits(tx.value, tx.tokenDecimal || 18) : '0';
        const asset = tx.tokenSymbol || tx.nativeCurrency || 'ETH';
        
        // Get chain name from config or use the one from the transaction
        let chainName = tx.chain;
        if (tx.chainId) {
          const chainConfig = Object.values(EXPLORER_APIS).find(c => c.chainId === tx.chainId);
          if (chainConfig) {
            chainName = chainConfig.name;
          }
        }
        
        return {
          id: tx.hash,
          type: isSend ? 'send' : 'receive',
          asset: asset,
          chain: chainName,
          icon: getAssetIcon(asset),
          chainIcon: getChainIcon(chainName),
          amount: amount,
          timestamp: tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
          status: tx.status || 'success',
          txHash: tx.hash,
          explorerUrl: tx.explorerUrl,
          from: tx.from,
          to: tx.to,
          // Add additional metadata
          nativeAmount: tx.nativeValue ? ethers.formatUnits(tx.nativeValue, 18) : amount,
          nativeCurrency: tx.nativeCurrency || 'ETH',
          tokenDecimal: tx.tokenDecimal || 18
        };
      });
      
      // Sort by timestamp in descending order (newest first)
      const sortedTxs = formattedTxs.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setTransactions(sortedTxs);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      // Fallback to mock data in case of error
      setTransactions(recentTransactions);
    } finally {
      setIsLoadingTxs(false);
    }
  };
  
  useEffect(() => {
    setMounted(true);
    fetchTransactions();
    return () => setMounted(false);
  }, [address]);

  if (!mounted) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold">Loading your portfolio...</h2>
            <p className="text-[var(--text-secondary)] mt-2">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--border)] text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-[var(--text-secondary)] mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <>
        <LandingHeader brandClass="font-orbitron" />
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] pt-20">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold font-orbitron gradient-text mb-4">
                Connect Your Wallet
              </h1>
              <p className="text-lg text-[var(--text-muted)] mb-8">
                Please connect your wallet to view your dashboard
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <LandingHeader brandClass="font-orbitron" />
      
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] pt-16">
        {/* Header Section */}
        <div className="bg-[var(--card-bg)] border-b border-[#23272F]/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-orbitron gradient-text mb-2">
                  Dashboard
                </h1>
                <p className="text-[var(--text-muted)]">
                  Manage your cross-chain lending positions
                </p>
              </div>
              
              {/* Portfolio Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                {(() => {
                  // using state portfolio
                  return (
                    <>
                      <div className="bg-[var(--background)] rounded-xl p-4 border border-[#23272F]/10">
                        <div className="text-sm text-[var(--text-muted)]">Total Value</div>
                        <div className="text-xl font-bold font-orbitron">
                          {isLoading ? '...' : formatNumber(portfolio.totalValue)}
                        </div>
                      </div>
                      <div className="bg-[var(--background)] rounded-xl p-4 border border-[#23272F]/10">
                        <div className="text-sm text-[var(--text-muted)]">Borrowed</div>
                        <div className="text-xl font-bold font-orbitron text-red-500">
                          {isLoading ? '...' : formatNumber(portfolio.totalBorrowed)}
                        </div>
                      </div>
                      <div className="bg-[var(--background)] rounded-xl p-4 border border-[#23272F]/10">
                        <div className="text-sm text-[var(--text-muted)]">Net Worth</div>
                        <div className="text-xl font-bold font-orbitron text-green-500">
                          {isLoading ? '...' : formatNumber(portfolio.netWorth)}
                        </div>
                      </div>
                      <div className="bg-[var(--background)] rounded-xl p-4 border border-[#23272F]/10">
                        <div className="text-sm text-[var(--text-muted)]">Health Factor</div>
                        <div className={`text-xl font-bold font-orbitron ${
                          isLoading ? 'text-gray-500' :
                          portfolio.healthFactor > 1.5 ? 'text-green-500' : 
                          portfolio.healthFactor > 1.2 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {isLoading ? '...' : formatHealthFactor(portfolio.healthFactor)}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'positions', name: 'Positions', icon: '💼' },
              { id: 'transactions', name: 'Transactions', icon: '📝' },
              { id: 'analytics', name: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--primary-accent)] text-white'
                    : 'bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-accent)]/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Chart */}
              <div className="lg:col-span-2 bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                <h3 className="text-xl font-bold font-orbitron mb-4">Portfolio Overview</h3>
                <div className="h-80 rounded-xl bg-[var(--card-bg)]">
                  <PortfolioChart data={chartData} />
                </div>
              </div>

              {/* Chain Distribution */}
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                <h3 className="text-xl font-bold font-orbitron mb-4">Chain Distribution</h3>
                <div className="space-y-3">
                  {(() => {
                    // using state portfolio
                    if (isLoading) {
                      return (
                        <div className="text-center text-[var(--text-muted)]">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          Loading...
                        </div>
                      );
                    }
                    if (portfolio.chains.length === 0) {
                      return (
                        <div className="text-center text-[var(--text-muted)]">
                          No active positions
                        </div>
                      );
                    }
                    return portfolio.chains.map((chain, index) => (
                      <div key={chain} className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">{chain}</span>
                        <span className="text-sm font-medium">{Math.round(100 / portfolio.chains.length)}%</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-orbitron">Your Positions</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[var(--primary-accent)] text-[var(--text-main)] rounded-lg text-sm font-medium">
                    Supply
                  </button>
                  <button className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--primary-accent)] text-[var(--primary-accent)] rounded-lg text-sm font-medium">
                    Borrow
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {lendingPositions.map((position) => (
                  <div key={position.id} className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                    {/* Position Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={position.icon} alt={position.asset} className="w-10 h-10 rounded-full" />
                          <img src={position.chainIcon} alt={position.chain} className="w-5 h-5 rounded-full absolute -bottom-1 -right-1" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">{position.asset}</div>
                          <div className="text-sm text-[var(--text-muted)]">{position.chain}</div>
                        </div>
                      </div>
                      
                      {position.isCrossChain && (
                        <span className="px-2 py-1 bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] text-xs rounded-full">
                          Cross-Chain
                        </span>
                      )}
                    </div>

                    {/* Position Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">Supplied</span>
                        <span className="font-medium">{formatNumber(position.supplied)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">Borrowed</span>
                        <span className="font-medium">{formatNumber(position.borrowed)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">APY</span>
                        <span className="font-medium">{position.apy}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">Utilization</span>
                        <span className="font-medium">{position.utilization}%</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-[var(--primary-accent)] text-[var(--text-main)] py-2 px-4 rounded-lg text-sm font-medium">
                        Manage
                      </button>
                      <button className="flex-1 bg-[var(--card-bg)] border border-[var(--primary-accent)] text-[var(--primary-accent)] py-2 px-4 rounded-lg text-sm font-medium">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-orbitron">Recent Transactions</h3>
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[#23272F]/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chain</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                        <th scope="col" className="relative px-4 py-3">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {transactionss && transactionss.length > 0 ? (
                        transactionss.slice(0, 10).map((tx) => {
                          const isSend = tx.type === 'send';
                          const amount = parseFloat(tx.amount).toFixed(4);
                          const timeAgo = formatTimeAgo(tx.timestamp);
                          return (
                            <tr key={tx.id} className="hover:bg-gray-750 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isSend ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {isSend ? '↑' : '↓'}
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-gray-100 capitalize">
                                      {isSend ? 'Sent' : 'Received'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img 
                                    className="h-6 w-6 rounded-full" 
                                    src={tx.icon} 
                                    alt={tx.asset} 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/logos/ethereum-eth-logo.png';
                                    }} 
                                  />
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-gray-100">{tx.asset}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className={`text-sm font-medium ${isSend ? 'text-red-400' : 'text-green-400'}`}>
                                  {isSend ? '-' : '+'}{amount} {tx.asset}
                                </div>
                                <div className="text-xs text-gray-400">
                                  ${(amount * 1).toFixed(2)} USD
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img 
                                    className="h-5 w-5 rounded-full mr-2" 
                                    src={tx.chainIcon} 
                                    alt={tx.chain} 
                                  />
                                  <span className="text-sm text-gray-200">{tx.chain}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${tx.status === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                  {tx.status === 'success' ? 'Confirmed' : 'Failed'}
                                </span>
                              </td>
                              <td 
                                className="px-4 py-3 whitespace-nowrap text-sm text-gray-300" 
                                title={new Date(tx.timestamp).toLocaleString()}
                              >
                                {timeAgo}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <a 
                                  href={tx.explorerUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-400 hover:text-blue-300 flex items-center justify-end"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-[var(--text-muted)]">
                            {isLoadingTxs ? 'Loading transactions...' : 'No transactions found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                <h3 className="text-xl font-bold font-orbitron mb-4">Performance</h3>
                <div className="h-48 bg-[var(--background)] rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <div className="text-[var(--text-muted)]">Performance Chart</div>
                    <div className="text-sm text-[var(--text-muted)]">Coming Soon</div>
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                <h3 className="text-xl font-bold font-orbitron mb-4">Risk Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-muted)]">Health Factor</span>
                    <span className="font-medium text-green-500">
                      {userPosition ? formatHealthFactor(userPosition.healthFactor) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-muted)]">Liquidation Risk</span>
                    <span className="font-medium text-green-500">Low</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-muted)]">Diversification</span>
                    <span className="font-medium text-green-500">Good</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 