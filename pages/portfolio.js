import LandingHeader from '../components/LandingHeader';
import { useTheme } from '../components/ThemeProvider';
import { useOmniFuse } from '../hooks/useOmniFuse';
import PortfolioSummary from '../components/PortfolioSummary';
import PortfolioPositions from '../components/PortfolioPositions';
import PortfolioActivity from '../components/PortfolioActivity';
import NetworkHeatmap from '../components/NetworkHeatmap';
import { useAccount } from 'wagmi';
import { useState, useMemo } from 'react';
import { NETWORKS } from '../config/contracts';

// Chain-specific accent colors
const chainColors = {
  ZETA_TESTNET: '#3B82F6', // blue
  BASE_SEPOLIA: '#0052FF', // base blue
  AVALANCHE_FUJI: '#E84142', // avalanche red
  BSC_TESTNET: '#F3BA2F', // bsc yellow
};

export default function PortfolioPage() {
  const { theme } = useTheme();
  const { isConnected } = useAccount();
  const {
    userPosition,
    isLoading,
    recentActivity,
    supplyToZeta,
    withdrawCrossChain,
    repayToZeta,
    loadUserPosition
  } = useOmniFuse();
  const [selectedChain, setSelectedChain] = useState(null);
  const [modal, setModal] = useState({ open: false, action: null, position: null });
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState(null);

  // Fallback mock data
  const mockSummary = {
    netWorth: 12000,
    totalSupplied: 15000,
    totalBorrowed: 3000,
    healthFactor: 2.5,
  };
  const mockPositions = [
    { chain: 'ZetaChain', asset: 'USDC', supplied: 5000, borrowed: 0, value: 5000 },
    { chain: 'Base', asset: 'ETH', supplied: 0.5, borrowed: 0.1, value: 1200 },
    { chain: 'Avalanche', asset: 'USDC', supplied: 2000, borrowed: 0, value: 2000 },
  ];
  const mockActivity = [
    { date: '2024-06-01', action: 'Supply', asset: 'USDC', chain: 'ZetaChain', amount: 5000 },
    { date: '2024-06-02', action: 'Borrow', asset: 'ETH', chain: 'Base', amount: 0.1 },
    { date: '2024-06-03', action: 'Repay', asset: 'ETH', chain: 'Base', amount: 0.05 },
  ];
  const mockChains = [
    {
      id: 'ZETA_TESTNET',
      name: 'ZetaChain',
      icon: '/logos/zetachain.png',
      supplied: 5000,
      borrowed: 1000,
      percentOfPortfolio: 40,
      sparklineData: [4000, 4200, 4500, 5000],
      color: chainColors.ZETA_TESTNET,
    },
    {
      id: 'BASE_SEPOLIA',
      name: 'Base',
      icon: '/logos/base.png',
      supplied: 3000,
      borrowed: 500,
      percentOfPortfolio: 25,
      sparklineData: [2000, 2500, 2800, 3000],
      color: chainColors.BASE_SEPOLIA,
    },
    {
      id: 'AVALANCHE_FUJI',
      name: 'Avalanche',
      icon: '/logos/avalanche-avax-logo.png',
      supplied: 2000,
      borrowed: 0,
      percentOfPortfolio: 20,
      sparklineData: [1500, 1700, 1900, 2000],
      color: chainColors.AVALANCHE_FUJI,
    },
    {
      id: 'BSC_TESTNET',
      name: 'BSC',
      icon: '/logos/bnb-bnb-logo.png',
      supplied: 1000,
      borrowed: 200,
      percentOfPortfolio: 15,
      sparklineData: [800, 900, 950, 1000],
      color: chainColors.BSC_TESTNET,
    },
  ];

  // Aggregate live data by chain for heatmap
  const liveChains = useMemo(() => {
    if (!isConnected || !userPosition || !userPosition.positions) return null;
    // Group positions by chain key
    const chainMap = {};
    let totalSupplied = 0;
    userPosition.positions.forEach(pos => {
      const chainKey = Object.keys(NETWORKS).find(
        key => NETWORKS[key].name.toLowerCase().includes(pos.chain.toLowerCase()) || pos.chain.toLowerCase().includes(NETWORKS[key].name.toLowerCase())
      );
      if (!chainKey) return;
      if (!chainMap[chainKey]) {
        chainMap[chainKey] = {
          id: chainKey,
          name: NETWORKS[chainKey].name.replace(' Testnet', ''),
          icon: `/logos/${NETWORKS[chainKey].name.toLowerCase().includes('avalanche') ? 'avalanche-avax-logo' : NETWORKS[chainKey].name.toLowerCase().includes('base') ? 'base' : NETWORKS[chainKey].name.toLowerCase().includes('bsc') ? 'bnb-bnb-logo' : 'zetachain'}.png`,
          supplied: 0,
          borrowed: 0,
          percentOfPortfolio: 0,
          sparklineData: [], // TODO: add real sparkline data if available
          color: chainColors[chainKey] || '#3B82F6',
        };
      }
      chainMap[chainKey].supplied += Number(pos.supplied) || 0;
      chainMap[chainKey].borrowed += Number(pos.borrowed) || 0;
      totalSupplied += Number(pos.supplied) || 0;
    });
    // Calculate percent of portfolio
    Object.values(chainMap).forEach(chain => {
      chain.percentOfPortfolio = totalSupplied > 0 ? Math.round((chain.supplied / totalSupplied) * 100) : 0;
    });
    return Object.values(chainMap);
  }, [isConnected, userPosition]);

  // Filter positions/activity by selectedChain if set
  const filteredPositions = selectedChain
    ? (isConnected && userPosition?.positions ? userPosition.positions : mockPositions).filter(pos => pos.chain.toLowerCase().includes(selectedChain.toLowerCase()) || pos.chain === selectedChain)
    : (isConnected && userPosition?.positions ? userPosition.positions : mockPositions);
  const filteredActivity = selectedChain
    ? (isConnected && recentActivity ? recentActivity : mockActivity).filter(act => act.chain.toLowerCase().includes(selectedChain.toLowerCase()) || act.chain === selectedChain)
    : (isConnected && recentActivity ? recentActivity : mockActivity);

  // Handle action button click
  const handleAction = (action, position) => {
    setModal({ open: true, action, position });
    setAmount('');
    setTxStatus(null);
  };

  // Handle modal confirm
  const handleConfirm = async () => {
    if (!modal.open || !modal.action || !modal.position || !amount) return;
    setTxStatus('pending');
    try {
      let result;
      if (modal.action === 'withdraw') {
        result = await withdrawCrossChain(
          modal.position.assetAddress,
          amount,
          modal.position.chainId // You may need to map chain name to chainId
        );
      } else if (modal.action === 'repay') {
        result = await repayToZeta(
          modal.position.chain,
          modal.position.assetAddress,
          amount
        );
      } else if (modal.action === 'add') {
        result = await supplyToZeta(
          modal.position.chain,
          modal.position.assetAddress,
          amount
        );
      }
      if (result && result.success) {
        setTxStatus('success');
        await loadUserPosition();
        setTimeout(() => setModal({ open: false, action: null, position: null }), 1200);
      } else {
        setTxStatus('error');
      }
    } catch (err) {
      setTxStatus('error');
    }
  };

  return (
    <>
      <LandingHeader brandClass="font-orbitron" />
      <main className="min-h-screen bg-[var(--background)] text-[var(--text-main)] pt-24 px-4">
        <div className="max-w-6xl mx-auto w-full space-y-10">
          <NetworkHeatmap chains={liveChains || mockChains} selectedChain={selectedChain} onSelectChain={setSelectedChain} />
          <PortfolioSummary summary={isConnected && userPosition ? userPosition : mockSummary} isLoading={isLoading} />
          <PortfolioPositions positions={filteredPositions} isLoading={isLoading} onAction={handleAction} />
          <PortfolioActivity activity={filteredActivity} isLoading={isLoading} />
        </div>
        {/* Action Modal */}
        {modal.open && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-[var(--card-bg)] rounded-2xl p-8 shadow-2xl w-full max-w-md border border-[var(--border)]">
              <h3 className="text-xl font-bold mb-4 capitalize">{modal.action} {modal.position.asset} on {modal.position.chain}</h3>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-main)] mb-4"
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="flex-1 py-2 rounded bg-[var(--primary-accent)] text-white font-semibold hover:bg-[var(--primary-accent)]/80 transition"
                  onClick={handleConfirm}
                  disabled={txStatus === 'pending' || !amount}
                >
                  {txStatus === 'pending' ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  className="flex-1 py-2 rounded bg-gray-500/80 text-white font-semibold hover:bg-gray-600 transition"
                  onClick={() => setModal({ open: false, action: null, position: null })}
                  disabled={txStatus === 'pending'}
                >Cancel</button>
              </div>
              {txStatus === 'success' && <div className="mt-3 text-green-500 font-medium">Transaction successful!</div>}
              {txStatus === 'error' && <div className="mt-3 text-red-500 font-medium">Transaction failed.</div>}
            </div>
          </div>
        )}
      </main>
    </>
  );
} 