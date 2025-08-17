import React from 'react';

const testimonials = [
  {
    name: 'Tobi',
    avatar: '/avatars/tobi.png',
    quote: 'OmniFuse made cross-chain lending so easy. No bridges, no headaches!'
  },
  {
    name: 'Sade',
    avatar: '/avatars/sade.png',
    quote: 'I love earning yield on Avalanche and BSC without switching networks.'
  },
  {
    name: 'DeFi Dave',
    avatar: '/avatars/dave.png',
    quote: 'The ZetaChain integration gives me confidence in security and speed.'
  }
];

const partners = [
  { name: 'ZetaChain', logo: '/logos/zetachain.png' },
  { name: 'Base', logo: '/logos/base.png' },
  { name: 'Aave', logo: '/logos/aave.png' }
];

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 font-orbitron gradient-text">What Users & Partners Say</h2>
      <div className="flex gap-6 overflow-x-auto pb-2 snap-x mb-6">
        {testimonials.map((t, i) => (
          <div key={i} className="min-w-[260px] max-w-xs bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col items-center text-center snap-center">
            <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full mb-3 shadow" />
            <div className="font-bold mb-1">{t.name}</div>
            <div className="text-sm text-[var(--text-muted)] italic">"{t.quote}"</div>
          </div>
        ))}
      </div>
      <div className="flex gap-8 justify-center items-center mt-4">
        {partners.map((p, i) => (
          <img key={i} src={p.logo} alt={p.name} className="h-10 w-auto grayscale hover:grayscale-0 transition" title={p.name} />
        ))}
      </div>
    </section>
  );
} 