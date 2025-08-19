'use client';

import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { useTheme } from './ThemeProvider';

export default function RainbowKitThemeProvider({ children }) {
  const { theme } = useTheme();

  // Create theme with some customizations
  const rainbowKitTheme = theme === 'dark' 
    ? darkTheme({
        accentColor: '#3B82F6',
        accentColorForeground: 'white',
        borderRadius: 'medium',
        fontStack: 'system',
        overlayBlur: 'small',
      })
    : lightTheme({
        accentColor: '#2563EB',
        accentColorForeground: 'white',
        borderRadius: 'medium',
        fontStack: 'system',
        overlayBlur: 'small',
      });

  return (
    <RainbowKitProvider 
      theme={rainbowKitTheme}
      modalSize="compact"
      appInfo={{
        appName: 'OmniFuse',
        learnMoreUrl: 'https://docs.omnifuse.xyz',
      }}
    >
      {children}
    </RainbowKitProvider>
  );
}