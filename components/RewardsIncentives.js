import React from 'react';

const rewards = [
  {
    title: 'Avalanche Yield Boost',
    description: 'Earn +2% APY on USDC and AVAX supplies for a limited time!',
    icon: '/logos/avalanche-avax-logo.png',
    cta: 'Supply Now'
  },
  {
    title: 'OmniFuse Early Adopter',
    description: 'Get bonus rewards for being among the first 1,000 users.',
    icon: '/logos/zetachain.png',
    cta: 'Join Early'
  },
  {
    title: 'Cross-Chain Borrower Challenge',
    description: 'Borrow on 2+ chains and win exclusive NFT badges.',
    icon: '/logos/base.png',
    cta: 'Start Borrowing'
  }
];

export default function RewardsIncentives() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 font-orbitron gradient-text">Rewards & Incentives</h2>
      <div className="flex gap-6 overflow-x-auto pb-2 snap-x">
        {rewards.map((r, i) => (
          <div key={i} className="min-w-[280px] max-w-xs bg-yellow-100/10 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30 shadow-lg flex flex-col items-center text-center snap-center relative">
            <img src={r.icon} alt={r.title} className="w-12 h-12 mb-3 rounded-full shadow" />
            <div className="font-bold text-lg mb-1">{r.title}</div>
            <div className="text-sm text-[var(--text-muted)] mb-3">{r.description}</div>
            <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-300 transition">{r.cta}</button>
          </div>
        ))}
      </div>
    </section>
  );
} 