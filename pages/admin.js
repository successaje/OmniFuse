import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TestIntegration from '../components/TestIntegration';
import AssetNetworkSelector from '../components/AssetNetworkSelector';

export default function AdminPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [systemStatus, setSystemStatus] = useState({
    keeper: 'online',
    liquidations: 0,
    totalValueLocked: '$2.5M',
    activePositions: 156,
    lastUpdate: new Date()
  });
  const [recentLiquidations, setRecentLiquidations] = useState([
    { id: 1, user: '0x1234...5678', amount: '$1,200', chain: 'Polygon', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, user: '0xabcd...efgh', amount: '$800', chain: 'BNB Chain', timestamp: new Date(Date.now() - 7200000) },
  ]);
  const [keeperLogs, setKeeperLogs] = useState([
    { id: 1, level: 'info', message: 'Monitoring 156 active positions', timestamp: new Date(Date.now() - 300000) },
    { id: 2, level: 'warning', message: 'Health factor below 1.2 detected for 3 positions', timestamp: new Date(Date.now() - 600000) },
    { id: 3, level: 'success', message: 'Liquidation executed successfully on Polygon', timestamp: new Date(Date.now() - 3600000) },
  ]);
  const [assetNetworkSelection, setAssetNetworkSelection] = useState({});

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'info': return 'text-[#3B82F6]';
      case 'warning': return 'text-[#FACC15]';
      case 'success': return 'text-[#10B981]';
      case 'error': return 'text-[#EF4444]';
      default: return 'text-[#9CA3AF]';
    }
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'text-[#10B981]' : 'text-[#EF4444]';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass p-12 text-center">
            <h1 className="text-3xl font-bold gradient-text mb-6">Admin Access Required</h1>
            <p className="text-[#9CA3AF] mb-8">Please connect your wallet to access admin features</p>
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="glass p-6 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">⚡</div>
            <h1 className="text-2xl font-bold gradient-text">OmniFuse</h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass p-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-center space-x-8">
          <button className="nav-link" onClick={() => router.push('/dashboard')}>Dashboard</button>
          <button className="nav-link active">Admin</button>
          <a href="https://docs.omnifuse.com" target="_blank" rel="noopener noreferrer" className="nav-link">Docs</a>
          <a href="https://faucet.zetachain.com" target="_blank" rel="noopener noreferrer" className="nav-link">Faucet</a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        {/* Asset & Network Selector for admin/test actions */}
        <div className="mb-6">
          <AssetNetworkSelector value={assetNetworkSelection} onChange={setAssetNetworkSelection} />
        </div>
        {/* Contract Integration Test */}
        <div className="panel-card mb-8">
          <TestIntegration assetNetworkSelection={assetNetworkSelection} />
        </div>
        
        {/* System Status */}
        <div className="panel-card mb-8">
          <h3 className="text-xl font-bold text-[#F3F4F6] mb-6">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="status-item">
              <span className="status-label">Keeper Status:</span>
              <span className={`status-value ${getStatusColor(systemStatus.keeper)}`}>
                {systemStatus.keeper.toUpperCase()}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Total Liquidations:</span>
              <span className="status-value">{systemStatus.liquidations}</span>
            </div>
            <div className="status-item">
              <span className="status-label">TVL:</span>
              <span className="status-value">{systemStatus.totalValueLocked}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Active Positions:</span>
              <span className="status-value">{systemStatus.activePositions}</span>
            </div>
          </div>
          <div className="mt-4 text-right">
            <span className="text-[#9CA3AF] text-sm">
              Last updated: {formatTimeAgo(systemStatus.lastUpdate)}
            </span>
          </div>
        </div>

        {/* Keeper Logs */}
        <div className="panel-card mb-8">
          <h3 className="text-xl font-bold text-[#F3F4F6] mb-6">Keeper Logs</h3>
          <div className="space-y-3">
            {keeperLogs.map((log) => (
              <div key={log.id} className="activity-item">
                <div className="flex items-center">
                  <span className={`activity-icon ${getLogLevelColor(log.level)}`}>
                    {log.level === 'info' ? 'ℹ️' : 
                     log.level === 'warning' ? '⚠️' : 
                     log.level === 'success' ? '✅' : '❌'}
                  </span>
                  <span className="activity-message">{log.message}</span>
                </div>
                <span className="activity-time">{formatTimeAgo(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Liquidations */}
        <div className="panel-card">
          <h3 className="text-xl font-bold text-[#F3F4F6] mb-6">Recent Liquidations</h3>
          <div className="space-y-3">
            {recentLiquidations.map((liquidation) => (
              <div key={liquidation.id} className="activity-item">
                <div className="flex items-center">
                  <span className="activity-icon text-[#EF4444]">💥</span>
                  <span className="activity-message">
                    Liquidated {liquidation.amount} on {liquidation.chain} - {liquidation.user}
                  </span>
                </div>
                <span className="activity-time">{formatTimeAgo(liquidation.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 