import React from 'react';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ThemeProvider } from '../components/ThemeProvider';
import RainbowKitThemeProvider from '../components/RainbowKitThemeProvider';
import { useEffect, useState } from 'react';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { baseSepolia, sepolia, bscTestnet, avalancheFuji } from 'wagmi/chains';

// Custom ZetaAthens chain configuration
const zetaAthens = {
  id: 7001,
  name: 'ZetaChain Athens Testnet',
  network: 'zetaAthens',
  nativeCurrency: {
    decimals: 18,
    name: 'ZETA',
    symbol: 'ZETA',
  },
  rpcUrls: {
    public: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
    default: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
  },
  blockExplorers: {
    etherscan: { name: 'ZetaScan', url: 'https://athens.explorer.zetachain.com' },
    default: { name: 'ZetaScan', url: 'https://athens.explorer.zetachain.com' },
  },
  iconUrl: '/logos/zetachain.png',
  iconBackground: '#000000',
  testnet: true,
};

// Custom Sepolia configuration with SepoliaETH
const sepoliaCustom = {
  ...sepolia,
  nativeCurrency: {
    ...sepolia.nativeCurrency,
    name: 'SepoliaETH',
  },
};

const config = getDefaultConfig({
  appName: 'OmniFuse Lite',
  projectId: '514f5b55cb296fd534b978dcf5cf24e8', // WalletConnect project ID
  chains: [zetaAthens, bscTestnet, baseSepolia, sepoliaCustom, avalancheFuji],
  ssr: true,
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const [hasError, setHasError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let scrollTimeout;
    
    const handleScroll = () => {
      // Add scrolling class
      document.documentElement.classList.add('scrolling');
      
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Remove scrolling class after 1 second of no scrolling
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove('scrolling');
      }, 1000);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle WalletConnect errors
    const handleWalletConnectError = (error) => {
      console.warn('WalletConnect error:', error);
      setIsConnecting(false);
      // Don't crash the app, just log the error
    };

    // Handle connection issues
    const handleConnectionError = (error) => {
      console.warn('Connection error:', error);
      setIsConnecting(false);
    };

    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('WalletConnect') || 
           event.reason.message.includes('connection'))) {
        event.preventDefault();
        handleWalletConnectError(event.reason);
      }
    });

    // Handle page visibility changes to maintain connection
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, try to reconnect if needed
        setIsConnecting(true);
        setTimeout(() => setIsConnecting(false), 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('unhandledrejection', handleWalletConnectError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Error boundary for WalletConnect issues
  if (hasError) {
    return (
      <ThemeProvider>
        <main className="bg-[var(--background)] font-inter transition-colors duration-500 min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Connection Issue</h1>
            <p className="text-[var(--text-muted)] mb-4">
              There was an issue connecting to the wallet service. Please refresh the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[var(--primary-accent)] text-white rounded-lg hover:bg-[var(--primary-accent)]/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </main>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary onError={() => setHasError(true)}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <RainbowKitThemeProvider>
                <main className="bg-[var(--background)] font-inter transition-colors duration-500">
                  {isConnecting && (
                    <div className="fixed top-4 right-4 z-50 bg-[var(--primary-accent)] text-white px-4 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Reconnecting...</span>
                      </div>
                    </div>
                  )}
                  <Component {...pageProps} />
                </main>
              </RainbowKitThemeProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Simple Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="bg-[var(--background)] font-inter transition-colors duration-500 min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-[var(--text-muted)] mb-4">
              There was an error loading the application. Please refresh the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[var(--primary-accent)] text-white rounded-lg hover:bg-[var(--primary-accent)]/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
} 