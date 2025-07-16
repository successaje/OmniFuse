import LandingHeader from '../components/LandingHeader';
import { useTheme } from '../components/ThemeProvider';
import { useEffect, useState, useRef } from 'react';
import AssetNetworkSelector from '../components/AssetNetworkSelector';
import { useRouter } from 'next/router';

const logos = [
  { src: '/logos/ethereum-eth-logo.png', alt: 'Ethereum', color: '#627EEA' },
  { src: '/logos/polygon-matic-logo.png', alt: 'Polygon', color: '#8247E5' },
  { src: '/logos/bnb-bnb-logo.png', alt: 'BNB', color: '#F3BA2F' },
  { src: '/logos/solana-sol-logo.png', alt: 'Solana', color: '#14F195' },
  { src: '/logos/arbitrum-arb-logo.png', alt: 'Arbitrum', color: '#28A0F0' },
  { src: '/logos/avalanche-avax-logo.png', alt: 'Avalanche', color: '#E84142' },
  { src: '/logos/base.png', alt: 'Base', color: '#0052FF' },
  { src: '/logos/bitcoin-btc-logo.png', alt: 'Bitcoin', color: '#F7931A' },
  { src: '/logos/usd-coin-usdc-logo.png', alt: 'USDC', color: '#2775CA' },
  { src: '/logos/tether-usdt-logo.png', alt: 'USDT', color: '#26A17B' },
];

// Enhanced positioning for network nodes
const networkNodes = [
  { angle: 0, distance: 180, delay: 0 },      // Top
  { angle: Math.PI/4, distance: 160, delay: 0.2 },    // Top-right
  { angle: Math.PI/2, distance: 180, delay: 0.4 },    // Right
  { angle: 3*Math.PI/4, distance: 160, delay: 0.6 },  // Bottom-right
  { angle: Math.PI, distance: 180, delay: 0.8 },      // Bottom
  { angle: 5*Math.PI/4, distance: 160, delay: 1.0 },  // Bottom-left
  { angle: 3*Math.PI/2, distance: 180, delay: 1.2 },  // Left
  { angle: 7*Math.PI/4, distance: 160, delay: 1.4 },  // Top-left
];

function getNodePosition(angle, distance, center) {
  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance
  };
}

const stats = [
  { label: 'Total Market Size', value: '$0', icon: '💰', desc: 'Omnichain liquidity' },
  { label: 'Supported Chains', value: '10+', icon: '🌐', desc: 'Ethereum, BNB, Polygon, Solana, etc.' },
  { label: 'Platform Fees Paid', value: '$0', icon: '🏦', desc: 'To ZETA lockers' },
  { label: 'Security Audited', value: 'Yes', icon: '🛡️', desc: 'By leading firms' },
];

const steps = [
  { icon: '🪙', title: 'Deposit Collateral', desc: 'Supply USDC or other assets on your preferred chain as collateral in the OmniVault.' },
  { icon: '🚀', title: 'Borrow Cross-Chain', desc: 'Borrow USDT or other assets on any supported chain, instantly and seamlessly.' },
  { icon: '🔄', title: 'Repay or Get Liquidated', desc: 'Repay your loan from any chain, or get liquidated if your health factor drops too low.' },
];

const features = [
  {
    icon: '🛡️',
    title: 'Battle-Tested Security',
    desc: 'Audited by leading security firms and protected by robust on-chain risk controls.',
  },
  {
    icon: '🌉',
    title: 'True Cross-Chain',
    desc: 'Deposit and borrow across any supported chain, powered by ZetaChain\'s omnichain protocol.',
  },
  {
    icon: '🎁',
    title: 'Dynamic Rewards',
    desc: 'Earn platform fees and rewards for providing liquidity and participating in governance.',
  },
  {
    icon: '🧑‍💻',
    title: 'Open Source',
    desc: 'Transparent, community-driven, and open for anyone to build on or audit.',
  },
];

export default function LandingPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [assetNetworkSelection, setAssetNetworkSelection] = useState({});
  const router = useRouter();
  useEffect(() => { setMounted(true); }, []);
  // Helper to get theme-aware logo
  function themedLogo(base, ext = 'png') {
    return theme === 'dark'
      ? `/logos/${base}-dark.${ext}`
      : `/logos/${base}-light.${ext}`;
  }
  const center = 210;
  const radius = 170;
  
  // Refs for scroll animations
  const statsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const trustedByRef = useRef(null);
  const ctaRef = useRef(null);
  const footerRef = useRef(null);
  
  // State for visibility
  const [statsVisible, setStatsVisible] = useState(false);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [trustedByVisible, setTrustedByVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const observers = [];
    
    // Create intersection observers for all sections
    const createObserver = (ref, setVisible) => {
      if (!ref.current) return;
      const observer = new window.IntersectionObserver(
        ([entry]) => setVisible(entry.isIntersecting),
        { threshold: 0.1 }
      );
      observer.observe(ref.current);
      observers.push(observer);
    };

    createObserver(statsRef, setStatsVisible);
    createObserver(howItWorksRef, setHowItWorksVisible);
    createObserver(featuresRef, setFeaturesVisible);
    createObserver(trustedByRef, setTrustedByVisible);
    createObserver(ctaRef, setCtaVisible);
    createObserver(footerRef, setFooterVisible);

    return () => observers.forEach(observer => observer.disconnect());
  }, [statsRef, howItWorksRef, featuresRef, trustedByRef, ctaRef, footerRef]);

  return (
    <>
      <LandingHeader brandClass="font-orbitron" />
      <section className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[var(--background)] text-[var(--text-main)] transition-colors duration-500 pt-16">
        {/* Asset & Network Selector removed from landing page */}
        {/* Removed asset/network summary block */}
        {/* Enhanced starfield background */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <svg width="100%" height="100%" className="absolute inset-0 w-full h-full">
            {[...Array(80)].map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 100 + '%'}
                cy={Math.random() * 100 + '%'}
                r={Math.random() * 1.5 + 0.2}
                fill="#fff"
                opacity={Math.random() * 0.6 + 0.1}
                style={{
                  animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </svg>
        </div>
        {/* Responsive two-column hero (content left, animation right) */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto py-8 md:py-20 gap-8 md:gap-16">
          {/* Left: Hero Content */}
          <div className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left px-2 md:px-0">
            <h1 className="hero-headline font-orbitron text-4xl md:text-6xl font-extrabold gradient-text mb-4 drop-shadow-lg">Cross-Chain Lending, Unified</h1>
            <p className="text-lg md:text-2xl text-[var(--text-muted)] max-w-xl mb-8">Deposit on any chain. Borrow anywhere. Powered by ZetaChain's omnichain protocol and supporting your favorite blockchains.</p>
            <button onClick={() => router.push('/discover')} className="btn-primary text-lg px-10 py-4 shadow-glow hover:scale-105 transition-transform">Launch App</button>
            <div className="mt-6 flex items-center justify-center md:justify-start w-full">
              <span className="text-xs text-[var(--text-muted)] mr-2 tracking-wide">Powered by</span>
              {/* Light mode logo */}
              <img src="/zetachain/horizontal/green.png" alt="ZetaChain" className="h-6 block dark:hidden" />
              {/* Dark mode logo */}
              <img src="/zetachain/horizontal/green.png" alt="ZetaChain" className="h-6 hidden dark:block" />
            </div>
          </div>
          {/* Right: Enhanced Cross-Chain Network Animation */}
          <div className="flex-shrink-0 flex items-center justify-center w-[420px] h-[420px] md:w-[480px] md:h-[480px]">
            <div className="relative w-full h-full">
              {/* Central ZetaChain Hub with pulsing rings */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 w-80 h-80 rounded-full border-2 border-[#3B82F6]/30 animate-pulse-slow" 
                     style={{boxShadow:'0 0 80px 20px #3B82F6, 0 0 160px 40px #22D3EE22'}}></div>
                {/* Inner pulsing ring */}
                <div className="absolute inset-0 w-64 h-64 rounded-full border-2 border-[#22D3EE]/40 animate-pulse-slow" 
                     style={{animationDelay: '1s', boxShadow:'0 0 60px 15px #22D3EE, 0 0 120px 30px #3B82F622'}}></div>
                {/* Central ZetaChain node */}
                <div className="absolute inset-0 w-48 h-48 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] p-1 flex items-center justify-center shadow-glow">
                  <div className="w-full h-full rounded-full bg-white/90 dark:bg-[#23272F] flex items-center justify-center">
                    <img src="/logos/zetachain.png" alt="ZetaChain" className="w-16 h-16 object-contain animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Network Nodes and Data Flow */}
              <svg className="absolute left-0 top-0 w-full h-full pointer-events-none" style={{ zIndex: 20 }}>
                <defs>
                  {/* Gradient definitions for data streams */}
                  <linearGradient id="dataStream1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="dataStream2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.3" />
                  </linearGradient>
                  {/* Glow filter */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Data flow paths and nodes */}
                {networkNodes.map((node, i) => {
                  const pos = getNodePosition(node.angle, node.distance, center);
                  const logo = logos[i % logos.length];
                  
                  return (
                    <g key={i}>
                      {/* Data flow path */}
                      <path
                        d={`M${pos.x},${pos.y} Q${center + (pos.x - center) * 0.3},${center + (pos.y - center) * 0.3} ${center},${center}`}
                        stroke="url(#dataStream1)"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.6"
                        style={{
                          animation: `dataFlow ${3 + i * 0.5}s ease-in-out infinite`,
                          animationDelay: `${node.delay}s`,
                          filter: 'url(#glow)'
                        }}
                      />
                      
                      {/* Pulsing data particles */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="2"
                        fill="#22D3EE"
                        opacity="0.8"
                        style={{
                          animation: `particleFlow ${2.5 + i * 0.3}s linear infinite`,
                          animationDelay: `${node.delay}s`
                        }}
                      />
                      
                      {/* Network node (blockchain) */}
                      <g style={{
                        animation: `nodePulse ${4 + i * 0.2}s ease-in-out infinite`,
                        animationDelay: `${node.delay}s`
                      }}>
                        {/* Node glow */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="28"
                          fill={logo.color}
                          opacity="0.2"
                          style={{ filter: 'blur(8px)' }}
                        />
                        {/* Node background */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="24"
                          fill="white"
                          className="dark:fill-[#23272F]"
                          stroke={logo.color}
                          strokeWidth="2"
                          opacity="0.9"
                        />
                        {/* Logo */}
                        <image
                          href={logo.src}
                          width="32"
                          height="32"
                          x={pos.x - 16}
                          y={pos.y - 16}
                          style={{
                            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))'
                          }}
                        />
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* CSS Animations */}
              <style jsx>{`
                @keyframes dataFlow {
                  0%, 100% { opacity: 0.3; stroke-dasharray: 5,5; }
                  50% { opacity: 0.8; stroke-dasharray: 10,5; }
                }
                
                @keyframes particleFlow {
                  0% { 
                    opacity: 0; 
                    transform: translate(0, 0) scale(0.5);
                  }
                  20% { 
                    opacity: 1; 
                    transform: translate(0, 0) scale(1);
                  }
                  80% { 
                    opacity: 1; 
                    transform: translate(${center - 210}px, ${center - 210}px) scale(1);
                  }
                  100% { 
                    opacity: 0; 
                    transform: translate(${center - 210}px, ${center - 210}px) scale(0.5);
                  }
                }
                
                @keyframes nodePulse {
                  0%, 100% { transform: scale(1); opacity: 0.9; }
                  50% { transform: scale(1.05); opacity: 1; }
                }
                
                @keyframes twinkle {
                  0%, 100% { opacity: 0.1; }
                  50% { opacity: 0.6; }
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>
      {/* Stats/Highlights Section */}
      <section
        ref={statsRef}
        className={`w-full bg-[var(--background)] text-[var(--text-main)] py-12 transition-all duration-700 ease-out ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-[var(--card-bg)] shadow-md border border-[#23272F]/10 flex flex-col items-center p-8 text-center card-hover transition-transform">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1 font-orbitron">{stat.value}</div>
              <div className="text-sm text-[var(--text-muted)] mb-1 font-semibold">{stat.label}</div>
              <div className="text-xs text-[var(--text-muted)]">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>
      {/* How It Works Section */}
      <section 
        ref={howItWorksRef}
        className={`w-full bg-[var(--background)] text-[var(--text-main)] py-20 transition-all duration-700 ease-out ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold font-orbitron text-center mb-14 gradient-text">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-3xl bg-[var(--card-bg)] shadow-lg border border-[#23272F]/10 flex flex-col items-center p-12 text-center card-hover transition-transform relative min-h-[320px]">
                <div className="text-6xl mb-6">{step.icon}</div>
                <div className="text-2xl font-bold mb-4 font-orbitron">{step.title}</div>
                <div className="text-base text-[var(--text-muted)] max-w-xs mx-auto">{step.desc}</div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute right-[-40px] top-1/2 -translate-y-1/2 text-4xl text-[var(--primary-accent)]">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features/Benefits Section */}
      <section 
        ref={featuresRef}
        className={`w-full bg-[var(--background)] text-[var(--text-main)] py-16 transition-all duration-700 ease-out ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold font-orbitron text-center mb-10 gradient-text">Why OmniFuse?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-[var(--card-bg)] shadow-md border border-[#23272F]/10 flex flex-col items-center p-8 text-center card-hover transition-transform">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <div className="text-lg font-bold mb-2 font-orbitron">{feature.title}</div>
                <div className="text-sm text-[var(--text-muted)]">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Trusted By / Backers Section */}
      <section 
        ref={trustedByRef}
        className={`w-full bg-[var(--background)] text-[var(--text-main)] py-12 transition-all duration-700 ease-out ${trustedByVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
          <h3 className="text-2xl md:text-3xl font-orbitron font-bold mb-6 text-center gradient-text">Trusted By</h3>
          <div className="flex flex-wrap justify-between items-center gap-8 md:gap-12 mb-6 w-full max-w-5xl mx-auto px-2">
            {/* Theme-aware partner/backer logos */}
            {mounted && (
              <img src={themedLogo('ethereum-eth-logo')} onError={e => {e.target.onerror=null;e.target.src='/logos/ethereum-eth-logo.png';}} alt="Ethereum" className="h-10 grayscale hover:grayscale-0 transition duration-300" />
            )}
            {mounted && (
              <img src={themedLogo('polygon-matic-logo')} onError={e => {e.target.onerror=null;e.target.src='/logos/polygon-matic-logo.png';}} alt="Polygon" className="h-10 grayscale hover:grayscale-0 transition duration-300" />
            )}
            {mounted && (
              <img src={themedLogo('zetachain')} onError={e => {e.target.onerror=null;e.target.src='/logos/zetachain.png';}} alt="ZetaChain" className="h-10 grayscale hover:grayscale-0 transition duration-300" />
            )}
            {mounted && (
              <img src={themedLogo('solana-sol-logo')} onError={e => {e.target.onerror=null;e.target.src='/logos/solana-sol-logo.png';}} alt="Solana" className="h-10 grayscale hover:grayscale-0 transition duration-300" />
            )}
            {mounted && (
              <img src={themedLogo('arbitrum-arb-logo')} onError={e => {e.target.onerror=null;e.target.src='/logos/arbitrum-arb-logo.png';}} alt="Arbitrum" className="h-10 grayscale hover:grayscale-0 transition duration-300" />
            )}
            {mounted && (
              <img src={themedLogo('avalanche-avax-logo')} onError={e => {e.target.onerror=null;e.target.src='/logos/avalanche-avax-logo.png';}} alt="Avalanche" className="h-10 grayscale hover:grayscale-0 transition duration-300" />
            )}
          </div>
        </div>
      </section>
      {/* Call to Action Section */}
      <section 
        ref={ctaRef}
        className={`w-full bg-[var(--background)] text-[var(--text-main)] py-16 flex items-center justify-center transition-all duration-700 ease-out ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-2xl w-full mx-auto flex flex-col items-center rounded-3xl bg-[var(--card-bg)] shadow-2xl border border-[#23272F]/10 px-8 py-12 text-center backdrop-blur-md">
          <h2 className="text-3xl md:text-4xl font-orbitron font-extrabold mb-4 gradient-text">Ready to Experience Omnichain Lending?</h2>
          <p className="text-lg text-[var(--text-muted)] mb-8">Join the future of DeFi. Deposit, borrow, and earn across any chain—instantly and securely.</p>
          <button onClick={() => router.push('/discover')} className="btn-primary text-lg px-10 py-4 shadow-glow hover:scale-105 transition-transform mb-4">Launch App</button>
          <div className="flex items-center justify-center mt-2">
            <span className="text-xs text-[var(--text-muted)] mr-2 tracking-wide">Powered by</span>
            {mounted && (
              <img src={themedLogo('zetachain-horizontal','png')} onError={e => {e.target.onerror=null;e.target.src='/zetachain/horizontal/green.png';}} alt="ZetaChain" className="h-6" />
            )}
          </div>
        </div>
      </section>
      {/* Fading divider */}
      <div className="w-full flex justify-center items-center mt-8">
        <hr
          className="w-full max-w-3xl border-0"
          style={{
            height: '0.9px',
            background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, var(--divider-fade) 40%, var(--divider-fade) 60%, rgba(0,0,0,0) 100%)',
            opacity: 0.3,
          }}
        />
      </div>
      {/* Footer Section */}
      <footer 
        ref={footerRef}
        className={`w-full bg-[var(--background)] text-[var(--text-muted)] py-10 px-4 transition-all duration-700 ease-out ${footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {mounted && (
            <img src={themedLogo('zetachain','png')} onError={e => {e.target.onerror=null;e.target.src='/logos/zetachain.png';}} alt="OmniFuse" className="h-8 w-8 rounded-full bg-white/80 dark:bg-[#23272F] p-1" />
          )}
          <span className="font-orbitron text-lg font-bold tracking-widest text-[var(--text-main)]">OMNIFUSE</span>
          <nav className="flex flex-wrap gap-6 text-sm font-medium">
            <a href="#" className="hover:text-[var(--primary-accent)] transition">Docs</a>
            <a href="#" className="hover:text-[var(--primary-accent)] transition">GitHub</a>
            <a href="#" className="hover:text-[var(--primary-accent)] transition">Security</a>
            <a href="#" className="hover:text-[var(--primary-accent)] transition">Contact</a>
          </nav>
          <div className="text-xs text-[var(--text-muted)] text-center md:text-right">
            &copy; {new Date().getFullYear()} OmniFuse. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
 