import { useState } from 'react';
import { useOmniFuse } from '../hooks/useOmniFuse';
import { ethers } from 'ethers';

export default function TestIntegration() {
  const {
    userPosition,
    isLoading,
    error,
    supplyToZeta,
    borrowCrossChain,
    repayToZeta,
    withdrawCrossChain,
    getTokenBalance,
    getAssetPrice,
    checkLiquidationStatus,
    chainIds
  } = useOmniFuse();

  const [testAmount, setTestAmount] = useState('1');
  const [testAsset, setTestAsset] = useState('0x5425890298aed601595a70AB815c96711a31Bc65'); 
  const [testNetwork, setTestNetwork] = useState('AVALANCHE_FUJI');
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (action, result) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      action,
      result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testGetUserPosition = async () => {
    try {
      addTestResult('Get User Position', {
        success: true,
        data: userPosition ? {
          collateralUsd: ethers.formatUnits(userPosition.collateralUsd, 18),
          debtUsd: ethers.formatUnits(userPosition.debtUsd, 18),
          healthFactor: ethers.formatUnits(userPosition.healthFactor, 18)
        } : 'No position found'
      });
    } catch (error) {
      addTestResult('Get User Position', {
        success: false,
        error: error.message
      });
    }
  };

  const testGetAssetPrice = async () => {
    try {
      const price = await getAssetPrice(testAsset);
      addTestResult('Get Asset Price', {
        success: true,
        data: price ? ethers.formatUnits(price, 18) : 'No price found'
      });
    } catch (error) {
      addTestResult('Get Asset Price', {
        success: false,
        error: error.message
      });
    }
  };

  const testCheckLiquidationStatus = async () => {
    try {
      const canBeLiquidated = await checkLiquidationStatus();
      addTestResult('Check Liquidation Status', {
        success: true,
        data: canBeLiquidated ? 'Can be liquidated' : 'Safe from liquidation'
      });
    } catch (error) {
      addTestResult('Check Liquidation Status', {
        success: false,
        error: error.message
      });
    }
  };

  const testSupplyToZeta = async () => {
    try {
      const result = await supplyToZeta(testNetwork, testAsset, testAmount);
      addTestResult('Supply to Zeta', {
        success: result.success,
        data: result.success ? `Tx: ${result.txHash}` : result.error
      });
    } catch (error) {
      addTestResult('Supply to Zeta', {
        success: false,
        error: error.message
      });
    }
  };

  const testBorrowCrossChain = async () => {
    try {
      const result = await borrowCrossChain(testAsset, testAmount, chainIds.BASE_SEPOLIA);
      addTestResult('Borrow Cross-Chain', {
        success: result.success,
        data: result.success ? `Tx: ${result.txHash}` : result.error
      });
    } catch (error) {
      addTestResult('Borrow Cross-Chain', {
        success: false,
        error: error.message
      });
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[#23272F]/10">
      <h3 className="text-xl font-bold font-orbitron mb-4">Contract Integration Test</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Test Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Test Amount
            </label>
            <input
              type="text"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)]"
              placeholder="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Test Asset Address
            </label>
            <input
              type="text"
              value={testAsset}
              onChange={(e) => setTestAsset(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)]"
              placeholder="0x..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Test Network
            </label>
            <select
              value={testNetwork}
              onChange={(e) => setTestNetwork(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[#23272F]/10 text-[var(--text-main)]"
            >
              <option value="BASE_SEPOLIA">Base Sepolia</option>
              <option value="ZETA_TESTNET">ZetaChain Athens</option>
            </select>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-3">
          <button
            onClick={testGetUserPosition}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Test Get User Position
          </button>
          
          <button
            onClick={testGetAssetPrice}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Test Get Asset Price
          </button>
          
          <button
            onClick={testCheckLiquidationStatus}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            Test Liquidation Status
          </button>
          
          <button
            onClick={testSupplyToZeta}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Test Supply to Zeta
          </button>
          
          <button
            onClick={testBorrowCrossChain}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            Test Borrow Cross-Chain
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold">Test Results</h4>
          <button
            onClick={clearResults}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Clear Results
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-2">
          {testResults.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-8">
              No test results yet. Run some tests to see results here.
            </div>
          ) : (
            testResults.map((result) => (
              <div
                key={result.id}
                className={`p-3 rounded-lg border ${
                  result.result.success
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{result.action}</span>
                  <span className="text-xs text-[var(--text-muted)]">{result.timestamp}</span>
                </div>
                <div className="text-sm">
                  {result.result.success ? (
                    <span className="text-green-500">
                      ✅ Success: {typeof result.result.data === 'string' ? result.result.data : JSON.stringify(result.result.data)}
                    </span>
                  ) : (
                    <span className="text-red-500">
                      ❌ Error: {result.result.error}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-6 p-4 bg-[var(--background)] rounded-lg">
        <h4 className="text-lg font-semibold mb-2">Current Status</h4>
        <div className="space-y-2 text-sm">
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
          <div>User Position: {userPosition ? 'Loaded' : 'Not loaded'}</div>
          <div>Chain IDs: {Object.keys(chainIds).length} configured</div>
        </div>
      </div>
    </div>
  );
} 