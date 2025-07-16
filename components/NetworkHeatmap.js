import React from 'react';

// Optionally, you can use a sparkline library or a simple SVG for sparklines
// import { Sparklines, SparklinesLine } from 'react-sparklines';

export default function NetworkHeatmap({ chains, selectedChain, onSelectChain }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 text-[var(--text-main)]">Network Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {chains.map(chain => (
          <button
            key={chain.id}
            className={`rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform focus:outline-none ${selectedChain === chain.id ? 'ring-2 ring-[var(--primary-accent)]' : ''}`}
            onClick={() => onSelectChain && onSelectChain(chain.id)}
            aria-label={`Show portfolio for ${chain.name}`}
            type="button"
          >
            <img src={chain.icon} alt={chain.name} className="w-8 h-8 mb-2" />
            <span className="font-bold text-[var(--text-main)] mb-1">{chain.name}</span>
            <div className="text-xs text-[var(--text-muted)] mt-1">Supplied: ${chain.supplied}</div>
            <div className="text-xs text-[var(--text-muted)]">Borrowed: ${chain.borrowed}</div>
            <div className="w-full mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded" style={{ background: chain.color || 'var(--primary-accent)', width: `${chain.percentOfPortfolio}%`, minWidth: 8 }} />
              <span className="text-xs text-[var(--text-muted)]">{chain.percentOfPortfolio}%</span>
            </div>
            {/* Optional: Sparkline (mocked as a simple SVG for now) */}
            <div className="w-full mt-2 flex justify-center">
              <svg width="60" height="18" viewBox="0 0 60 18">
                <polyline
                  fill="none"
                  stroke={chain.color || 'var(--primary-accent)'}
                  strokeWidth="2"
                  points={chain.sparklineData?.map((v, i, arr) => `${i * (60/(arr.length-1))},${18 - (v/Math.max(...arr))*16}` ).join(' ') || ''}
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
} 