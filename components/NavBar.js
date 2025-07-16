import { useState } from 'react';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function NavBar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-30 backdrop-blur-lg bg-[#181C23]/80 shadow-lg border-b border-[#23272F]/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}> 
          <span className="text-2xl font-bold gradient-text mr-2">⚡</span>
          <span className="text-xl font-bold text-[var(--text-main)] tracking-tight">OmniFuse</span>
        </div>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-2">
          <button onClick={() => router.push('/dashboard')} className={`nav-link ${router.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</button>
          <button onClick={() => router.push('/admin')} className={`nav-link ${router.pathname === '/admin' ? 'active' : ''}`}>Admin</button>
          <a href="https://docs.omnifuse.com" target="_blank" rel="noopener noreferrer" className="nav-link">Docs</a>
          <a href="https://faucet.zetachain.com" target="_blank" rel="noopener noreferrer" className="nav-link">Faucet</a>
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-[var(--text-main)] focus:outline-none">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#F3F4F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#181C23]/95 border-t border-[#23272F]/60 px-6 pb-4 animate-fade-in-down">
          <button onClick={() => {router.push('/dashboard'); setMenuOpen(false);}} className={`block w-full text-left nav-link ${router.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</button>
          <button onClick={() => {router.push('/admin'); setMenuOpen(false);}} className={`block w-full text-left nav-link ${router.pathname === '/admin' ? 'active' : ''}`}>Admin</button>
          <a href="https://docs.omnifuse.com" target="_blank" rel="noopener noreferrer" className="block w-full text-left nav-link">Docs</a>
          <a href="https://faucet.zetachain.com" target="_blank" rel="noopener noreferrer" className="block w-full text-left nav-link">Faucet</a>
          <div className="mt-2"><ConnectButton showBalance={false} chainStatus="icon" /></div>
        </div>
      )}
    </nav>
  );
} 