import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import HexGrid from './components/HexGrid/HexGrid';
import TileEditPanel from './components/TileEditPanel/TileEditPanel';
import ArmyPanel from './components/ArmyPanel/ArmyPanel';
import Toolbar from './components/Toolbar/Toolbar';
import HomeScreen from './components/HomeScreen/HomeScreen';
import FactionsPanel from './components/FactionsPanel/FactionsPanel';
import useLocalStorageSync from './hooks/useLocalStorageSync';
import { migrateFromLegacy } from './utils/mapsStorage';

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

const EditorInner = () => {
  useLocalStorageSync();
  return (
    <AppShell>
      <Toolbar />
      <CanvasArea>
        <ArmyPanel />
        <HexGrid />
        <TileEditPanel />
        <FactionsPanel />
      </CanvasArea>
    </AppShell>
  );
};

function App() {
  const screen = useSelector((state) => state.ui.screen);

  useEffect(() => {
    migrateFromLegacy();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {screen === 'editor' ? <EditorInner /> : <HomeScreen />}
    </ThemeProvider>
  );
}

export default App;
