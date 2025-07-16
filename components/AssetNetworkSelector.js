import React, { useState, useMemo, useEffect } from 'react';
import { ASSETS } from '../config/contracts';
import { useOmniFuse } from '../hooks/useOmniFuse';
import { ethers } from 'ethers';

const NETWORK_LABELS = {
  ZETA_TESTNET: { name: 'ZetaChain Athens', logo: '/logos/zetachain.png' },
  AVALANCHE_FUJI: { name: 'Avalanche Fuji', logo: '/logos/avalanche-avax-logo.png' },
  BSC_TESTNET: { name: 'BSC Testnet', logo: '/logos/bnb-bnb-logo.png' },
  BASE_SEPOLIA: { name: 'Base Sepolia', logo: '/logos/base.png' },
};

export default function AssetNetworkSelector({ value, onChange }) {
  // value: { asset, network }
  const [selectedAsset, setSelectedAsset] = useState(value?.asset || ASSETS[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(
    value?.network || (selectedAsset.erc20?.chain || selectedAsset.zrc20.chain)
  );
  const [balances, setBalances] = useState({});
  const { getTokenBalance } = useOmniFuse();

  // Networks available for the selected asset
  const availableNetworks = useMemo(() => {
    const nets = [];
    if (selectedAsset.erc20?.chain) nets.push(selectedAsset.erc20.chain);
    if (selectedAsset.zrc20?.chain) nets.push(selectedAsset.zrc20.chain);
    return nets;
  }, [selectedAsset]);

  // Fetch balances for each available network
  useEffect(() => {
    let isMounted = true;
    async function fetchBalances() {
      const newBalances = {};
      for (const net of availableNetworks) {
        let tokenAddress = selectedAsset.erc20?.chain === net ? selectedAsset.erc20.address : selectedAsset.zrc20.address;
        if (!tokenAddress) continue;
        const bal = await getTokenBalance(tokenAddress, net);
        // Debug log
        console.log('Balance fetch:', {
          net,
          tokenAddress,
          bal,
          decimals: bal?.decimals,
          selectedAssetDecimals: selectedAsset.decimals
        });
        newBalances[net] = bal
          ? Number(ethers.formatUnits(bal.balance, bal.decimals || selectedAsset.decimals)).toFixed(6)
          : '0.000000';
      }
      if (isMounted) setBalances(newBalances);
    }
    fetchBalances();
    return () => { isMounted = false; };
  }, [selectedAsset, availableNetworks, getTokenBalance, selectedAsset.erc20, selectedAsset.zrc20]);

  // Handle asset change
  const handleAssetChange = (e) => {
    const asset = ASSETS.find(a => a.symbol === e.target.value);
    setSelectedAsset(asset);
    // Default to first available network for this asset
    const defaultNet = asset.erc20?.chain || asset.zrc20.chain;
    setSelectedNetwork(defaultNet);
    onChange && onChange({ asset, network: defaultNet });
  };

  // Handle network change
  const handleNetworkChange = (e) => {
    setSelectedNetwork(e.target.value);
    onChange && onChange({ asset: selectedAsset, network: e.target.value });
  };

  return (
    <div className="flex gap-4 items-center w-full">
      {/* Asset Selector */}
      <div className="flex flex-col justify-end flex-1 min-w-0">
        <label className="block text-xs mb-1 font-medium text-[var(--text-muted)]">Asset</label>
        <div className="relative">
          {/* Asset logo overlay, positioned left and vertically centered */}
          {selectedAsset.icon && (
            <img src={selectedAsset.icon} alt={selectedAsset.symbol} className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          )}
          <select
            value={selectedAsset.symbol}
            onChange={handleAssetChange}
            className="border border-[var(--border)] rounded pl-8 pr-8 py-2 w-full min-w-0 bg-[var(--background)] text-[var(--text-main)]"
          >
            <option value="" disabled>Select Asset</option>
            {ASSETS.map(asset => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Network Selector */}
      <div className="flex flex-col justify-end flex-1 min-w-0">
        <label className="block text-xs mb-1 font-medium text-[var(--text-muted)]">Network</label>
        <div className="relative">
          {/* Network logo overlay, positioned left and vertically centered */}
          {NETWORK_LABELS[selectedNetwork]?.logo && (
            <img src={NETWORK_LABELS[selectedNetwork].logo} alt={NETWORK_LABELS[selectedNetwork].name} className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          )}
          <select
            value={selectedNetwork}
            onChange={handleNetworkChange}
            className="border border-[var(--border)] rounded pl-8 pr-8 py-2 w-full min-w-0 bg-[var(--background)] text-[var(--text-main)]"
          >
            <option value="" disabled>Select Network</option>
            {availableNetworks.map(net => {
              const balance = balances[net];
              return (
                <option
                  key={net}
                  value={net}
                  title={balance === '0.000000' ? 'You have 0 balance on this network.' : undefined}
                >
                  {NETWORK_LABELS[net]?.name || net}
                </option>
              );
            })}
          </select>
        </div>
        {/* Balance display, contained and styled */}
        <div className="mt-1 px-2 py-1 rounded bg-[var(--card-bg)] text-xs text-[var(--text-main)] border border-[var(--primary-accent)]/20 w-fit">
          Balance: {balances[selectedNetwork] !== undefined ? balances[selectedNetwork] : '0.000000'} {selectedAsset.symbol}
        </div>
      </div>
    </div>
  );
} 