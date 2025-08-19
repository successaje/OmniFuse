import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import contractService from '../services/contractService';
import { CROSS_CHAIN_CONFIG } from '../config/contracts';
import { useTransaction } from '../contexts/TransactionContext';

console.log('✅ useOmniFuse.js loaded (top of file)');

export function useOmniFuse() {
  const { address, isConnected } = useAccount();
  // We'll use a local state for the current chainId for wallet client
  const [currentChainId, setCurrentChainId] = useState();
  const { data: walletClient } = useWalletClient(currentChainId ? { chainId: currentChainId } : {});

  // SSR-safe, defensive getSigner
  const getSigner = useCallback(async (chainId) => {
    if (typeof window === 'undefined') {
      throw new Error('getSigner called on server. Only call this on the client.');
    }
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    setCurrentChainId(chainId); // update the chainId for useWalletClient
    if (!walletClient) {
      throw new Error('Wallet client not available. Please reconnect your wallet.');
    }
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    return signer;
  }, [isConnected, walletClient]);
  
  const [userPosition, setUserPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Load user position
  const loadUserPosition = useCallback(async () => {
    if (!address || !isConnected) {
      setUserPosition(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const position = await contractService.getUserPosition(address);
      setUserPosition(position);
    } catch (err) {
      console.error('Failed to load user position:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  const { updateStatus } = useTransaction();
  const isMounted = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Supply assets from EVM to ZetaChain
  const supplyToZeta = useCallback(async (network, assetAddress, amount) => {
    console.log('🚀 supplyToZeta called:', { network, assetAddress, amount });
    
    const handleStatusUpdate = (status) => {
      if (isMounted.current) {
        updateStatus({
          ...status,
          isProcessing: status.isProcessing !== false, // Default to true unless explicitly false
          timestamp: Date.now()
        });
      }
    };

    try {
      handleStatusUpdate({
        isProcessing: true,
        currentStep: 'Connecting to wallet...',
        error: null,
        txHash: null,
        receipt: null
      });
      
      const chainId = CROSS_CHAIN_CONFIG.CHAIN_IDS[network];
      const signer = await getSigner(chainId);
      
      if (!signer || !isConnected) {
        throw new Error('Wallet not connected');
      }

      handleStatusUpdate({
        currentStep: 'Preparing transaction...',
        details: 'Converting amount to correct decimals...'
      });
      
      // Let contractService handle the decimal conversion
      const result = await contractService.supplyToZeta(
        network,
        assetAddress,
        amount, // Pass the raw amount, contractService will handle conversion
        signer,
        handleStatusUpdate
      );

      if (result.success) {
        // Update with success status and redirect after delay
        handleStatusUpdate({
          currentStep: 'Transaction confirmed! Your deposit was successful.',
          isProcessing: false,
          success: true,
          txHash: result.txHash,
          redirectTo: '/dashboard', // Redirect to dashboard after success
          timestamp: Date.now()
        });
        
        // Reload user position after successful supply
        await loadUserPosition();
        
        return result;
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (err) {
      console.error('Supply failed:', err);
      handleStatusUpdate({
        isProcessing: false,
        error: err.message || 'Transaction failed',
        currentStep: 'Transaction failed'
      });
      throw err;
    }
  }, [isConnected, loadUserPosition, getSigner]);

  // Borrow assets from ZetaChain to EVM
  const borrowCrossChain = useCallback(async (assetAddress, amount, destChainId, network) => {
    console.log('🚀 borrowCrossChain called:', { assetAddress, amount, destChainId, network });
    const chainId = CROSS_CHAIN_CONFIG.CHAIN_IDS[network];
    const signer = await getSigner(chainId);
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei (assuming 18 decimals for most tokens)
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      
      const result = await contractService.requestBorrowCrossChain(
        assetAddress,
        amountWei,
        destChainId,
        signer
      );

      if (result.success) {
        setLastTransaction(result);
        // Reload user position after successful borrow
        await loadUserPosition();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Borrow failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, loadUserPosition, getSigner]);

  // Repay assets from EVM to ZetaChain
  const repayToZeta = useCallback(async (network, assetAddress, amount) => {
    console.log('🚀 repayToZeta called:', { network, assetAddress, amount });
    const chainId = CROSS_CHAIN_CONFIG.CHAIN_IDS[network];
    const signer = await getSigner(chainId);
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei (assuming 18 decimals for most tokens)
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      
      const result = await contractService.repayToZeta(
        network,
        assetAddress,
        amountWei,
        signer
      );

      if (result.success) {
        setLastTransaction(result);
        // Reload user position after successful repay
        await loadUserPosition();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Repay failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, loadUserPosition, getSigner]);

  // Withdraw assets from ZetaChain to EVM
  const withdrawCrossChain = useCallback(async (assetAddress, amount, destChainId, network) => {
    console.log('🚀 withdrawCrossChain called:', { assetAddress, amount, destChainId, network });
    const chainId = CROSS_CHAIN_CONFIG.CHAIN_IDS[network];
    const signer = await getSigner(chainId);
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei (assuming 18 decimals for most tokens)
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      
      const result = await contractService.requestWithdrawCrossChain(
        assetAddress,
        amountWei,
        destChainId,
        signer
      );

      if (result.success) {
        setLastTransaction(result);
        // Reload user position after successful withdraw
        await loadUserPosition();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Withdraw failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, loadUserPosition, getSigner]);

  // Get token balance
  const getTokenBalance = useCallback(async (tokenAddress, network) => {
    if (!address || !isConnected) {
      return null;
    }

    try {
      const balance = await contractService.getTokenBalance(tokenAddress, address, network);
      return balance;
    } catch (err) {
      console.error('Failed to get token balance:', err);
      return null;
    }
  }, [address, isConnected]);

  // Get asset price
  const getAssetPrice = useCallback(async (assetAddress) => {
    try {
      const price = await contractService.getAssetPrice(assetAddress);
      return price;
    } catch (err) {
      console.error('Failed to get asset price:', err);
      return null;
    }
  }, []);

  // Check if user can be liquidated
  const checkLiquidationStatus = useCallback(async () => {
    if (!address || !isConnected) {
      return false;
    }

    try {
      const canBeLiquidated = await contractService.canBeLiquidated(address);
      return canBeLiquidated;
    } catch (err) {
      console.error('Failed to check liquidation status:', err);
      return false;
    }
  }, [address, isConnected]);

  // Set vault address in executor (admin function)
  const setVaultAddress = useCallback(async (network, vaultAddress) => {
    console.log('🚀 setVaultAddress called:', { network, vaultAddress });
    const chainId = CROSS_CHAIN_CONFIG.CHAIN_IDS[network];
    const signer = await getSigner(chainId);
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await contractService.setVaultAddress(network, vaultAddress, signer);
      
      if (result.success) {
        setLastTransaction(result);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Set vault address failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getSigner]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear last transaction
  const clearLastTransaction = useCallback(() => {
    setLastTransaction(null);
  }, []);

  // Load user position on mount and when address changes
  useEffect(() => {
    loadUserPosition();
  }, [loadUserPosition]);

  // Auto-refresh user position every 30 seconds
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      loadUserPosition();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, loadUserPosition]);

  // Add canTransact for UI
  const canTransact = isConnected;

  return {
    // State
    userPosition,
    isLoading,
    error,
    lastTransaction,
    
    // Actions
    supplyToZeta,
    borrowCrossChain,
    repayToZeta,
    withdrawCrossChain,
    getTokenBalance,
    getAssetPrice,
    checkLiquidationStatus,
    setVaultAddress,
    loadUserPosition,
    
    // Utilities
    clearError,
    clearLastTransaction,
    
    // Configuration
    chainIds: CROSS_CHAIN_CONFIG.CHAIN_IDS,
    defaultGasLimits: CROSS_CHAIN_CONFIG.DEFAULT_GAS_LIMITS,
    canTransact,
  };
} 