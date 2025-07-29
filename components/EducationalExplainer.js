import React from 'react';

export default function EducationalExplainer() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-lg flex flex-col md:flex-row items-center gap-8">
        <img src="/illustrations/crosschain-explainer.png" alt="Cross-chain DeFi" className="w-32 h-32 md:w-48 md:h-48 rounded-xl shadow" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2 font-orbitron gradient-text">What is Cross-Chain DeFi?</h2>
          <p className="text-[var(--text-muted)] mb-4">
            Cross-chain DeFi lets you lend, borrow, and earn across multiple blockchains—without bridges or network switching. OmniFuse uses ZetaChain's omnichain messaging to make this seamless, secure, and fast.
          </p>
          <a href="/docs" className="inline-block bg-[var(--primary-accent)] text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-[var(--primary-accent)]/90 transition">Learn More</a>
        </div>
      </div>
    </section>
  );
} 