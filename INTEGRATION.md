# OmniFuse Frontend Integration

This document describes how the frontend has been integrated with the deployed OmniFuse smart contracts.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env.local` file in the frontend directory:
   ```env
   # OmniFuse Frontend Configuration
   # Contract addresses for deployed contracts

   # ZetaChain Athens Testnet
   NEXT_PUBLIC_ZETA_TESTNET_OMNIVAULT=0x7b65E735F1b43102f672Dc04B6E33a424a955c13
   NEXT_PUBLIC_ZETA_TESTNET_GATEWAY=0x6c533f7fe93fae114d0954697069df33c9b74fd7
   NEXT_PUBLIC_ZETA_TESTNET_PYTH=0x0708325268dF9F66270F1401206434524814508b

   # Base Sepolia Testnet
   NEXT_PUBLIC_BASE_SEPOLIA_OMNIVEXECUTOR=0xFC6F253F59eD5D63b7db932b51Fa99c2e99D4145
   NEXT_PUBLIC_BASE_SEPOLIA_GATEWAY=0x0c487a766110c85d301d96e33579c5b317fa4995

   # RPC URLs
   NEXT_PUBLIC_ZETA_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
   NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org

   # Explorer URLs
   NEXT_PUBLIC_ZETA_EXPLORER=https://zetachain-testnet.blockscout.com
   NEXT_PUBLIC_BASE_EXPLORER=https://sepolia.basescan.org

   # WalletConnect (optional)
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=514f5b55cb296fd534b978dcf5cf24e8
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Integration**
   - Navigate to `/admin` page
   - Use the "Contract Integration Test" component to test various functions
   - Check the dashboard for real user position data

## 📁 File Structure

### Configuration
- `config/contracts.js` - Contract addresses and network configurations
- `services/contractService.js` - Service layer for contract interactions
- `hooks/useOmniFuse.js` - React hook for easy contract integration

### Components
- `components/TestIntegration.js` - Test component for verifying integration
- `pages/admin.js` - Admin page with integration testing
- `pages/dashboard.js` - Dashboard with real user position data
- `pages/manage.js` - Asset management with cross-chain actions

## 🔧 Integration Details

### Contract Service (`services/contractService.js`)
The contract service provides a clean interface for interacting with the deployed contracts:

- **Cross-chain operations**: Supply, borrow, repay, withdraw
- **Position management**: Get user positions, health factors
- **Asset information**: Prices, balances, liquidation status
- **Admin functions**: Set vault addresses, register assets

### React Hook (`hooks/useOmniFuse.js`)
The `useOmniFuse` hook provides React components with:

- **State management**: User position, loading states, errors
- **Action functions**: All cross-chain lending operations
- **Auto-refresh**: Automatic position updates every 30 seconds
- **Error handling**: Centralized error management

### Configuration (`config/contracts.js`)
Centralized configuration for:

- **Contract addresses**: All deployed contract addresses
- **Network settings**: RPC URLs, chain IDs, explorers
- **Helper functions**: Easy access to contract addresses and configs

## 🧪 Testing Integration

### Test Component
The `TestIntegration` component on the admin page allows you to:

1. **Test Read Operations**
   - Get user position from OmniVault
   - Get asset prices from Pyth
   - Check liquidation status

2. **Test Write Operations**
   - Supply assets to ZetaChain
   - Borrow assets cross-chain
   - Repay loans
   - Withdraw collateral

3. **Monitor Results**
   - Real-time test results
   - Transaction hashes
   - Error messages
   - Success confirmations

### Manual Testing Steps

1. **Connect Wallet**
   - Ensure wallet is connected to supported networks
   - Switch between ZetaChain Athens and Base Sepolia

2. **Test Read Functions**
   - Click "Test Get User Position" to verify connection
   - Click "Test Get Asset Price" to check price feeds
   - Click "Test Liquidation Status" to verify position health

3. **Test Write Functions**
   - Ensure you have test tokens on Base Sepolia
   - Try "Test Supply to Zeta" with small amounts
   - Monitor transaction status and confirmations

## 🔗 Cross-Chain Flow

### Supply Flow (EVM → ZetaChain)
1. User approves tokens on EVM chain
2. OmniExecutor calls `supplyToZeta()`
3. ZetaChain gateway processes cross-chain message
4. OmniVault receives supply and updates position
5. User receives confirmation

### Borrow Flow (ZetaChain → EVM)
1. User calls `requestBorrowCrossChain()` on OmniVault
2. ZetaChain gateway sends cross-chain message
3. OmniExecutor receives borrow request
4. Tokens are transferred to user on EVM chain
5. Position is updated on ZetaChain

### Repay Flow (EVM → ZetaChain)
1. User approves tokens on EVM chain
2. OmniExecutor calls `repayToZeta()`
3. Cross-chain message reduces debt on OmniVault
4. Position health factor improves

### Withdraw Flow (ZetaChain → EVM)
1. User calls `requestWithdrawCrossChain()` on OmniVault
2. Cross-chain message triggers withdrawal
3. OmniExecutor transfers tokens to user
4. Collateral is reduced on OmniVault

## 🛠️ Troubleshooting

### Common Issues

1. **"Provider not initialized"**
   - Check RPC URLs in configuration
   - Ensure network is supported

2. **"Contract not found"**
   - Verify contract addresses are correct
   - Check if contracts are deployed on correct networks

3. **"Transaction failed"**
   - Check gas limits and fees
   - Ensure user has sufficient tokens
   - Verify token approvals

4. **"Cross-chain message failed"**
   - Check gateway addresses
   - Verify revert options are set correctly
   - Monitor ZetaChain explorer for message status

### Debug Steps

1. **Check Browser Console**
   - Look for JavaScript errors
   - Monitor network requests
   - Check wallet connection status

2. **Verify Contract State**
   - Use block explorers to check contract state
   - Verify user positions on OmniVault
   - Check token balances on both chains

3. **Test Individual Components**
   - Use Hardhat tasks to test contracts directly
   - Verify cross-chain messages manually
   - Check Pyth price feed status

## 📊 Monitoring

### Key Metrics to Monitor
- User position health factors
- Cross-chain message success rates
- Gas costs for operations
- Transaction confirmation times
- Error rates and types

### Tools for Monitoring
- ZetaChain Athens explorer
- Base Sepolia explorer
- Pyth price feed dashboard
- Contract event logs
- Frontend error tracking

## 🔄 Updates and Maintenance

### Adding New Networks
1. Update `config/contracts.js` with new network details
2. Add contract addresses for new network
3. Update RPC URLs and explorers
4. Test integration with new network

### Adding New Assets
1. Register asset in OmniVault
2. Set Pyth price feed ID
3. Update frontend asset lists
4. Test supply/borrow flows

### Updating Contract Addresses
1. Update addresses in `config/contracts.js`
2. Verify new contracts are deployed and verified
3. Test all functions with new addresses
4. Update documentation

## 🚀 Next Steps

1. **Production Deployment**
   - Deploy to mainnet networks
   - Update contract addresses
   - Configure production RPC endpoints
   - Set up monitoring and alerts

2. **Enhanced Features**
   - Add more supported assets
   - Implement advanced position management
   - Add analytics and reporting
   - Build mobile app

3. **Security Enhancements**
   - Add multi-sig admin controls
   - Implement rate limiting
   - Add transaction simulation
   - Enhanced error handling

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review contract documentation
- Test with Hardhat tasks first
- Monitor contract events and logs 