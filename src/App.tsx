import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import Editor from './components/Editor/Editor';
import HomeScreen from './components/HomeScreen/HomeScreen';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { migrateFromLegacy } from './utils/mapsStorage';
import { useAppSelector } from './app/hooks';

const App = (): React.ReactElement => {
  const screen = useAppSelector((state) => {
    return state.ui.screen;
  });
  const currentMap = useAppSelector((state) => {
    return state.currentMap;
  });

  useEffect(() => {
    migrateFromLegacy();
  }, []);

  useEffect(() => {
    if (screen === 'home' || currentMap.id === null) {
      document.title = 'Hex Map Tool';
    } else {
      document.title = `${currentMap.name} — Hex Map Tool`;
    }
  }, [screen, currentMap]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {screen === 'editor' ? (
        <ErrorBoundary>
          <Editor />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>
          <HomeScreen />
        </ErrorBoundary>
      )}
    </ThemeProvider>
  );
};

export default App;
