import React from 'react';

export default function NetworkAvailabilityGrid({ chains }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 font-orbitron gradient-text">Network Availability</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {chains.map((chain) => (
          <div
            key={chain.name}
            className={`rounded-2xl p-6 border shadow-lg flex flex-col items-center text-center bg-white/10 backdrop-blur-md ${chain.status === 'Live' ? 'border-green-400' : 'border-yellow-400 opacity-70'}`}
          >
            <img src={chain.icon} alt={chain.name} className="w-12 h-12 mb-3 rounded-full shadow" />
            <div className="font-bold text-lg mb-1">{chain.name}</div>
            <div className={`text-sm mb-2 ${chain.status === 'Live' ? 'text-green-500' : 'text-yellow-500'}`}>{chain.status === 'Live' ? '✅ Live' : '🔜 Coming'}</div>
            <div className="text-xs text-[var(--text-muted)]">Assets: {chain.assets.join(', ')}</div>
          </div>
        ))}
      </div>
    </section>
  );
} 