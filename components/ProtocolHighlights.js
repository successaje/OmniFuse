import React from 'react';

const highlights = [
  {
    title: 'Cross-chain lending without bridging',
    icon: '/logos/zetachain.png',
    description: 'Supply and borrow assets across chains instantly—no bridges, no hassle.'
  },
  {
    title: 'Backed by ZetaChain Omnichain messaging',
    icon: '/logos/zetachain.png',
    description: 'OmniFuse is powered by ZetaChain, enabling secure, seamless cross-chain DeFi.'
  },
  {
    title: 'Earn with yield across chains like Avalanche, BSC, and more',
    icon: '/logos/avalanche-avax-logo.png',
    description: 'Maximize your returns by accessing the best rates on every supported network.'
  },
  {
    title: 'DeFi without network switching',
    icon: '/logos/base.png',
    description: 'Interact with all your favorite chains from a single, unified interface.'
  }
];

export default function ProtocolHighlights() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col items-center text-center min-w-[220px] max-w-xs mx-auto"
          >
            <img src={h.icon} alt="" className="w-12 h-12 mb-3 rounded-full shadow" />
            <h3 className="font-bold text-lg mb-2 gradient-text">{h.title}</h3>
            <p className="text-sm text-[var(--text-muted)]">{h.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 