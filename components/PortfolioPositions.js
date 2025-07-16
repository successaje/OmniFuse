import React from 'react';

export default function PortfolioPositions({ positions, isLoading, onAction }) {
  return (
    <section className="bg-[var(--card-bg)] rounded-2xl shadow-lg border border-[var(--border)] p-6">
      <h2 className="text-lg font-bold mb-4 text-[var(--text-main)]">Positions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="py-2 px-4 text-left">Chain</th>
              <th className="py-2 px-4 text-left">Asset</th>
              <th className="py-2 px-4 text-right">Supplied</th>
              <th className="py-2 px-4 text-right">Borrowed</th>
              <th className="py-2 px-4 text-right">Value (USD)</th>
              <th className="py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-3 px-4"><div className="h-5 w-20 bg-[var(--border)] rounded animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-5 w-16 bg-[var(--border)] rounded animate-pulse" /></td>
                  <td className="py-3 px-4 text-right"><div className="h-5 w-12 bg-[var(--border)] rounded animate-pulse ml-auto" /></td>
                  <td className="py-3 px-4 text-right"><div className="h-5 w-12 bg-[var(--border)] rounded animate-pulse ml-auto" /></td>
                  <td className="py-3 px-4 text-right"><div className="h-5 w-16 bg-[var(--border)] rounded animate-pulse ml-auto" /></td>
                  <td className="py-3 px-4 text-center"><div className="h-5 w-24 bg-[var(--border)] rounded animate-pulse mx-auto" /></td>
                </tr>
              ))
            ) : (
              positions && positions.length > 0 ? positions.map((pos, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3 px-4">{pos.chain}</td>
                  <td className="py-3 px-4">{pos.asset}</td>
                  <td className="py-3 px-4 text-right">{pos.supplied}</td>
                  <td className="py-3 px-4 text-right">{pos.borrowed}</td>
                  <td className="py-3 px-4 text-right">{pos.value}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="px-3 py-1 rounded bg-blue-500/90 text-white text-xs font-semibold hover:bg-blue-600 transition"
                        onClick={() => onAction && onAction('withdraw', pos)}
                        disabled={!pos.supplied || pos.supplied <= 0}
                        title="Withdraw"
                      >Withdraw</button>
                      <button
                        className="px-3 py-1 rounded bg-green-500/90 text-white text-xs font-semibold hover:bg-green-600 transition"
                        onClick={() => onAction && onAction('repay', pos)}
                        disabled={!pos.borrowed || pos.borrowed <= 0}
                        title="Repay"
                      >Repay</button>
                      <button
                        className="px-3 py-1 rounded bg-[var(--primary-accent)] text-white text-xs font-semibold hover:bg-[var(--primary-accent)]/80 transition"
                        onClick={() => onAction && onAction('add', pos)}
                        title="Add More"
                      >Add More</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[var(--text-muted)]">No positions found.</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
} 