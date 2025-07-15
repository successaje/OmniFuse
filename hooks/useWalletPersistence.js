import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWalletPersistence() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Store connection state in localStorage
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);
    } else {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  }, [isConnected, address]);

  // Attempt to reconnect on page load
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected') === 'true';
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (wasConnected && savedAddress && !isConnected) {
      setIsReconnecting(true);
      
      // Try to reconnect with a delay
      setTimeout(() => {
        const connector = connectors.find(c => c.ready);
        if (connector) {
          connect({ connector });
        }
        setIsReconnecting(false);
      }, 1000);
    }
  }, [isConnected, address, connect, connectors]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isConnected) {
        // Page became visible, ensure connection is still active
        const wasConnected = localStorage.getItem('walletConnected') === 'true';
        if (wasConnected && !isConnected) {
          setIsReconnecting(true);
          setTimeout(() => setIsReconnecting(false), 2000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected]);

  return {
    isConnected,
    address,
    isReconnecting,
    connect,
    disconnect
  };
} 