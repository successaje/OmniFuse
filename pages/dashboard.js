import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { useAccount, useDisconnect } from 'wagmi';
import { ethers } from 'ethers';
import { formatHealthFactor } from '../utils/format';
import LandingHeader from '../components/LandingHeader';
import { useOmniFuse } from '../hooks/useOmniFuse';
import AssetNetworkSelector from '../components/AssetNetworkSelector';
import { contractService } from '../services/contractService';
import { fetchTransactionsByAddress } from '../utils/explorerApi';

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
  return positions.map((position, index) => ({
    id: `${position.asset}-${position.chain}-${index}`,
    asset: position.asset,
    chain: position.chain,
    icon: getAssetIcon(position.asset),
    chainIcon: getChainIcon(position.chain),
    supplied: position.supplied,
    borrowed: position.borrowed,
    apy: position.apy || 0,
    value: position.value || 0,
    utilization: position.utilization || 0,
    isCrossChain: true
  }));
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    totalBorrowed: 0,
    netWorth: 0,
    healthFactor: 0,
    activePositions: 0,
    chains: []
  });

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
        const positions = await contractService.getUserPositions(address);
        
        // Format positions
        const formattedPositions = formatLendingPositions(positions);
        
        // Update state
        setLendingPositions(formattedPositions);
        setPortfolio(formatUserPortfolio(userPosition, positions));
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError('Failed to load portfolio data. Please try again later.');
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
  
  // Fetch transactions from ZetaChain testnet
  const fetchTransactions = async () => {
    if (!address) {
      setTransactions([]);
      return;
    }
    
    try {
      setIsLoadingTxs(true);
      const txs = await fetchTransactionsByAddress(address);
      setTransactions(txs);
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
                <div className="h-64 bg-[var(--background)] rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-[var(--text-muted)]">Portfolio Chart</div>
                    <div className="text-sm text-[var(--text-muted)]">Coming Soon</div>
                  </div>
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
                  <table className="w-full">
                    <thead className="bg-[var(--background)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-muted)]">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-muted)]">Asset</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-muted)]">Chain</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-muted)]">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-muted)]">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-muted)]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#23272F]/10">
                      {isLoadingTxs ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                              <span className="text-[var(--text-muted)]">Loading transactions...</span>
                            </div>
                          </td>
                        </tr>
                      ) : transactions && transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[var(--background)]/50">
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tx.type === 'receive' ? 'bg-green-500/10 text-green-500' :
                                tx.type === 'send' ? 'bg-red-500/10 text-red-500' :
                                tx.type === 'contract' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-gray-500/10 text-gray-500'
                              }`}>
                                {tx.type?.toUpperCase?.() || 'TRANSACTION'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">
                              <div className="flex items-center gap-2">
                                <span>{tx.amount > 0 ? formatNumber(tx.amount) : '0'}</span>
                                <span className="text-[var(--text-muted)]">{tx.asset || 'ZETA'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[var(--text-muted)]">
                              {tx.chain || 'ZetaChain'}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {tx.from?.toLowerCase() === address?.toLowerCase() ? 'Outgoing' : 'Incoming'}
                            </td>
                            <td className="px-6 py-4 text-[var(--text-muted)] whitespace-nowrap">
                              {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              {tx.txHash ? (
                                <a 
                                  href={`https://explorer.zetachain.com/tx/${tx.txHash}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  View
                                </a>
                              ) : 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-[var(--text-muted)]">
                            No transactions found
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