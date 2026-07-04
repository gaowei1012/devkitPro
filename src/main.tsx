import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useThemeStore } from './stores/themeStore';
import './assets/index.css';

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <HashRouter>
          <ThemeInitializer>
            <App />
          </ThemeInitializer>
        </HashRouter>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
