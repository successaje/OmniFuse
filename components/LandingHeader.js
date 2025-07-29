import { useRouter } from 'next/router';
import { useTheme } from './ThemeProvider';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const landingNavLinks = [
  { name: 'Docs', href: '/docs' },
  { name: 'Security', href: '/security' },
  { name: 'Governance', href: '/governance' },
];

const appNavLinks = [
  { name: 'Discover', href: '/discover' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Manage', href: '/manage' },
  { name: 'Earn', href: '/earn' },
  { name: 'Portfolio', href: '/portfolio' },
];

export default function LandingHeader({ brandClass = '' }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isConnected, address } = useAccount();

  // Check if we're on an app page (not landing page)
  const isAppPage = router.pathname !== '/';
  const navLinks = isAppPage ? appNavLinks : landingNavLinks;

  return (
    <header className="fixed top-0 left-0 z-30 w-full bg-[var(--background)]/80 backdrop-blur-md text-[var(--text-main)] shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Left: Logo/Name */}
        <div className={`font-extrabold text-2xl tracking-tight select-none cursor-pointer ${brandClass}`} onClick={() => router.push('/')}>OMNIFUSE</div>
        
        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`font-medium transition-colors ${
                router.pathname === link.href 
                  ? 'text-[#3B82F6]' 
                  : 'hover:text-[#3B82F6]'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>
        
        {/* Right: Theme toggle and Connect/Launch */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="relative w-10 h-6 rounded-full bg-gray-200 dark:bg-[#23272F] transition-colors flex items-center px-1 focus:outline-none border border-gray-300 dark:border-[#23272F] mr-2"
          >
            <span
              className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4 bg-[#3B82F6]' : 'translate-x-0 bg-yellow-400'}`}
            />
            <span className="sr-only">Toggle theme</span>
            <span className="absolute left-0.5 top-0.5 w-5 h-5 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              {theme === 'dark' ? '🌙' : '☀️'}
            </span>
          </button>
          
          {/* Connect Wallet / Launch App Button */}
          {isAppPage ? (
            <ConnectButton />
          ) : (
            <button
              onClick={() => router.push('/discover')}
              className="px-6 py-2 rounded-xl font-semibold text-[var(--text-main)] bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] shadow-glow hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Launch App
            </button>
          )}
          
          {/* Hamburger (mobile) */}
          <button className="md:hidden ml-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-[var(--background)] text-[var(--text-main)] border-t border-gray-200 dark:border-[#23272F]/60 px-6 pb-4 animate-fade-in-down">
          {navLinks.map(link => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`block w-full text-left py-3 font-medium transition-colors ${
                router.pathname === link.href 
                  ? 'text-[#3B82F6]' 
                  : 'hover:text-[#3B82F6]'
              }`}
            >
              {link.name}
            </a>
          ))}
          
          {isAppPage ? (
            <div className="mt-4">
              <ConnectButton />
            </div>
          ) : (
            <button
              onClick={() => router.push('/discover')}
              className="w-full mt-2 px-6 py-2 rounded-xl font-semibold text-[var(--text-main)] bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] shadow-glow hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Launch App
            </button>
          )}
        </nav>
      )}
    </header>
  );
} 