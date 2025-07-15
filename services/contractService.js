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
  'function supplyToZeta(address asset, uint256 amount, tuple(bool onRevert, address revertAddress) revertOptions) external payable',
  'function repayToZeta(address asset, uint256 amount, tuple(bool onRevert, address revertAddress) revertOptions) external payable',
  'function closePositionOnZeta(address user, tuple(bool onRevert, address revertAddress) revertOptions) external',
  
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
      
      // Prepare revert options
      const revertOptions = {
        onRevert: true,
        revertAddress: getContractAddress(network, 'OMNIVEXECUTOR')
      };

      // Approve tokens first
      const tokenContract = this.getERC20Contract(assetAddress, network, signer);
      const executorAddress = getContractAddress(network, 'OMNIVEXECUTOR');
      
      const allowance = await tokenContract.allowance(await signer.getAddress(), executorAddress);
      if (allowance < amount) {
        const approveTx = await tokenContract.approve(executorAddress, ethers.MaxUint256);
        await approveTx.wait();
      }

      // Execute supply
      const tx = await executor.supplyToZeta(assetAddress, amount, revertOptions);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
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
      
      // Prepare revert options
      const revertOptions = {
        onRevert: true,
        revertAddress: getContractAddress(network, 'OMNIVEXECUTOR')
      };

      // Approve tokens first
      const tokenContract = this.getERC20Contract(assetAddress, network, signer);
      const executorAddress = getContractAddress(network, 'OMNIVEXECUTOR');
      
      const allowance = await tokenContract.allowance(await signer.getAddress(), executorAddress);
      if (allowance < amount) {
        const approveTx = await tokenContract.approve(executorAddress, ethers.MaxUint256);
        await approveTx.wait();
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
      const position = await vault.getCrossChainPosition(userAddress);
      
      return {
        collateralUsd: position[0].toString(),
        debtUsd: position[1].toString(),
        healthFactor: position[2].toString()
      };
    } catch (error) {
      console.error('Failed to get user position:', error);
      return null;
    }
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