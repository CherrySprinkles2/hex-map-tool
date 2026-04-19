import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import HomeScreen from './components/HomeScreen/HomeScreen';
import HelpScreen from './components/HelpScreen/HelpScreen';
import EditorRoute from './components/EditorRoute/EditorRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { migrateFromLegacy } from './utils/mapsStorage';
import { useAppSelector } from './app/hooks';

const App = (): React.ReactElement => {
  const location = useLocation();
  const currentMap = useAppSelector((state) => {
    return state.currentMap;
  });

  useEffect(() => {
    migrateFromLegacy();
  }, []);

  useEffect(() => {
    if (location.pathname === '/' || currentMap.id === null) {
      document.title = 'Hex Map Tool';
    } else {
      document.title = `${currentMap.name} — Hex Map Tool`;
    }
  }, [location.pathname, currentMap]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <HomeScreen />
            </ErrorBoundary>
          }
        />
        <Route path="/map/:mapSlug" element={<EditorRoute />} />
        <Route
          path="/help"
          element={
            <ErrorBoundary>
              <HelpScreen />
            </ErrorBoundary>
          }
        />
        <Route
          path="/help/:section"
          element={
            <ErrorBoundary>
              <HelpScreen />
            </ErrorBoundary>
          }
        />
        <Route path="*" element={<Navigate to="/" replace state={{ warning: 'pageNotFound' }} />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
