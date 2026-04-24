import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import HomeScreen from './components/HomeScreen/HomeScreen';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { migrateFromLegacy } from './utils/mapsStorage';
import { useAppSelector } from './app/hooks';

const EditorRoute = React.lazy(() => {
  return import('./components/EditorRoute/EditorRoute');
});
const HelpScreen = React.lazy(() => {
  return import('./components/HelpScreen/HelpScreen');
});

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
      <Suspense fallback={null}>
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
          <Route
            path="*"
            element={<Navigate to="/" replace state={{ warning: 'pageNotFound' }} />}
          />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
};

export default App;
