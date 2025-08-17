import React from 'react';

const posts = [
  {
    title: 'OmniFuse Launches on ZetaChain',
    summary: 'We are live! Supply and borrow assets cross-chain with no bridges required.',
    date: '2025-07-10',
    link: '/blog/launch',
    image: '/blog/launch.png'
  },
  {
    title: 'How Cross-Chain Lending Works',
    summary: 'A deep dive into the tech behind seamless cross-chain DeFi.',
    date: '2025-08-05',
    link: '/blog/cross-chain-lending',
    image: '/blog/crosschain.png'
  },
  {
    title: 'OmniFuse Integrates Pyth Oracles',
    summary: 'Bringing secure price feeds to all supported chains.',
    date: '2025-07-28',
    link: '/blog/Pyth',
    image: '/blog/Pyth.png'
  }
];

export default function FeaturedBlogNews() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 font-orbitron gradient-text">Featured Blog & News</h2>
      <div className="flex gap-6 overflow-x-auto pb-2 snap-x">
        {posts.map((post, i) => (
          <div key={i} className="min-w-[320px] max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col snap-center">
            <img src={post.image} alt={post.title} className="w-full h-32 object-cover rounded-xl mb-3" />
            <div className="text-xs text-[var(--text-muted)] mb-1">{post.date}</div>
            <div className="font-bold text-lg mb-2">{post.title}</div>
            <div className="text-sm text-[var(--text-muted)] mb-3">{post.summary}</div>
            <a href={post.link} className="mt-auto inline-block bg-[var(--primary-accent)] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-[var(--primary-accent)]/90 transition">Read More</a>
          </div>
        ))}
      </div>
    </section>
  );
} 