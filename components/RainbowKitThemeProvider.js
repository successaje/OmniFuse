import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { useTheme } from './ThemeProvider';

export default function RainbowKitThemeProvider({ children, chains }) {
  const { theme } = useTheme();

  const rainbowKitTheme = theme === 'dark' ? darkTheme() : lightTheme();

  return (
    <RainbowKitProvider 
      chains={chains}
      theme={rainbowKitTheme}
      modalSize="compact"
    >
      {children}
    </RainbowKitProvider>
  );
} 