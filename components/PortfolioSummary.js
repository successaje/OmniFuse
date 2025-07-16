import React from 'react';

export default function PortfolioSummary({ summary, isLoading }) {
  const items = [
    { label: 'Net Worth', value: summary?.netWorth, unit: 'USD' },
    { label: 'Supplied', value: summary?.totalSupplied, unit: 'USD' },
    { label: 'Borrowed', value: summary?.totalBorrowed, unit: 'USD' },
    { label: 'Health Factor', value: summary?.healthFactor, unit: '' },
  ];
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <div key={item.label} className="rounded-2xl bg-[var(--card-bg)] shadow-lg border border-[var(--border)] p-6 flex flex-col items-center justify-center">
          <span className="text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">{item.label}</span>
          {isLoading ? (
            <div className="h-8 w-20 bg-[var(--border)] rounded animate-pulse" />
          ) : (
            <span className="text-2xl md:text-3xl font-bold text-[var(--text-main)]">
              {item.value !== undefined ? item.value : '--'} {item.unit}
            </span>
          )}
        </div>
      ))}
    </section>
  );
} 