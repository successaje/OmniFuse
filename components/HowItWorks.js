import React, { useState } from 'react';

const steps = [
  { icon: '/logos/wallet.png', title: 'Connect Wallet', desc: 'Link your EVM wallet to get started.' },
  { icon: '/logos/usd-coin-usdc-logo.png', title: 'Choose Asset', desc: 'Pick your preferred asset and network.' },
  { icon: '/logos/zetachain.png', title: 'Supply or Borrow', desc: 'Supply to earn or borrow instantly cross-chain.' },
  { icon: '/logos/avalanche-avax-logo.png', title: 'Track Earnings', desc: 'Monitor your positions and yield in real time.' },
];

export default function HowItWorks() {
  const [open, setOpen] = useState(false);
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <button
        className="bg-[var(--primary-accent)] text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-[var(--primary-accent)]/90 transition mb-4"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide How It Works' : 'How It Works'}
      </button>
      {open && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-lg flex flex-col md:flex-row gap-8 items-center justify-center">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center flex-1 min-w-[150px]">
              <img src={step.icon} alt="" className="w-14 h-14 mb-3 rounded-full shadow" />
              <div className="font-bold text-lg mb-1">{step.title}</div>
              <div className="text-sm text-[var(--text-muted)]">{step.desc}</div>
              {i < steps.length - 1 && (
                <div className="hidden md:block w-12 h-1 bg-gradient-to-r from-[var(--primary-accent)] to-transparent my-4" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
} 