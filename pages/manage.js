import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import LandingHeader from '../components/LandingHeader';
import { useWalletPersistence } from '../hooks/useWalletPersistence';
import { useOmniFuse } from '../hooks/useOmniFuse';
import { ethers } from 'ethers';
import AssetNetworkSelector from '../components/AssetNetworkSelector';

// Mock user assets and positions
const userAssets = [
  {
    id: 'usdc-eth',
    asset: 'USDC',
    chain: 'Ethereum',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/ethereum-eth-logo.png',
    balance: 25000,
    value: 25000,
    apy: 4.25,
    isSupplied: true,
    suppliedAmount: 20000,
    isCrossChain: true
  },
  {
    id: 'zeta-zeta',
    asset: 'ZETA',
    chain: 'ZetaChain',
    icon: '/logos/zetachain.png',
    chainIcon: '/logos/zetachain.png',
    balance: 5000,
    value: 5000,
    apy: 5.85,
    isSupplied: false,
    suppliedAmount: 0,
    isCrossChain: true
  },
  {
    id: 'eth-base',
    asset: 'ETH.BASE',
    chain: 'Base',
    icon: '/logos/ethereum-eth-logo.png',
    chainIcon: '/logos/base.png',
    balance: 2.5,
    value: 7500,
    apy: 3.25,
    isSupplied: false,
    suppliedAmount: 0,
    isCrossChain: true
  },
  {
    id: 'avax-avax',
    asset: 'AVAX',
    chain: 'Avalanche',
    icon: '/logos/avalanche-avax-logo.png',
    chainIcon: '/logos/avalanche-avax-logo.png',
    balance: 50,
    value: 2000,
    apy: 4.35,
    isSupplied: false,
    suppliedAmount: 0,
    isCrossChain: true
  },
  {
    id: 'sol-sol',
    asset: 'SOL',
    chain: 'Solana',
    icon: '/logos/solana-sol-logo.png',
    chainIcon: '/logos/solana-sol-logo.png',
    balance: 100,
    value: 8000,
    apy: 3.85,
    isSupplied: false,
    suppliedAmount: 0,
    isCrossChain: true
  }
];

const userPositions = [
  {
    id: 'pos-1',
    asset: 'USDC',
    chain: 'Ethereum',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/ethereum-eth-logo.png',
    supplied: 20000,
    borrowed: 0,
    apy: 4.25,
    utilization: 0,
    healthFactor: 2.1,
    isCrossChain: true
  },
  {
    id: 'pos-2',
    asset: 'ETH.BASE',
    chain: 'Base',
    icon: '/logos/ethereum-eth-logo.png',
    chainIcon: '/logos/base.png',
    supplied: 0,
    borrowed: 15000,
    apy: 6.30,
    utilization: 100,
    healthFactor: 1.85,
    isCrossChain: true
  },
  {
    id: 'pos-3',
    asset: 'ZETA',
    chain: 'ZetaChain',
    icon: '/logos/zetachain.png',
    chainIcon: '/logos/zetachain.png',
    supplied: 35000,
    borrowed: 0,
    apy: 5.85,
    utilization: 0,
    healthFactor: 2.5,
    isCrossChain: true
  }
];

const supportedChains = [
  { id: 'zetachain', name: 'ZetaChain', icon: '⚡', color: '#3B82F6' },
  { id: 'ethereum', name: 'Ethereum', icon: '🔷', color: '#627EEA' },
  { id: 'base', name: 'Base', icon: '🔵', color: '#0052FF' },
  { id: 'avalanche', name: 'Avalanche', icon: '🔴', color: '#E84142' },
  { id: 'solana', name: 'Solana', icon: '🟢', color: '#14F195' },
  { id: 'bnb', name: 'BNB Chain', icon: '🟡', color: '#F3BA2F' }
];

// Mock activity data
const recentActivity = [
  {
    id: 'tx-1',
    type: 'deposit',
    asset: 'USDC',
    chain: 'Ethereum',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/ethereum-eth-logo.png',
    amount: 10000,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    explorerUrl: 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 'tx-2',
    type: 'borrow',
    asset: 'ETH.BASE',
    chain: 'Base',
    icon: '/logos/ethereum-eth-logo.png',
    chainIcon: '/logos/base.png',
    amount: 5000,
    timestamp: '2024-01-15T09:15:00Z',
    status: 'completed',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    explorerUrl: 'https://basescan.org/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: 'tx-3',
    type: 'repay',
    asset: 'ZETA',
    chain: 'ZetaChain',
    icon: '/logos/zetachain.png',
    chainIcon: '/logos/zetachain.png',
    amount: 2500,
    timestamp: '2024-01-15T08:45:00Z',
    status: 'completed',
    txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    explorerUrl: 'https://explorer.zetachain.com/tx/0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: 'tx-4',
    type: 'transfer',
    asset: 'AVAX',
    chain: 'Avalanche',
    icon: '/logos/avalanche-avax-logo.png',
    chainIcon: '/logos/avalanche-avax-logo.png',
    amount: 1000,
    timestamp: '2024-01-15T07:30:00Z',
    status: 'pending',
    txHash: '0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
    explorerUrl: 'https://snowtrace.io/tx/0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123'
  },
  {
    id: 'tx-5',
    type: 'deposit',
    asset: 'SOL',
    chain: 'Solana',
    icon: '/logos/solana-sol-logo.png',
    chainIcon: '/logos/solana-sol-logo.png',
    amount: 500,
    timestamp: '2024-01-15T06:20:00Z',
    status: 'completed',
    txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    explorerUrl: 'https://solscan.io/tx/0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
  },
  {
    id: 'tx-6',
    type: 'borrow',
    asset: 'USDC',
    chain: 'Ethereum',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/ethereum-eth-logo.png',
    amount: 3000,
    timestamp: '2024-01-15T05:10:00Z',
    status: 'failed',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    explorerUrl: 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  }
];

// Explorer URLs for different chains
const explorerUrls = {
  'Ethereum': 'https://etherscan.io',
  'ZetaChain': 'https://explorer.zetachain.com',
  'Base': 'https://basescan.org',
  'Avalanche': 'https://snowtrace.io',
  'Solana': 'https://solscan.io',
  'BNB Chain': 'https://bscscan.com'
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  return `$${num.toLocaleString()}`;
};

export default function ManagePage() {
  const { theme } = useTheme();
  const { isConnected, address, isReconnecting } = useWalletPersistence();
  const {
    userPosition,
    isLoading,
    error,
    lastTransaction,
    supplyToZeta,
    borrowCrossChain,
    repayToZeta,
    withdrawCrossChain,
    getTokenBalance,
    getAssetPrice,
    checkLiquidationStatus,
    clearError,
    clearLastTransaction,
    chainIds
  } = useOmniFuse();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [actionType, setActionType] = useState('supply');
  const [amount, setAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('deposit'); // deposit, borrow, repay
  const [activityFilterChain, setActivityFilterChain] = useState('all');
  const [activityFilterAction, setActivityFilterAction] = useState('all');
  const [selectedDepositChain, setSelectedDepositChain] = useState('');
  const [selectedDepositAsset, setSelectedDepositAsset] = useState('');
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [assetNetworkSelection, setAssetNetworkSelection] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle transaction status updates
  useEffect(() => {
    if (lastTransaction) {
      setTransactionStatus({
        type: 'success',
        message: `${lastTransaction.action} transaction successful!`,
        txHash: lastTransaction.txHash,
        network: lastTransaction.network
      });
      clearLastTransaction();
    }
  }, [lastTransaction, clearLastTransaction]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setTransactionStatus({
        type: 'error',
        message: error
      });
      clearError();
    }
  }, [error, clearError]);

  // Handle cross-chain actions
  const handleCrossChainAction = async (action, params) => {
    try {
      setTransactionStatus({
        type: 'pending',
        message: `Processing ${action}...`
      });
      console.log('handleCrossChainAction', action, params);

      let result;
      
      switch (action) {
        case 'supply':
          result = await supplyToZeta(params.network, params.assetAddress, params.amount);
          break;
        case 'borrow':
          result = await borrowCrossChain(params.assetAddress, params.amount, params.destChainId);
          break;
        case 'repay':
          result = await repayToZeta(params.network, params.assetAddress, params.amount);
          break;
        case 'withdraw':
          result = await withdrawCrossChain(params.assetAddress, params.amount, params.destChainId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      console.log('Contract call result:', result);

      if (result.success) {
        setTransactionStatus({
          type: 'success',
          message: `${action} successful!`,
          txHash: result.txHash,
          network: result.network
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Contract call error:', err);
      setTransactionStatus({
        type: 'error',
        message: err.message || 'Transaction failed.'
      });
    }
  };

  if (!mounted) return null;

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
                {isReconnecting ? 'Reconnecting to wallet...' : 'Please connect your wallet to manage your assets'}
              </p>
              {isReconnecting && (
                <div className="flex items-center justify-center gap-2 text-[var(--primary-accent)]">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Reconnecting...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  const filteredAssets = userAssets.filter(asset => 
    selectedChain === 'all' || asset.chain.toLowerCase().includes(selectedChain)
  );

  // Filter activity by chain and action
  const filteredActivity = recentActivity.filter(activity => {
    const chainMatch = activityFilterChain === 'all' || activity.chain === activityFilterChain;
    const actionMatch = activityFilterAction === 'all' || activity.type === activityFilterAction;
    return chainMatch && actionMatch;
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'deposit': return '📥';
      case 'borrow': return '💳';
      case 'repay': return '💸';
      case 'transfer': return '🔄';
      default: return '📊';
    }
  };

  // Helper function to get explorer URL
  const getExplorerUrl = (network) => {
    switch (network) {
      case 'ZETA_TESTNET':
        return 'https://zetachain-testnet.blockscout.com';
      case 'BASE_SEPOLIA':
        return 'https://sepolia.basescan.org';
      default:
        return 'https://etherscan.io';
    }
  };

  return (
    <>
      <LandingHeader brandClass="font-orbitron" />
      
      {/* Transaction Status Banner */}
      {transactionStatus && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
          transactionStatus.type === 'success' ? 'bg-green-500 text-white' :
          transactionStatus.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {transactionStatus.type === 'pending' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {transactionStatus.type === 'success' && <span>✅</span>}
            {transactionStatus.type === 'error' && <span>❌</span>}
            <span className="font-medium">{transactionStatus.message}</span>
            {transactionStatus.txHash && (
              <a 
                href={`${getExplorerUrl(transactionStatus.network)}/tx/${transactionStatus.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                View Transaction
              </a>
            )}
            <button 
              onClick={() => setTransactionStatus(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] pt-16">
        {/* Header Section */}
        <div className="bg-[var(--card-bg)] border-b border-[#23272F]/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-orbitron gradient-text mb-2">
                  Manage Assets
                </h1>
                <p className="text-[var(--text-muted)]">
                  Supply, borrow, and transfer assets across chains
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setModalType('deposit');
                    setShowModal(true);
                    setSelectedAsset(null);
                    setSelectedDepositChain('');
                    setSelectedDepositAsset('');
                    setAmount('');
                    setAssetNetworkSelection({});
                  }}
                  className="px-6 py-3 bg-[var(--primary-accent)] text-white rounded-xl font-medium hover:bg-[var(--primary-accent)]/90 transition-colors"
                >
                  Quick Supply
                </button>
                <button className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--primary-accent)] text-[var(--primary-accent)] rounded-xl font-medium hover:bg-[var(--primary-accent)]/10 transition-colors">
                  Cross-Chain Transfer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'assets', name: 'Assets', icon: '💰' },
              { id: 'positions', name: 'Positions', icon: '💼' },
              { id: 'activity', name: 'Recent Activity', icon: '📊' },
              { id: 'transfer', name: 'Transfer', icon: '🔄' },
              { id: 'settings', name: 'Settings', icon: '⚙️' }
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
          {activeTab === 'assets' && (
            <div className="space-y-6">
              {/* Chain Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedChain('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedChain === 'all'
                      ? 'bg-[var(--primary-accent)] text-white'
                      : 'bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-accent)]/10'
                  }`}
                >
                  <span>🌐</span>
                  <span className="text-sm font-medium">All Chains</span>
                </button>
                {supportedChains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      selectedChain === chain.id
                        ? 'bg-[var(--primary-accent)] text-white'
                        : 'bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-accent)]/10'
                    }`}
                  >
                    <span>{chain.icon}</span>
                    <span className="text-sm font-medium">{chain.name}</span>
                  </button>
                ))}
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                    {/* Asset Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={asset.icon} alt={asset.asset} className="w-10 h-10 rounded-full" />
                          <img src={asset.chainIcon} alt={asset.chain} className="w-5 h-5 rounded-full absolute -bottom-1 -right-1" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">{asset.asset}</div>
                          <div className="text-sm text-[var(--text-muted)]">{asset.chain}</div>
                        </div>
                      </div>
                      
                      {asset.isCrossChain && (
                        <span className="px-2 py-1 bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] text-xs rounded-full">
                          Cross-Chain
                        </span>
                      )}
                    </div>

                    {/* Asset Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">Balance</span>
                        <span className="font-medium">{formatNumber(asset.balance)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">Value</span>
                        <span className="font-medium">{formatNumber(asset.value)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-muted)]">Supply APY</span>
                        <span className="font-medium text-green-500">{asset.apy}%</span>
                      </div>
                      {asset.isSupplied && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-muted)]">Supplied</span>
                          <span className="font-medium">{formatNumber(asset.suppliedAmount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedAsset(asset);
                          setModalType('deposit');
                          setShowModal(true);
                          setSelectedDepositChain(asset.chain);
                          setSelectedDepositAsset(asset.asset);
                          setAmount('');
                          setAssetNetworkSelection({ asset: asset.asset, network: asset.chain });
                        }}
                        className="flex-1 bg-[var(--primary-accent)] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[var(--primary-accent)]/90 transition-colors"
                      >
                        Deposit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedAsset(asset);
                          setModalType('transfer');
                          setShowModal(true);
                          setAssetNetworkSelection({ asset: asset.asset, network: asset.chain });
                        }}
                        className="flex-1 bg-[var(--card-bg)] border border-[var(--primary-accent)] text-[var(--primary-accent)] py-2 px-4 rounded-lg text-sm font-medium hover:bg-[var(--primary-accent)]/10 transition-colors"
                      >
                        Transfer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-orbitron">Your Positions</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[var(--primary-accent)] text-white rounded-lg text-sm font-medium">
                    New Position
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {userPositions.map((position) => (
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
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        position.healthFactor > 1.5 ? 'bg-green-500/10 text-green-500' :
                        position.healthFactor > 1.2 ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        HF: {position.healthFactor}
                      </div>
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
                      <button 
                        onClick={() => {
                          setSelectedAsset(position);
                          setModalType('borrow');
                          setShowModal(true);
                          setAssetNetworkSelection({ asset: position.asset, network: position.chain });
                        }}
                        className="flex-1 bg-[var(--primary-accent)] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[var(--primary-accent)]/90 transition-colors"
                      >
                        Borrow
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedAsset(position);
                          setModalType('repay');
                          setShowModal(true);
                        }}
                        className="flex-1 bg-[var(--card-bg)] border border-[var(--primary-accent)] text-[var(--primary-accent)] py-2 px-4 rounded-lg text-sm font-medium hover:bg-[var(--primary-accent)]/10 transition-colors"
                      >
                        Repay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-orbitron">Recent Activity</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[var(--primary-accent)] text-white rounded-lg text-sm font-medium">
                    Export Data
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                {/* Chain Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setActivityFilterChain('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      activityFilterChain === 'all'
                        ? 'bg-[var(--primary-accent)] text-white'
                        : 'bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-accent)]/10'
                    }`}
                  >
                    <span>🌐</span>
                    <span className="text-sm font-medium">All Chains</span>
                  </button>
                  {supportedChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setActivityFilterChain(chain.name)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        activityFilterChain === chain.name
                          ? 'bg-[var(--primary-accent)] text-white'
                          : 'bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-accent)]/10'
                      }`}
                    >
                      <span>{chain.icon}</span>
                      <span className="text-sm font-medium">{chain.name}</span>
                    </button>
                  ))}
                </div>

                {/* Action Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActivityFilterAction('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      activityFilterAction === 'all'
                        ? 'bg-[var(--primary-accent)] text-white'
                        : 'bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-accent)]/10'
                    }`}
                  >
                    <span>📊</span>
                    <span className="text-sm font-medium">All Actions</span>
                  </button>
                  {[
                    { type: 'deposit', name: 'Deposits', icon: '📥' },
                    { type: 'borrow', name: 'Borrows', icon: '💳' },
                    { type: 'repay', name: 'Repayments', icon: '💸' },
                    { type: 'transfer', name: 'Transfers', icon: '🔄' }
                  ].map((action) => (
                    <button
                      key={action.type}
                      onClick={() => setActivityFilterAction(action.type)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        activityFilterAction === action.type
                          ? 'bg-[var(--primary-accent)] text-white'
                          : 'bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-accent)]/10'
                      }`}
                    >
                      <span>{action.icon}</span>
                      <span className="text-sm font-medium">{action.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity List */}
              <div className="space-y-3">
                {filteredActivity.map((activity) => (
                  <div key={activity.id} className="bg-[var(--card-bg)] rounded-xl p-4 border border-[#23272F]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Action Icon and Asset */}
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getActionIcon(activity.type)}</div>
                          <div className="relative">
                            <img src={activity.icon} alt={activity.asset} className="w-8 h-8 rounded-full" />
                            <img src={activity.chainIcon} alt={activity.chain} className="w-4 h-4 rounded-full absolute -bottom-1 -right-1" />
                          </div>
                          <div>
                            <div className="font-medium">{activity.asset}</div>
                            <div className="text-sm text-[var(--text-muted)]">{activity.chain}</div>
                          </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="text-center">
                          <div className="font-medium">{formatNumber(activity.amount)}</div>
                          <div className="text-sm text-[var(--text-muted)] capitalize">{activity.type}</div>
                        </div>

                        {/* Status and Time */}
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getStatusColor(activity.status)} capitalize`}>
                            {activity.status}
                          </div>
                          <div className="text-sm text-[var(--text-muted)]">
                            {formatTimestamp(activity.timestamp)}
                          </div>
                        </div>
                      </div>

                      {/* Explorer Link */}
                      <div className="flex items-center gap-2">
                        <a
                          href={activity.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] rounded-lg text-sm font-medium hover:bg-[var(--primary-accent)]/20 transition-colors"
                        >
                          View on {activity.chain === 'Ethereum' ? 'Etherscan' : 
                                   activity.chain === 'ZetaChain' ? 'ZetaScan' : 
                                   activity.chain === 'Base' ? 'BaseScan' : 
                                   activity.chain === 'Avalanche' ? 'Snowtrace' : 
                                   activity.chain === 'Solana' ? 'Solscan' : 'Explorer'}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredActivity.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📊</div>
                    <div className="text-lg font-medium text-[var(--text-muted)] mb-2">No activity found</div>
                    <div className="text-sm text-[var(--text-muted)]">Try adjusting your filters</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-orbitron">Cross-Chain Transfer</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transfer Form */}
                <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                  <h4 className="text-lg font-bold mb-4">Transfer Assets</h4>
                  
                  <div className="space-y-4">
                    <AssetNetworkSelector value={assetNetworkSelection} onChange={setAssetNetworkSelection} />
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Amount</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)]"
                      />
                    </div>
                    
                    <button className="w-full bg-[var(--primary-accent)] text-white py-3 px-4 rounded-lg font-medium">
                      Transfer Assets
                    </button>
                  </div>
                </div>

                {/* Transfer History */}
                <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                  <h4 className="text-lg font-bold mb-4">Recent Transfers</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                      <div>
                        <div className="font-medium">USDC</div>
                        <div className="text-sm text-[var(--text-muted)]">Ethereum → Base</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">$5,000</div>
                        <div className="text-sm text-green-500">Completed</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                      <div>
                        <div className="font-medium">ZETA</div>
                        <div className="text-sm text-[var(--text-muted)]">ZetaChain → Ethereum</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">$2,500</div>
                        <div className="text-sm text-green-500">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-orbitron">Settings</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Settings */}
                <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                  <h4 className="text-lg font-bold mb-4">Account Settings</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Default Chain</label>
                      <select className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)]">
                        <option>ZetaChain</option>
                        <option>Ethereum</option>
                        <option>Base</option>
                        <option>Avalanche</option>
                        <option>Solana</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Slippage Tolerance</label>
                      <input 
                        type="number" 
                        placeholder="0.5"
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Auto-Compound Rewards</span>
                      <button className="w-12 h-6 bg-[var(--primary-accent)] rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
                  <h4 className="text-lg font-bold mb-4">Security</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Two-Factor Authentication</span>
                      <button className="px-4 py-2 bg-[var(--primary-accent)] text-white rounded-lg text-sm">
                        Enable
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Transaction Notifications</span>
                      <button className="w-12 h-6 bg-[var(--primary-accent)] rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Liquidation Alerts</span>
                      <button className="w-12 h-6 bg-[var(--primary-accent)] rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 w-full max-w-md mx-4 border border-[#23272F]/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedAsset ? (
                  <>
                    <div className="relative">
                      <img src={selectedAsset.icon} alt={selectedAsset.asset} className="w-8 h-8 rounded-full" />
                      <img src={selectedAsset.chainIcon} alt={selectedAsset.chain} className="w-4 h-4 rounded-full absolute -bottom-1 -right-1" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{selectedAsset.asset}</div>
                      <div className="text-sm text-[var(--text-muted)]">{selectedAsset.chain}</div>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="font-bold text-lg">Deposit Collateral</div>
                    <div className="text-sm text-[var(--text-muted)]">Select chain and asset</div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setSelectedAsset(null);
                  setSelectedDepositChain('');
                  setSelectedDepositAsset('');
                  setAmount('');
                  setAssetNetworkSelection({});
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            {modalType === 'deposit' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Deposit Collateral</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Supply assets as collateral to borrow against them
                </p>
                
                {/* Chain Selection */}
                <AssetNetworkSelector value={assetNetworkSelection} onChange={setAssetNetworkSelection} />
                
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Deposit Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-accent)]"
                    disabled={!assetNetworkSelection.asset}
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAmount('1000')}
                    className="flex-1 px-3 py-1 text-xs bg-[var(--background)] rounded border border-[#23272F]/10 hover:bg-[var(--primary-accent)]/10 transition-colors"
                  >
                    $1K
                  </button>
                  <button 
                    onClick={() => setAmount('5000')}
                    className="flex-1 px-3 py-1 text-xs bg-[var(--background)] rounded border border-[#23272F]/10 hover:bg-[var(--primary-accent)]/10 transition-colors"
                  >
                    $5K
                  </button>
                  <button 
                    onClick={() => setAmount('10000')}
                    className="flex-1 px-3 py-1 text-xs bg-[var(--background)] rounded border border-[#23272F]/10 hover:bg-[var(--primary-accent)]/10 transition-colors"
                  >
                    $10K
                  </button>
                  <button 
                    onClick={() => setAmount('50000')}
                    className="flex-1 px-3 py-1 text-xs bg-[var(--background)] rounded border border-[#23272F]/10 hover:bg-[var(--primary-accent)]/10 transition-colors"
                  >
                    $50K
                  </button>
                </div>
                
                {/* Transaction Details */}
                {assetNetworkSelection.asset && amount && (
                  <div className="space-y-2 text-sm bg-[var(--background)] p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Asset</span>
                      <span className="font-medium">{assetNetworkSelection.asset?.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Chain</span>
                      <span className="font-medium">{assetNetworkSelection.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Amount</span>
                      <span className="font-medium">{formatNumber(parseFloat(amount) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Supply APY</span>
                      <span className="text-green-500">4.25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Cross-Chain</span>
                      <span className="text-[var(--primary-accent)]">✓ Enabled</span>
                    </div>
                  </div>
                )}
                
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isConnected && assetNetworkSelection.asset && amount && !isLoading
                      ? 'bg-[var(--primary-accent)] text-white hover:bg-[var(--primary-accent)]/90'
                      : 'bg-[var(--card-bg)] text-[var(--text-muted)] cursor-not-allowed'
                  }`}
                  disabled={!isConnected || !assetNetworkSelection.asset || !amount || isLoading}
                  onClick={() => {
                    if (!isConnected) {
                      setTransactionStatus({ type: 'error', message: 'Please connect your wallet to deposit.' });
                      return;
                    }
                    const assetAddress = assetNetworkSelection.asset?.erc20?.address || assetNetworkSelection.asset?.zrc20?.address;
                    const network = assetNetworkSelection.network;
                    if (!assetAddress || !network) {
                      setTransactionStatus({ type: 'error', message: 'Missing asset address or network.' });
                      return;
                    }
                    console.log('Deposit button clicked', { network, assetAddress, amount });
                    handleCrossChainAction('supply', {
                      network,
                      assetAddress,
                      amount
                    });
                  }}
                >
                  {isLoading 
                    ? 'Processing...'
                    : isConnected && assetNetworkSelection.asset && amount 
                      ? `Deposit ${assetNetworkSelection.asset?.symbol} on ${assetNetworkSelection.network}`
                      : !isConnected
                        ? 'Connect your wallet to deposit'
                        : 'Select chain, asset, and amount'
                  }
                </button>
                {transactionStatus && transactionStatus.type === 'error' && (
                  <div className="mt-2 text-red-500 text-sm font-medium">{transactionStatus.message}</div>
                )}
              </div>
            )}

            {modalType === 'borrow' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Borrow Assets</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Borrow against your cross-chain collateral
                </p>
                
                <AssetNetworkSelector value={assetNetworkSelection} onChange={setAssetNetworkSelection} />

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Borrow Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Borrow Asset</label>
                  <select className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-accent)]">
                    <option>USDC</option>
                    <option>USDT</option>
                    <option>ETH</option>
                    <option>ZETA</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Destination Chain</label>
                  <select className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-accent)]">
                    <option>Ethereum</option>
                    <option>Base</option>
                    <option>Avalanche</option>
                    <option>Solana</option>
                    <option>BNB Chain</option>
                  </select>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Available to Borrow</span>
                    <span>{formatNumber(selectedAsset?.supplied * 0.8 || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Borrow APY</span>
                    <span className="text-red-500">6.80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Health Factor</span>
                    <span className="text-green-500">{selectedAsset?.healthFactor || 'N/A'}</span>
                  </div>
                </div>
                
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    !isLoading
                      ? 'bg-[var(--primary-accent)] text-white hover:bg-[var(--primary-accent)]/90'
                      : 'bg-[var(--card-bg)] text-[var(--text-muted)] cursor-not-allowed'
                  }`}
                  disabled={isLoading}
                  onClick={() => handleCrossChainAction('borrow', {
                    assetAddress: assetNetworkSelection.asset?.erc20?.address || assetNetworkSelection.asset?.zrc20?.address,
                    amount: amount,
                    destChainId: assetNetworkSelection.network // You may need to map network name to chainId
                  })}
                >
                  {isLoading ? 'Processing...' : 'Borrow Assets'}
                </button>
              </div>
            )}

            {modalType === 'repay' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Repay Loan</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Repay your borrowed assets from any chain
                </p>
                
                <AssetNetworkSelector value={assetNetworkSelection} onChange={setAssetNetworkSelection} />

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Repay Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Repay From Chain</label>
                  <select className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-accent)]">
                    <option>Ethereum</option>
                    <option>Base</option>
                    <option>Avalanche</option>
                    <option>Solana</option>
                    <option>BNB Chain</option>
                  </select>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Borrowed Amount</span>
                    <span>{formatNumber(selectedAsset?.borrowed || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Interest Owed</span>
                    <span className="text-red-500">$45.20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Health Factor</span>
                    <span className="text-green-500">{selectedAsset?.healthFactor || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      !isLoading
                        ? 'bg-[var(--card-bg)] border border-[var(--primary-accent)] text-[var(--primary-accent)] hover:bg-[var(--primary-accent)]/10'
                        : 'bg-[var(--card-bg)] text-[var(--text-muted)] cursor-not-allowed'
                    }`}
                    disabled={isLoading}
                    onClick={() => handleCrossChainAction('repay', {
                      network: assetNetworkSelection.network,
                      assetAddress: assetNetworkSelection.asset?.erc20?.address || assetNetworkSelection.asset?.zrc20?.address,
                      amount: amount
                    })}
                  >
                    {isLoading ? 'Processing...' : 'Repay Partial'}
                  </button>
                  <button 
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      !isLoading
                        ? 'bg-[var(--primary-accent)] text-white hover:bg-[var(--primary-accent)]/90'
                        : 'bg-[var(--card-bg)] text-[var(--text-muted)] cursor-not-allowed'
                    }`}
                    disabled={isLoading}
                    onClick={() => handleCrossChainAction('repay', {
                      network: assetNetworkSelection.network,
                      assetAddress: assetNetworkSelection.asset?.erc20?.address || assetNetworkSelection.asset?.zrc20?.address,
                      amount: selectedAsset?.borrowed || '0' // Repay all borrowed amount
                    })}
                  >
                    {isLoading ? 'Processing...' : 'Repay All'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 