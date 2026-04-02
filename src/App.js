import React from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import HexGrid from './components/HexGrid/HexGrid';
import TileEditPanel from './components/TileEditPanel/TileEditPanel';
import Toolbar from './components/Toolbar/Toolbar';
import useLocalStorageSync from './hooks/useLocalStorageSync';

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const CanvasArea = styled.div`
  flex: 1;
  position: relative;
  display: flex;
`;

const AppInner = () => {
  useLocalStorageSync();
  return (
    <AppShell>
      <Toolbar />
      <CanvasArea>
        <HexGrid />
        <TileEditPanel />
      </CanvasArea>
    </AppShell>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
