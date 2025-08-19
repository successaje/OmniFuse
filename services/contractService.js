import { ethers, parseUnits } from 'ethers';
import { 
  CONTRACT_ADDRESSES, 
  NETWORKS, 
  CROSS_CHAIN_CONFIG,
  getContractAddress,
  getNetworkConfig 
} from '../config/contracts';

// Contract ABIs (simplified for frontend)
const OMNIVAULT_ABI = [
  // Core lending functions
  'function requestBorrowCrossChain(address asset, uint256 amount, uint16 destChainId, tuple(uint256 gasLimit, bool isArbitraryCall) callOptions, tuple(bool onRevert, address revertAddress) revertOptions) external',
  'function requestWithdrawCrossChain(address asset, uint256 amount, uint16 destChainId, tuple(uint256 gasLimit, bool isArbitraryCall) callOptions, tuple(bool onRevert, address revertAddress) revertOptions) external',
  'function liquidateCrossChainPosition(address user, address debtAsset, address collateralAsset, uint16 targetChainId, tuple(uint256 gasLimit, bool isArbitraryCall) callOptions, tuple(bool onRevert, address revertAddress) revertOptions) external',
  
  // View functions
  'function getCrossChainPosition(address user) external view returns (uint256 collateralUsd, uint256 debtUsd, uint256 hf)',
  'function estimateHealthFactor(address user) public view returns (uint256)',
  'function canBeLiquidated(address user) public view returns (bool)',
  'function getAssetPriceUSD(address asset) public view returns (uint256)',
  'function totalSuppliedPerAsset(address asset) public view returns (uint256)',
  'function totalBorrowedPerAsset(address asset) public view returns (uint256)',
  
  // Admin functions
  'function registerSupportedAsset(address token, bool isCollateral) external',
  'function setPythId(address asset, bytes32 priceId) external',
  'function setAuthorizedLendingPool(address pool, bool isAuth) external',
  
  // Events
  'event Supply(address indexed user, address indexed asset, uint256 amount, uint16 originChainId)',
  'event Borrow(address indexed user, address indexed asset, uint256 amount, uint16 destChainId)',
  'event Repay(address indexed user, address indexed asset, uint256 amount, uint16 originChainId)',
  'event Withdraw(address indexed user, address indexed asset, uint256 amount, uint16 destChainId)',
  'event Liquidate(address indexed user, address indexed debtAsset, address indexed collateralAsset, uint16 targetChainId)',
];

const OMNIVEXECUTOR_ABI = [
  // Outbound functions
  'function supplyToZeta(address asset, uint256 amount, tuple(address revertAddress, bool callOnRevert, address abortAddress, bytes revertMessage, uint256 onRevertGasLimit) revertOptions) external payable',
  'function repayToZeta(address asset, uint256 amount, tuple(address revertAddress, bool callOnRevert, address abortAddress, bytes revertMessage, uint256 onRevertGasLimit) revertOptions) external payable',
  'function closePositionOnZeta(address user, tuple(address revertAddress, bool callOnRevert, address abortAddress, bytes revertMessage, uint256 onRevertGasLimit) revertOptions) external',
  
  // Config functions
  'function setVaultAddress(address vault) external',
  'function vault() external view returns (address)',
  
  // Events
  'event SuppliedToZeta(address indexed user, address indexed asset, uint256 amount)',
  'event RepaidToZeta(address indexed user, address indexed asset, uint256 amount)',
  'event BorrowReceived(address indexed user, address indexed asset, uint256 amount)',
  'event WithdrawReceived(address indexed user, address indexed asset, uint256 amount)',
];

const ERC20_ABI = [
  'function balanceOf(address owner) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
];

class ContractService {
  constructor() {
    this.providers = {};
    this.contracts = {};
    this.initializeProviders();
  }

  // Initialize providers for different networks
  initializeProviders() {
    Object.keys(NETWORKS).forEach(network => {
      const config = NETWORKS[network];
      this.providers[network] = new ethers.JsonRpcProvider(config.rpcUrl);
    });
  }

  // Get provider for a specific network
  getProvider(network) {
    if (!this.providers[network]) {
      throw new Error(`Provider not initialized for network: ${network}`);
    }
    return this.providers[network];
  }

  // Get contract instance
  getContract(network, contractType, signer = null) {
    const key = `${network}_${contractType}`;
    
    if (!this.contracts[key]) {
      const address = getContractAddress(network, contractType);
      const provider = this.getProvider(network);
      const abi = contractType === 'OMNIVAULT' ? OMNIVAULT_ABI : OMNIVEXECUTOR_ABI;
      
      this.contracts[key] = new ethers.Contract(
        address,
        abi,
        signer || provider
      );
    }
    
    return this.contracts[key];
  }

  // Get ERC20 contract instance
  getERC20Contract(tokenAddress, network, signer = null) {
    const provider = this.getProvider(network);
    return new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      signer || provider
    );
  }

  // Cross-chain supply from EVM to ZetaChain
  async supplyToZeta(network, assetAddress, amount, signer, onStatusUpdate = () => {}) {
    const log = (message, data = {}) => {
      console.log(`[${new Date().toISOString()}] ${message}`, data);
      onStatusUpdate({ 
        ...data,
        currentStep: message,
        isProcessing: true,
        timestamp: Date.now()
      });
    };

    try {
      log('Initializing cross-chain supply...', { 
        network, 
        assetAddress, 
        amount: amount.toString() 
      });
      
      log('Getting executor contract...');
      const executor = this.getContract(network, 'OMNIVEXECUTOR', signer);
      const executorAddress = getContractAddress(network, 'OMNIVEXECUTOR');
      const userAddress = await signer.getAddress();
      
      // Get token contract and handle USDC decimals
      log('Preparing token contract...', { assetAddress });
      const tokenContract = this.getERC20Contract(assetAddress, network, signer);
      
      // Handle USDC 6 decimals - convert input amount to 6 decimal places for USDC
      const usdcAddress = '0x5425890298aed601595a70AB815c96711a31Bc65'.toLowerCase();
      const isUSDC = assetAddress.toLowerCase() === usdcAddress;
      const decimals = isUSDC ? 6 : 18;


      // Convert amount based on token type
      let amountInWei;
      if (isUSDC) {
        // For USDC, handle 6 decimal places
        // If amount is already a bigint or BigInt, convert it to string with 18 decimals first
        const amountStr = (typeof amount === 'bigint' || amount instanceof BigInt || 
                         (typeof amount === 'object' && 'toBigInt' in amount))
          ? ethers.formatUnits(amount, 18) // Convert from wei (18) to ether
          : amount.toString();
        
        // Now parse with 6 decimals for USDC
        amountInWei = parseUnits(amountStr, 6);
      } else {
        // For other tokens, handle different number types and convert to wei (18 decimals)
        const amountStr = (typeof amount === 'bigint' || amount instanceof BigInt || 
                         (typeof amount === 'object' && 'toBigInt' in amount))
          ? amount.toString()
          : amount.toString();
        amountInWei = parseUnits(amountStr, 18);
      }
      
      log('Amount conversion:', {
        inputAmount: amount,
        isUSDC,
        decimals,
        amountInWei: amountInWei.toString()
      });
      
      // Prepare revert options - use user's address as revert address
      const revertOptions = {
        revertAddress: userAddress, // Changed from executorAddress to userAddress
        callOnRevert: false,
        abortAddress: '0x0000000000000000000000000000000000000000',
        revertMessage: '0x3078',
        onRevertGasLimit: 500000
      };
      
      log('Revert options configured', { 
        ...revertOptions,
        amountInWei: amountInWei.toString()
      });
      
      // Handle token approval with detailed status updates
      log('Checking token allowance...', { 
        userAddress, 
        executorAddress,
        amount: amountInWei.toString(),
        decimals
      });
      
      try {
        // Step 1: Check current allowance
        onStatusUpdate({ 
          currentStep: 'Checking token allowance...',
          isProcessing: true,
          details: 'Verifying if approval is needed'
        });
        
        const allowance = await tokenContract.allowance(userAddress, executorAddress);
        log('Current token allowance:', { 
          allowance: allowance.toString(),
          amountInWei: amountInWei.toString()
        });
        
        // If allowance is less than amount, request approval
        if (allowance < amountInWei) {
          log('Insufficient allowance. Requesting approval...');
          onStatusUpdate({ 
            currentStep: 'Approval needed',
            details: 'Please approve the token transfer in your wallet',
            isProcessing: true
          });
          
          // Request approval
          const approveTx = await tokenContract.approve(executorAddress, amountInWei);
          
          onStatusUpdate({ 
            currentStep: 'Waiting for approval...',
            details: 'Confirm the transaction in your wallet',
            txHash: approveTx.hash,
            isProcessing: true
          });
          
          // Wait for approval confirmation
          await approveTx.wait();
          log('Token approval confirmed');
          onStatusUpdate({ 
            currentStep: 'Approval confirmed!',
            details: 'Token transfer approved successfully',
            isProcessing: true,
            status: 'success'
          });
          
          // Verify the new allowance
          const newAllowance = await tokenContract.allowance(userAddress, executorAddress);
          log('New token allowance set:', { 
            newAllowance: newAllowance.toString(),
            hasSufficientAllowance: newAllowance >= amount
          });
          
          if (newAllowance < amount) {
            throw new Error(`Failed to set sufficient allowance. Current: ${newAllowance}, Required: ${amount}`);
          }
        } else {
          log('Sufficient allowance already set, skipping approval');
        }
      } catch (approveError) {
        console.warn('Approval check failed, continuing with transaction...', approveError);
      }

      log('Preparing supply transaction...');
      
      // Prepare the transaction data
      const iface = new ethers.Interface(OMNIVEXECUTOR_ABI);
      const txData = iface.encodeFunctionData('supplyToZeta', [
        assetAddress,
        amountInWei,  // Use the converted amount here
        revertOptions
      ]);
      
      log('Transaction data encoded', {
        function: 'supplyToZeta',
        assetAddress,
        amountInWei: amountInWei.toString(),
        dataPreview: `${txData.substring(0, 20)}...`
      });
      
      // Prepare transaction parameters
      const txParams = {
        to: executorAddress,
        data: txData,
        value: 0,
      };
      
      log('Transaction parameters prepared', {
        to: txParams.to,
        value: txParams.value,
        dataLength: txParams.data.length
      });

      log('Estimating gas...');
      let gasEstimate;
      try {
        // First try to estimate gas with a reasonable timeout
        gasEstimate = await signer.estimateGas({
          ...txParams,
          from: await signer.getAddress()
        });
        
        // Add 30% buffer to the gas estimate
        const buffer = (gasEstimate * 30n) / 100n;
        gasEstimate += buffer;
        
        log('Gas estimation successful', {
          estimatedGas: gasEstimate.toString(),
          buffer: buffer.toString()
        });
      } catch (estimationError) {
        console.error('Gas estimation failed:', estimationError);
        log('Using fallback gas limit', { 
          error: estimationError.message,
          isWarning: true 
        });
        // Use a higher gas limit as fallback
        gasEstimate = 1000000n;
      }

      // Prepare final transaction with gas limit
      const finalTxParams = {
        ...txParams,
        from: await signer.getAddress(),
        gasLimit: gasEstimate
      };
      
      log('Sending transaction...', {
        ...finalTxParams,
        gasLimit: finalTxParams.gasLimit.toString(),
        value: finalTxParams.value.toString()
      });

      try {
        // Update status before sending
        onStatusUpdate({
          currentStep: 'Confirm Transaction',
          details: 'Please confirm the transaction in your wallet',
          isProcessing: true
        });
        
        // Send the transaction
        const tx = await signer.sendTransaction(finalTxParams);
        
        // Update status after sending
        const explorerUrl = this.getExplorerUrl(network, tx.hash);
        onStatusUpdate({
          currentStep: 'Transaction Submitted',
          details: 'Waiting for confirmation...',
          txHash: tx.hash,
          explorerUrl,
          isProcessing: true
        });
        
        log('Transaction sent, waiting for confirmation...', {
          txHash: tx.hash,
          explorerUrl,
          gasLimit: finalTxParams.gasLimit.toString()
        });
        
        // Wait for transaction receipt with retries
        const receipt = await this.waitForTransactionReceipt(
          signer.provider,
          tx.hash,
          log
        );
        
        if (receipt.status === 1) {
          // Transaction successful
          onStatusUpdate({
            currentStep: 'Transaction Confirmed!',
            details: 'Your deposit was successful',
            txHash: tx.hash,
            explorerUrl,
            isProcessing: false,
            success: true,
            redirectTo: '/manage'
          });
          
          return { success: true, txHash: tx.hash, receipt };
        } else {
          throw new Error('Transaction reverted');
        }
      } catch (error) {
        console.error('Transaction error:', error);
        
        let errorMessage = error.message || 'Transaction failed';
        
        // Try to decode revert reason if available
        if (error.data) {
          try {
            const revertReason = this.decodeRevertReason(error.data);
            errorMessage = revertReason || errorMessage;
            log('Transaction reverted with reason:', { revertReason });
          } catch (e) {
            console.warn('Could not decode revert reason:', e);
          }
        }
        
        // Update status with error and return error details
        onStatusUpdate({
          currentStep: 'Transaction Failed',
          details: errorMessage,
          error: errorMessage,
          isProcessing: false,
          success: false
        });
        
        return { 
          success: false, 
          error: errorMessage,
          txHash: error.transactionHash || error.txHash
        };
      }
    } catch (error) {
      // Handle different error formats
      const errorObj = error.error?.error || error;
      const errorMessage = errorObj.reason || errorObj.message || 'Transaction failed';
      const txHash = errorObj.transactionHash || errorObj.txHash || error.transactionHash || error.txHash;
      
      console.error('Supply to ZetaChain failed:', error);
      
      // Log the error with all available details
      const errorDetails = {
        error: errorMessage,
        isError: true,
        isProcessing: false,
        success: false,
        txHash,
        code: error.code,
        reason: error.reason,
        data: error.data
      };
      
      log('Transaction failed', errorDetails);
      
      // Try to decode revert reason if available
      if (error.data || errorObj.data) {
        try {
          const revertData = error.data || errorObj.data;
          const revertReason = this.decodeRevertReason(revertData);
          log('Transaction reverted', { 
            revertReason,
            data: revertData
          });
          
          // Update the error message with the decoded reason if available
          if (revertReason !== 'Transaction reverted') {
            errorDetails.error = revertReason;
          }
        } catch (e) {
          console.warn('Could not decode revert reason:', e);
        }
      }
      
      return { 
        success: false, 
        error: errorDetails.error,
        txHash,
        details: errorDetails
      };
    }
  }

  /**
   * Wait for a transaction receipt with retry logic
   * @param {ethers.Provider} provider - The ethers provider
   * @param {string} txHash - The transaction hash
   * @param {Function} log - Logging function
   * @param {number} [maxRetries=3] - Maximum number of retry attempts
   * @param {number} [delay=2000] - Delay between retries in ms
   * @returns {Promise<ethers.TransactionReceipt>}
   */
  async waitForTransactionReceipt(provider, txHash, log, maxRetries = 3, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt) {
          log(`Transaction receipt received (attempt ${i + 1}/${maxRetries})`, {
            status: receipt.status,
            blockNumber: receipt.blockNumber
          });
          return receipt;
        }
      } catch (error) {
        log(`Error fetching receipt (attempt ${i + 1}/${maxRetries}):`, {
          error: error.message,
          isWarning: true
        });
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Failed to get transaction receipt after multiple attempts');
  }
  
  /**
   * Get blockchain explorer URL for a transaction
   * @param {string} network - Network name
   * @param {string} txHash - Transaction hash
   * @returns {string} Explorer URL
   */
  getExplorerUrl(network, txHash) {
    const explorers = {
      'avalanche-fuji': `https://testnet.snowtrace.io/tx/${txHash}`,
      'ethereum-sepolia': `https://sepolia.etherscan.io/tx/${txHash}`,
      'bsc-testnet': `https://testnet.bscscan.com/tx/${txHash}`,
      'base-sepolia': `https://sepolia.basescan.org/tx/${txHash}`
    };
    return explorers[network] || '#';
  }
  
  /**
   * Decode revert reason from transaction error data
   * @param {string} data - Error data from transaction
   * @returns {string} Decoded revert reason
   */
  decodeRevertReason(data) {
    if (!data) return 'Unknown error';
    
    try {
      // Handle different revert reason formats
      if (data.startsWith('0x08c379a0')) {
        // Standard revert(string) error
        return ethers.AbiCoder.defaultAbiCoder().decode(
          ['string'],
          '0x' + data.substring(10)
        )[0];
      }
      return 'Transaction reverted';
    } catch (e) {
      console.warn('Failed to decode revert reason:', e);
      return 'Transaction reverted (unable to decode reason)';
    }
  }

  // Cross-chain borrow from ZetaChain to EVM
  async requestBorrowCrossChain(assetAddress, amount, destChainId, signer) {
    try {
      const vault = this.getContract('ZETA_TESTNET', 'OMNIVAULT', signer);
      
      // Prepare call and revert options
      const callOptions = {
        gasLimit: CROSS_CHAIN_CONFIG.DEFAULT_GAS_LIMITS.BORROW,
        isArbitraryCall: true
      };
      
      const revertOptions = {
        onRevert: true,
        revertAddress: getContractAddress('ZETA_TESTNET', 'OMNIVAULT')
      };

      const tx = await vault.requestBorrowCrossChain(
        assetAddress,
        amount,
        destChainId,
        callOptions,
        revertOptions
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        network: 'ZETA_TESTNET',
        action: 'borrow',
        amount,
        asset: assetAddress,
        destChainId
      };
    } catch (error) {
      console.error('Borrow cross-chain failed:', error);
      return {
        success: false,
        error: error.message,
        network: 'ZETA_TESTNET',
        action: 'borrow'
      };
    }
  }

  // Cross-chain repay from EVM to ZetaChain
  async repayToZeta(network, assetAddress, amount, signer) {
    try {
      const executor = this.getContract(network, 'OMNIVEXECUTOR', signer);
      // Prepare revert options (match contract ABI order)
      const revertOptions = {
        revertAddress: getContractAddress(network, 'OMNIVEXECUTOR'),
        callOnRevert: true,
        abortAddress: '0x0000000000000000000000000000000000000000',
        revertMessage: '0x',
        onRevertGasLimit: 500000
      };
      // Approve tokens first
      const tokenContract = this.getERC20Contract(assetAddress, network, signer);
      const executorAddress = getContractAddress(network, 'OMNIVEXECUTOR');
      const allowance = await tokenContract.allowance(await signer.getAddress(), executorAddress);
      if (allowance < amount) {
        try {
          // Prompt user for approval
          const approveTx = await tokenContract.approve(executorAddress, ethers.MaxUint256);
          await approveTx.wait();
        } catch (approveError) {
          // User rejected or approval failed
          return {
            success: false,
            error: 'User rejected USDC approval or approval transaction failed. You must approve before repaying.',
            network,
            action: 'repay',
            approvalRejected: true
          };
        }
      }
      // Execute repay
      const tx = await executor.repayToZeta(assetAddress, amount, revertOptions);
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        network,
        action: 'repay',
        amount,
        asset: assetAddress
      };
    } catch (error) {
      console.error('Repay to ZetaChain failed:', error);
      return {
        success: false,
        error: error.message,
        network,
        action: 'repay'
      };
    }
  }

  // Cross-chain withdraw from ZetaChain to EVM
  async requestWithdrawCrossChain(assetAddress, amount, destChainId, signer) {
    try {
      const vault = this.getContract('ZETA_TESTNET', 'OMNIVAULT', signer);
      
      // Prepare call and revert options
      const callOptions = {
        gasLimit: CROSS_CHAIN_CONFIG.DEFAULT_GAS_LIMITS.WITHDRAW,
        isArbitraryCall: true
      };
      
      const revertOptions = {
        onRevert: true,
        revertAddress: getContractAddress('ZETA_TESTNET', 'OMNIVAULT')
      };

      const tx = await vault.requestWithdrawCrossChain(
        assetAddress,
        amount,
        destChainId,
        callOptions,
        revertOptions
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        network: 'ZETA_TESTNET',
        action: 'withdraw',
        amount,
        asset: assetAddress,
        destChainId
      };
    } catch (error) {
      console.error('Withdraw cross-chain failed:', error);
      return {
        success: false,
        error: error.message,
        network: 'ZETA_TESTNET',
        action: 'withdraw'
      };
    }
  }

  // Get user position from OmniVault
  async getUserPosition(userAddress) {
    try {
      const vault = this.getContract('ZETA_TESTNET', 'OMNIVAULT');
      // Use the view exposed in OMNIVAULT_ABI: getCrossChainPosition(address)
      const position = await vault.getCrossChainPosition(userAddress);
      const [collateralUsd, debtUsd, hf] = position;
      return {
        collateralUsd,
        debtUsd,
        healthFactor: hf
      };
    } catch (error) {
      console.error('Error fetching user position:', error);
      throw error;
    }
  }

  // Get all user positions across all assets (placeholder)
  // The current OmniVault ABI does not expose per-reserve getters here.
  // Return an empty list to avoid frontend crashes. We can enrich this via events later.
  async getUserPositions(userAddress) {
    try {
      void userAddress;
      return [];
    } catch (error) {
      console.error('Error fetching user positions:', error);
      return [];
    }
  }
  
  // Helper to get asset details (implement based on your contract)
  async getAssetDetails(assetAddress) {
    // This is a placeholder - implement based on your contract
    // You might want to use a mapping of asset addresses to their details
    const assetMap = {
      // Example - replace with actual addresses and details
      '0x123...': { symbol: 'USDC', name: 'USD Coin', decimals: 6, chain: 'Ethereum' },
      '0x456...': { symbol: 'ETH', name: 'Ethereum', decimals: 18, chain: 'Ethereum' },
      // Add more assets as needed
    };
    
    return assetMap[assetAddress.toLowerCase()] || { 
      symbol: 'UNKNOWN', 
      name: 'Unknown Asset', 
      decimals: 18, 
      chain: 'ZetaChain' 
    };
  }

  // Get asset price from OmniVault
  async getAssetPrice(assetAddress) {
    try {
      const vault = this.getContract('ZETA_TESTNET', 'OMNIVAULT');
      const price = await vault.getAssetPriceUSD(assetAddress);
      return price.toString();
    } catch (error) {
      console.error('Failed to get asset price:', error);
      return null;
    }
  }

  // Get token balance
  async getTokenBalance(tokenAddress, userAddress, network) {
    try {
      const tokenContract = this.getERC20Contract(tokenAddress, network);
      const balance = await tokenContract.balanceOf(userAddress);
      const decimals = await tokenContract.decimals();
      
      return {
        balance: balance.toString(),
        decimals: decimals
      };
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return null;
    }
  }

  // Check if user can be liquidated
  async canBeLiquidated(userAddress) {
    try {
      const vault = this.getContract('ZETA_TESTNET', 'OMNIVAULT');
      return await vault.canBeLiquidated(userAddress);
    } catch (error) {
      console.error('Failed to check liquidation status:', error);
      return false;
    }
  }

  // Get transaction history from contract events
  async getTransactionHistory(userAddress, fromBlock = 0, toBlock = 'latest') {
    try {
      const vault = this.getContract('ZETA_TESTNET', 'OMNIVAULT');
      
      // Fetch all relevant events with user filter
      const supplyEvents = await vault.queryFilter(vault.filters.Supply(userAddress), fromBlock, toBlock);
      const borrowEvents = await vault.queryFilter(vault.filters.Borrow(userAddress), fromBlock, toBlock);
      const repayEvents = await vault.queryFilter(vault.filters.Repay(userAddress), fromBlock, toBlock);
      const withdrawEvents = await vault.queryFilter(vault.filters.Withdraw(userAddress), fromBlock, toBlock);
      const liquidateEvents = await vault.queryFilter(vault.filters.Liquidate(userAddress), fromBlock, toBlock);
      
      // Combine all events
      const allEvents = [
        ...supplyEvents.map(e => ({ ...e, type: 'supply' })),
        ...borrowEvents.map(e => ({ ...e, type: 'borrow' })),
        ...repayEvents.map(e => ({ ...e, type: 'repay' })),
        ...withdrawEvents.map(e => ({ ...e, type: 'withdraw' })),
        ...liquidateEvents.map(e => ({ ...e, type: 'liquidate' }))
      ];
      
      console.log(`Found ${allEvents.length} transactions for user ${userAddress}`);
      
      // Sort events by block number and transaction index
      const sortedEvents = allEvents.sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
          return a.transactionIndex - b.transactionIndex;
        }
        return a.blockNumber - b.blockNumber;
      });
      
      // Process events in batches to avoid rate limiting
      const batchSize = 10;
      const transactions = [];
      
      for (let i = 0; i < sortedEvents.length; i += batchSize) {
        const batch = sortedEvents.slice(i, i + batchSize);
        const batchTransactions = await Promise.all(batch.map(async (event) => {
          try {
            const { event: eventName, args, transactionHash, blockNumber, type } = event;
            const { asset, amount, originChainId, destChainId } = args || {};
            
            // Get block with timestamp
            const block = await this.getProvider('ZETA_TESTNET').getBlock(blockNumber);
            
            const baseTx = {
              id: transactionHash,
              type: type,
              txHash: transactionHash,
              timestamp: new Date(block.timestamp * 1000).toISOString(),
              status: 'completed'
            };
            
            switch (type) {
              case 'supply':
                return {
                  ...baseTx,
                  asset: asset,
                  chain: this.getChainName(originChainId?.toNumber() || 0),
                  amount: ethers.formatUnits(amount, 18)
                };
              case 'borrow':
                return {
                  ...baseTx,
                  asset: asset,
                  chain: this.getChainName(destChainId?.toNumber() || 0),
                  amount: ethers.formatUnits(amount, 18)
                };
              case 'repay':
                return {
                  ...baseTx,
                  asset: asset,
                  chain: this.getChainName(originChainId?.toNumber() || 0),
                  amount: ethers.formatUnits(amount, 18)
                };
              case 'withdraw':
                return {
                  ...baseTx,
                  asset: asset,
                  chain: this.getChainName(destChainId?.toNumber() || 0),
                  amount: ethers.formatUnits(amount, 18)
                };
              case 'liquidate':
                return {
                  ...baseTx,
                  asset: args.debtAsset,
                  chain: this.getChainName(args.targetChainId?.toNumber() || 0),
                  amount: '0', // Amount not directly available in event
                  isLiquidation: true
                };
              default:
                return null;
            }
          } catch (error) {
            console.error('Error processing transaction:', error);
            return null;
          }
        }));
        
        transactions.push(...batchTransactions.filter(tx => tx !== null));
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < sortedEvents.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // Filter out nulls and sort by timestamp (newest first)
      return transactions
        .filter(tx => tx !== null)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }
  
  // Helper function to get chain name from chain ID
  getChainName(chainId) {
    const chainMap = {
      1: 'Ethereum',
      56: 'BNB Chain',
      137: 'Polygon',
      43114: 'Avalanche',
      42161: 'Arbitrum',
      10: 'Optimism',
      250: 'Fantom',
      100: 'Gnosis',
      1284: 'Moonbeam',
      42220: 'Celo',
      1313161554: 'Aurora',
      1666600000: 'Harmony',
      25: 'Cronos',
      1285: 'Moonriver',
      199: 'BitTorrent',
      122: 'Fuse',
      40: 'Telos',
      128: 'Heco',
      66: 'OKX',
      10000: 'SmartBCH',
      32659: 'Fusion',
      88: 'TomoChain',
      30: 'RSK',
      70: 'Hoo',
      333999: 'Polyjuice',
      108: 'ThunderCore',
      1284: 'Moonbeam',
      592: 'Astar',
      336: 'Shiden',
      4689: 'IoTeX',
      246: 'Energy Web',
      50: 'XDC',
      333999: 'Polyjuice',
      1001: 'Klaytn Testnet',
      80001: 'Mumbai',
      97: 'BSC Testnet',
      5: 'Goerli',
      420: 'Optimism Goerli',
      421613: 'Arbitrum Goerli',
      43113: 'Fuji',
      4002: 'Fantom Testnet',
      44787: 'Celo Alfajores',
      80001: 'Mumbai',
      1442: 'Polygon zkEVM Testnet',
      280: 'zkSync Era Testnet',
      5001: 'Mantle Testnet',
      84531: 'Base Goerli',
      59140: 'Linea Testnet',
      534351: 'Scroll Testnet',
      5000: 'Mantle',
      1101: 'Polygon zkEVM',
      324: 'zkSync Era',
      204: 'opBNB',
      59144: 'Linea',
      534352: 'Scroll',
      7777777: 'Zora',
      10: 'Optimism',
      8453: 'Base',
      7000: 'ZetaChain',
    };
    return chainMap[chainId] || `Chain ${chainId}`;
  }

  // Set vault address in executor (admin function)
  async setVaultAddress(network, vaultAddress, signer) {
    try {
      const executor = this.getContract(network, 'OMNIVEXECUTOR', signer);
      const tx = await executor.setVaultAddress(vaultAddress);
      await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('Failed to set vault address:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();
export default contractService; 