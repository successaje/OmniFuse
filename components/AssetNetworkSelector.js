import React, { useState, useMemo } from 'react';
import { ASSETS } from '../config/contracts';

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

  // Networks available for the selected asset
  const availableNetworks = useMemo(() => {
    const nets = [];
    if (selectedAsset.erc20?.chain) nets.push(selectedAsset.erc20.chain);
    if (selectedAsset.zrc20?.chain) nets.push(selectedAsset.zrc20.chain);
    return nets;
  }, [selectedAsset]);

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
    <div className="flex gap-4 items-end">
      {/* Asset Selector */}
      <div>
        <label className="block text-xs mb-1 font-medium text-[var(--text-muted)]">Asset</label>
        <div className="relative">
          <select
            value={selectedAsset.symbol}
            onChange={handleAssetChange}
            className="border rounded px-2 py-2 pr-8 min-w-[140px] bg-[var(--background)] text-[var(--text-main)]"
          >
            <option value="" disabled>Select Asset</option>
            {ASSETS.map(asset => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol}
              </option>
            ))}
          </select>
          {/* Asset logo overlay */}
          {selectedAsset.icon && (
            <img src={selectedAsset.icon} alt={selectedAsset.symbol} className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
      </div>
      {/* Network Selector */}
      <div>
        <label className="block text-xs mb-1 font-medium text-[var(--text-muted)]">Network</label>
        <div className="relative">
          <select
            value={selectedNetwork}
            onChange={handleNetworkChange}
            className="border rounded px-2 py-2 pr-8 min-w-[140px] bg-[var(--background)] text-[var(--text-main)]"
          >
            <option value="" disabled>Select Network</option>
            {availableNetworks.map(net => (
              <option key={net} value={net}>
                {NETWORK_LABELS[net]?.name || net}
              </option>
            ))}
          </select>
          {/* Network logo overlay */}
          {NETWORK_LABELS[selectedNetwork]?.logo && (
            <img src={NETWORK_LABELS[selectedNetwork].logo} alt={NETWORK_LABELS[selectedNetwork].name} className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
} 