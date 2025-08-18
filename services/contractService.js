import { ethers } from 'ethers';
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
  async supplyToZeta(network, assetAddress, amount, signer) {
    try {
      const executor = this.getContract(network, 'OMNIVEXECUTOR', signer);
      const executorAddress = getContractAddress(network, 'OMNIVEXECUTOR');
      const tokenContract = this.getERC20Contract(assetAddress, network, signer);
      
      // Prepare revert options (match contract ABI order)
      const revertOptions = {
        revertAddress: executorAddress,
        callOnRevert: true,
        abortAddress: '0x0000000000000000000000000000000000000000',
        revertMessage: '0x',
        onRevertGasLimit: 500000
      };

      // Handle token approval with better error handling
      try {
        // First try to check allowance
        let allowance;
        try {
          allowance = await tokenContract.allowance(await signer.getAddress(), executorAddress);
          console.log('Current allowance:', allowance.toString());
        } catch (allowanceError) {
          console.warn('Allowance check failed, proceeding with approval:', allowanceError);
          // If allowance check fails, we'll still try to approve
          allowance = ethers.Zero; // Force approval
        }

        // If allowance is not enough, request approval
        const allowanceBN = typeof allowance === 'string' ? BigInt(allowance) : allowance;
        const amountBN = typeof amount === 'string' ? BigInt(amount) : amount;
        
        if (allowanceBN < amountBN) {
          console.log('Approving token spend...');
          const approveTx = await tokenContract.approve(executorAddress, ethers.MaxUint256);
          console.log('Approval tx sent, waiting for confirmation...');
          await approveTx.wait();
          console.log('Approval confirmed');
        }
      } catch (approveError) {
        console.error('Token approval failed:', approveError);
        return {
          success: false,
          error: `Token approval failed: ${approveError.message}. Please try approving the token in your wallet first.`,
          network,
          action: 'supply',
          approvalRejected: true
        };
      }
      // Execute supply
      console.log('Sending supply transaction...');
      const tx = await executor.supplyToZeta(assetAddress, amount, revertOptions);
      console.log('Transaction sent, waiting for confirmation...');
      
      // Add timeout for the transaction confirmation
      const timeout = 60000; // 60 seconds timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction confirmation timed out')), timeout)
        )
      ]).catch(async (error) => {
        console.warn('Error waiting for transaction receipt:', error);
        // If we can't get the receipt, still return success with just the transaction hash
        return { hash: tx.hash };
      });
      
      console.log('Transaction confirmed:', receipt.hash);
      return {
        success: true,
        txHash: receipt.hash || tx.hash, // Fallback to tx.hash if receipt.hash is not available
        network,
        action: 'supply',
        amount,
        asset: assetAddress
      };
    } catch (error) {
      console.error('Supply to ZetaChain failed:', error);
      return {
        success: false,
        error: error.message,
        network,
        action: 'supply'
      };
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