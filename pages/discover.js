import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import LandingHeader from '../components/LandingHeader';
import ProtocolHighlights from '../components/ProtocolHighlights';
import FeaturedMarketsCarousel from '../components/FeaturedMarketsCarousel';
import NetworkAvailabilityGrid from '../components/NetworkAvailabilityGrid';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import RewardsIncentives from '../components/RewardsIncentives';
import EducationalExplainer from '../components/EducationalExplainer';
import FeaturedBlogNews from '../components/FeaturedBlogNews';

// Mock data for markets
const markets = [
  {
    id: 'zeta-zetachain',
    asset: 'ZETA',
    chain: 'ZetaChain',
    icon: '/logos/zetachain.png',
    chainIcon: '/logos/zetachain.png',
    supplyAPY: 5.85,
    borrowAPY: 7.20,
    totalSupply: 8500000,
    totalBorrow: 5200000,
    utilization: 61.2,
    collateralFactor: 0.90,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'btc-bitcoin',
    asset: 'BTC',
    chain: 'Bitcoin',
    icon: '/logos/bitcoin-btc-logo.png',
    chainIcon: '/logos/bitcoin-btc-logo.png',
    supplyAPY: 3.15,
    borrowAPY: 5.80,
    totalSupply: 850,
    totalBorrow: 420,
    utilization: 49.4,
    collateralFactor: 0.75,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'avax-avalanche',
    asset: 'AVAX',
    chain: 'Avalanche',
    icon: '/logos/avalanche-avax-logo.png',
    chainIcon: '/logos/avalanche-avax-logo.png',
    supplyAPY: 4.35,
    borrowAPY: 6.60,
    totalSupply: 125000,
    totalBorrow: 68000,
    utilization: 54.4,
    collateralFactor: 0.80,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'usdc-avax',
    asset: 'USDC.AVAX',
    chain: 'Avalanche',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/avalanche-avax-logo.png',
    supplyAPY: 4.85,
    borrowAPY: 6.95,
    totalSupply: 8500000,
    totalBorrow: 5200000,
    utilization: 61.2,
    collateralFactor: 0.85,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'usdt-avax',
    asset: 'USDT.AVAX',
    chain: 'Avalanche',
    icon: '/logos/tether-usdt-logo.png',
    chainIcon: '/logos/avalanche-avax-logo.png',
    supplyAPY: 4.65,
    borrowAPY: 6.75,
    totalSupply: 7200000,
    totalBorrow: 4500000,
    utilization: 62.5,
    collateralFactor: 0.85,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'sol-solana',
    asset: 'SOL',
    chain: 'Solana',
    icon: '/logos/solana-sol-logo.png',
    chainIcon: '/logos/solana-sol-logo.png',
    supplyAPY: 3.85,
    borrowAPY: 6.25,
    totalSupply: 125000,
    totalBorrow: 68000,
    utilization: 54.4,
    collateralFactor: 0.75,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'usdc-sol',
    asset: 'USDC.SOL',
    chain: 'Solana',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/solana-sol-logo.png',
    supplyAPY: 4.95,
    borrowAPY: 7.05,
    totalSupply: 6800000,
    totalBorrow: 4200000,
    utilization: 61.8,
    collateralFactor: 0.85,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'usdt-sol',
    asset: 'USDT.SOL',
    chain: 'Solana',
    icon: '/logos/tether-usdt-logo.png',
    chainIcon: '/logos/solana-sol-logo.png',
    supplyAPY: 4.75,
    borrowAPY: 6.85,
    totalSupply: 5800000,
    totalBorrow: 3600000,
    utilization: 62.1,
    collateralFactor: 0.85,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'cbbtc-sol',
    asset: 'CBBTC.SOL',
    chain: 'Solana',
    icon: '/logos/bitcoin-btc-logo.png',
    chainIcon: '/logos/solana-sol-logo.png',
    supplyAPY: 2.95,
    borrowAPY: 5.35,
    totalSupply: 450,
    totalBorrow: 220,
    utilization: 48.9,
    collateralFactor: 0.70,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'usdc-ethereum',
    asset: 'USDC',
    chain: 'Ethereum',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/ethereum-eth-logo.png',
    supplyAPY: 4.25,
    borrowAPY: 6.80,
    totalSupply: 12500000,
    totalBorrow: 8900000,
    utilization: 71.2,
    collateralFactor: 0.85,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'usdt-polygon',
    asset: 'USDT',
    chain: 'Polygon',
    icon: '/logos/tether-usdt-logo.png',
    chainIcon: '/logos/polygon-matic-logo.png',
    supplyAPY: 3.95,
    borrowAPY: 6.45,
    totalSupply: 8900000,
    totalBorrow: 5200000,
    utilization: 58.4,
    collateralFactor: 0.80,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'eth-base',
    asset: 'ETH.BASE',
    chain: 'Base',
    icon: '/logos/ethereum-eth-logo.png',
    chainIcon: '/logos/base.png',
    supplyAPY: 3.25,
    borrowAPY: 6.30,
    totalSupply: 3200,
    totalBorrow: 1800,
    utilization: 56.3,
    collateralFactor: 0.80,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'usdc-base',
    asset: 'USDC.BASE',
    chain: 'Base',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/base.png',
    supplyAPY: 4.75,
    borrowAPY: 6.85,
    totalSupply: 9200000,
    totalBorrow: 5800000,
    utilization: 63.0,
    collateralFactor: 0.85,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'cbbtc-base',
    asset: 'CBBTC.BASE',
    chain: 'Base',
    icon: '/logos/bitcoin-btc-logo.png',
    chainIcon: '/logos/base.png',
    supplyAPY: 2.85,
    borrowAPY: 5.45,
    totalSupply: 380,
    totalBorrow: 190,
    utilization: 50.0,
    collateralFactor: 0.70,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'eth-ethereum',
    asset: 'ETH',
    chain: 'Ethereum',
    icon: '/logos/ethereum-eth-logo.png',
    chainIcon: '/logos/ethereum-eth-logo.png',
    supplyAPY: 2.15,
    borrowAPY: 5.20,
    totalSupply: 4500,
    totalBorrow: 2100,
    utilization: 46.7,
    collateralFactor: 0.75,
    isActive: true,
    isCrossChain: false
  },
  {
    id: 'matic-polygon',
    asset: 'MATIC',
    chain: 'Polygon',
    icon: '/logos/polygon-matic-logo.png',
    chainIcon: '/logos/polygon-matic-logo.png',
    supplyAPY: 3.45,
    borrowAPY: 5.90,
    totalSupply: 8500000,
    totalBorrow: 3800000,
    utilization: 44.7,
    collateralFactor: 0.70,
    isActive: true,
    isCrossChain: false
  },
  {
    id: 'usdc-bsc',
    asset: 'USDC.BSC',
    chain: 'BNB Chain',
    icon: '/logos/usd-coin-usdc-logo.png',
    chainIcon: '/logos/bnb-bnb-logo.png',
    supplyAPY: 4.55,
    borrowAPY: 6.65,
    totalSupply: 7800000,
    totalBorrow: 4800000,
    utilization: 61.5,
    collateralFactor: 0.85,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'usdt-bsc',
    asset: 'USDT.BSC',
    chain: 'BNB Chain',
    icon: '/logos/tether-usdt-logo.png',
    chainIcon: '/logos/bnb-bnb-logo.png',
    supplyAPY: 4.35,
    borrowAPY: 6.45,
    totalSupply: 6500000,
    totalBorrow: 3900000,
    utilization: 60.0,
    collateralFactor: 0.85,
    isActive: true,
    isCrossChain: true
  },
  {
    id: 'bnb-bnb',
    asset: 'BNB',
    chain: 'BNB Chain',
    icon: '/logos/bnb-bnb-logo.png',
    chainIcon: '/logos/bnb-bnb-logo.png',
    supplyAPY: 2.55,
    borrowAPY: 5.15,
    totalSupply: 3200,
    totalBorrow: 1450,
    utilization: 45.3,
    collateralFactor: 0.70,
    isActive: true,
    isCrossChain: false
  }
];

const stats = [
  { label: 'Total Value Locked', value: '$28.5M', change: '+12.4%', positive: true },
  { label: 'Total Borrowed', value: '$18.2M', change: '+8.7%', positive: true },
  { label: 'Active Markets', value: '6', change: '+2', positive: true },
  { label: 'Avg Supply APY', value: '3.2%', change: '+0.3%', positive: true }
];

// Add isFeatured to a few markets for demo
const featuredMarkets = markets.slice(0, 6).map((m, i) => ({ ...m, isFeatured: i < 3 }));

const networkChains = [
  {
    name: 'Ethereum',
    icon: '/logos/ethereum-eth-logo.png',
    status: 'Live',
    assets: ['USDC', 'ETH']
  },
  {
    name: 'BNB Chain',
    icon: '/logos/bnb-bnb-logo.png',
    status: 'Live',
    assets: ['BNB', 'USDT']
  },
  {
    name: 'Avalanche',
    icon: '/logos/avalanche-avax-logo.png',
    status: 'Live',
    assets: ['USDC', 'USDT']
  },
  {
    name: 'Polygon',
    icon: '/logos/polygon-matic-logo.png',
    status: 'Coming',
    assets: ['MATIC']
  },
  {
    name: 'Base',
    icon: '/logos/base.png',
    status: 'Live',
    assets: ['ETH', 'USDC']
  },
  {
    name: 'Solana',
    icon: '/logos/solana-sol-logo.png',
    status: 'Coming',
    assets: ['SOL', 'USDC', 'USDT']
  },
  {
    name: 'ZetaChain',
    icon: '/logos/zetachain.png',
    status: 'Live',
    assets: ['ZETA']
  }
];

export default function DiscoverPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('supplyAPY');

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.chain.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    switch (sortBy) {
      case 'supplyAPY':
        return b.supplyAPY - a.supplyAPY;
      case 'borrowAPY':
        return a.borrowAPY - b.borrowAPY;
      case 'utilization':
        return b.utilization - a.utilization;
      case 'totalSupply':
        return b.totalSupply - a.totalSupply;
      default:
        return 0;
    }
  });

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  return (
    <>
      <LandingHeader brandClass="font-orbitron" />
      
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] transition-colors duration-500 pt-16">
        {/* Header Section */}
        <div className="bg-[var(--card-bg)] border-b border-[#23272F]/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-orbitron gradient-text mb-2">
                  Discover Markets
                </h1>
                <p className="text-[var(--text-muted)]">
                  Deposit and borrow across multiple chains with competitive rates
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-[var(--background)] rounded-xl p-4 border border-[#23272F]/10">
                    <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
                    <div className="text-xl font-bold font-orbitron">{stat.value}</div>
                    <div className={`text-xs ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search and Sort */}
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[#23272F]/10 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-accent)]"
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[#23272F]/10 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-accent)]"
              >
                <option value="supplyAPY">Sort by Supply APY</option>
                <option value="borrowAPY">Sort by Borrow APY</option>
                <option value="utilization">Sort by Utilization</option>
                <option value="totalSupply">Sort by Total Supply</option>
              </select>
            </div>
          </div>
        </div>

        {/* Protocol Highlights */}
        <ProtocolHighlights />

        {/* Featured Markets Carousel */}
        <FeaturedMarketsCarousel markets={featuredMarkets} />

        {/* Network Availability Section */}
        <NetworkAvailabilityGrid chains={networkChains} />

        {/* New: Rewards & Incentives */}
        <RewardsIncentives />

        {/* New: User Testimonials & Social Proof */}
        <Testimonials />

        {/* New: Educational/Explainer Content */}
        <EducationalExplainer />

        {/* New: Featured Blog/News */}
        <FeaturedBlogNews />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Optionally keep the full markets grid below, or comment out for a cleaner look */}
        {/*
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedMarkets.map((market) => (
              <div key={market.id} className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10 hover:shadow-lg transition-all duration-300">
                {/* Market Header */}
                {/*
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={market.icon} alt={market.asset} className="w-10 h-10 rounded-full" />
                      <img src={market.chainIcon} alt={market.chain} className="w-5 h-5 rounded-full absolute -bottom-1 -right-1" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{market.asset}</div>
                      <div className="text-sm text-[var(--text-muted)]">{market.chain}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {market.isCrossChain && (
                      <span className="px-2 py-1 bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] text-xs rounded-full">
                        Cross-Chain
                      </span>
                    )}
                    <div className={`w-3 h-3 rounded-full ${market.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>

                {/* APY Rates */}
                {/*
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[var(--background)] rounded-xl p-4">
                    <div className="text-sm text-[var(--text-muted)] mb-1">Supply APY</div>
                    <div className="text-2xl font-bold text-green-500">{market.supplyAPY}%</div>
                  </div>
                  <div className="bg-[var(--background)] rounded-xl p-4">
                    <div className="text-sm text-[var(--text-muted)] mb-1">Borrow APY</div>
                    <div className="text-2xl font-bold text-red-500">{market.borrowAPY}%</div>
                  </div>
                </div>

                {/* Market Stats */}
                {/*
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-muted)]">Total Supply</span>
                    <span className="font-medium">{formatNumber(market.totalSupply)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-muted)]">Total Borrow</span>
                    <span className="font-medium">{formatNumber(market.totalBorrow)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-muted)]">Utilization</span>
                    <span className="font-medium">{market.utilization}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-muted)]">Collateral Factor</span>
                    <span className="font-medium">{market.collateralFactor * 100}%</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {/*
                <div className="flex gap-3">
                  <button className="flex-1 bg-[var(--primary-accent)] text-white py-3 px-4 rounded-xl font-medium hover:bg-[var(--primary-accent)]/90 transition-colors">
                    Supply
                  </button>
                  <button className="flex-1 bg-[var(--card-bg)] border border-[var(--primary-accent)] text-[var(--primary-accent)] py-3 px-4 rounded-xl font-medium hover:bg-[var(--primary-accent)]/10 transition-colors">
                    Borrow
                  </button>
                </div>
              </div>
            ))}
          </div>

          {sortedMarkets.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-xl font-medium text-[var(--text-muted)]">No markets found</div>
              <div className="text-sm text-[var(--text-muted)]">Try adjusting your filters</div>
            </div>
          )}
        </div>
        */}
      </div>
    </>
  );
} 