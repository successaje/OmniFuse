import React from 'react';

export default function FeaturedMarketsCarousel({ markets }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 font-orbitron gradient-text">Featured Markets</h2>
      <div className="flex gap-6 overflow-x-auto pb-2 snap-x">
        {markets.map((market) => (
          <div
            key={market.id}
            className="min-w-[300px] max-w-xs bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col items-center text-center snap-center relative"
          >
            {market.isFeatured && (
              <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">Featured</span>
            )}
            <div className="flex items-center gap-2 mb-2">
              <img src={market.icon} alt={market.asset} className="w-10 h-10 rounded-full" />
              <img src={market.chainIcon} alt={market.chain} className="w-6 h-6 rounded-full border-2 border-white -ml-3" />
            </div>
            <div className="font-bold text-lg mb-1">{market.asset}</div>
            <div className="text-sm text-[var(--text-muted)] mb-2">{market.chain}</div>
            <div className="flex justify-center gap-4 mb-2">
              <div>
                <div className="text-xs text-[var(--text-muted)]">Supply APY</div>
                <div className="text-green-500 font-bold">{market.supplyAPY}%</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">Borrow APY</div>
                <div className="text-red-500 font-bold">{market.borrowAPY}%</div>
              </div>
            </div>
            <div className="text-xs text-[var(--text-muted)] mb-4">TVL: ${market.totalSupply.toLocaleString()}</div>
            <div className="flex gap-2 w-full">
              <button className="flex-1 bg-[var(--primary-accent)] text-white py-2 px-3 rounded-xl font-medium hover:bg-[var(--primary-accent)]/90 transition-colors text-xs">Supply</button>
              <button className="flex-1 bg-[var(--card-bg)] border border-[var(--primary-accent)] text-[var(--primary-accent)] py-2 px-3 rounded-xl font-medium hover:bg-[var(--primary-accent)]/10 transition-colors text-xs">Borrow</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 