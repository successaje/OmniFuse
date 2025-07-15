import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import contractService from '../services/contractService';
import { CROSS_CHAIN_CONFIG } from '../config/contracts';

export function useOmniFuse() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Helper to get ethers.js Signer from walletClient (for legacy contractService)
  const getSigner = () => {
    if (!walletClient) return null;
    // If contractService is updated to support viem, pass walletClient directly instead
    // For now, try to get a signer from the walletClient
    // NOTE: This only works if walletClient has an ethers.js provider (e.g. MetaMask)
    if (walletClient?.ethereum) {
      const provider = new ethers.BrowserProvider(walletClient.ethereum);
      return provider.getSigner();
    }
    return null;
  };
  
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

  // Supply assets from EVM to ZetaChain
  const supplyToZeta = useCallback(async (network, assetAddress, amount) => {
    const signer = await getSigner();
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert amount to wei (assuming 18 decimals for most tokens)
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      
      const result = await contractService.supplyToZeta(
        network,
        assetAddress,
        amountWei,
        signer
      );

      if (result.success) {
        setLastTransaction(result);
        // Reload user position after successful supply
        await loadUserPosition();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Supply failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, loadUserPosition]);

  // Borrow assets from ZetaChain to EVM
  const borrowCrossChain = useCallback(async (assetAddress, amount, destChainId) => {
    const signer = await getSigner();
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
  }, [isConnected, loadUserPosition]);

  // Repay assets from EVM to ZetaChain
  const repayToZeta = useCallback(async (network, assetAddress, amount) => {
    const signer = await getSigner();
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
  }, [isConnected, loadUserPosition]);

  // Withdraw assets from ZetaChain to EVM
  const withdrawCrossChain = useCallback(async (assetAddress, amount, destChainId) => {
    const signer = await getSigner();
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
  }, [isConnected, loadUserPosition]);

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
    const signer = await getSigner();
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
  }, [isConnected]);

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
  };
} 