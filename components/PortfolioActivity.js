import React from 'react';
import { NETWORKS } from '../config/contracts';

// Helper to format relative time
function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

// Status icon
function StatusIcon({ status }) {
  if (status === 'success') return <span title="Success">✅</span>;
  if (status === 'pending') return <span title="Pending">⏳</span>;
  if (status === 'failed') return <span title="Failed">❌</span>;
  return null;
}

// Chain icon
function ChainIcon({ chain }) {
  const key = Object.keys(NETWORKS).find(k => NETWORKS[k].name.toLowerCase().includes(chain.toLowerCase()) || chain.toLowerCase().includes(NETWORKS[k].name.toLowerCase()));
  if (!key) return null;
  const icon = `/logos/${NETWORKS[key].name.toLowerCase().includes('avalanche') ? 'avalanche-avax-logo' : NETWORKS[key].name.toLowerCase().includes('base') ? 'base' : NETWORKS[key].name.toLowerCase().includes('bsc') ? 'bnb-bnb-logo' : 'zetachain'}.png`;
  return <img src={icon} alt={NETWORKS[key].name} className="w-5 h-5 inline-block mr-1 align-middle" />;
}

export default function PortfolioActivity({ activity, isLoading }) {
  return (
    <section className="bg-[var(--card-bg)] rounded-2xl shadow-lg border border-[var(--border)] p-6">
      <h2 className="text-lg font-bold mb-4 text-[var(--text-main)]">Recent Activity</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="py-2 px-4 text-left">Time</th>
              <th className="py-2 px-4 text-center">Status</th>
              <th className="py-2 px-4 text-left">Action</th>
              <th className="py-2 px-4 text-left">Asset</th>
              <th className="py-2 px-4 text-left">Chain</th>
              <th className="py-2 px-4 text-right">Amount</th>
              <th className="py-2 px-4 text-center">Explorer</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3 px-4"><div className="h-5 w-20 bg-[var(--border)] rounded animate-pulse" /></td>
                  <td className="py-3 px-4 text-center"><div className="h-5 w-5 bg-[var(--border)] rounded-full animate-pulse mx-auto" /></td>
                  <td className="py-3 px-4"><div className="h-5 w-16 bg-[var(--border)] rounded animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-5 w-12 bg-[var(--border)] rounded animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-5 w-16 bg-[var(--border)] rounded animate-pulse" /></td>
                  <td className="py-3 px-4 text-right"><div className="h-5 w-14 bg-[var(--border)] rounded animate-pulse ml-auto" /></td>
                  <td className="py-3 px-4 text-center"><div className="h-5 w-8 bg-[var(--border)] rounded animate-pulse mx-auto" /></td>
                </tr>
              ))
            ) : (
              activity && activity.length > 0 ? activity.map((item, i) => {
                // Find chain key for explorer
                const chainKey = Object.keys(NETWORKS).find(k => NETWORKS[k].name.toLowerCase().includes(item.chain.toLowerCase()) || item.chain.toLowerCase().includes(NETWORKS[k].name.toLowerCase()));
                const explorer = chainKey ? NETWORKS[chainKey].explorer : null;
                return (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 px-4">{formatTime(item.date)}</td>
                    <td className="py-3 px-4 text-center"><StatusIcon status={item.status} /></td>
                    <td className="py-3 px-4">{item.action}</td>
                    <td className="py-3 px-4">{item.asset}</td>
                    <td className="py-3 px-4"><ChainIcon chain={item.chain} />{item.chain}</td>
                    <td className="py-3 px-4 text-right">{item.amount}</td>
                    <td className="py-3 px-4 text-center">
                      {explorer && item.txHash ? (
                        <a href={`${explorer}/tx/${item.txHash}`} target="_blank" rel="noopener noreferrer" title="View on block explorer" className="text-[var(--primary-accent)] underline hover:no-underline">
                          🔗
                        </a>
                      ) : '--'}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[var(--text-muted)]">No recent activity.</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
} 