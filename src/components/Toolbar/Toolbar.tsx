import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Backdrop, SheetItem, SheetIcon } from '../shared/sheet';
import { LanguageToggle } from '../shared/LanguageToggle';
import { LanguageModal } from '../shared/LanguageModal';
import { SettingsButton } from '../shared/SettingsButton';
import { importTiles } from '../../features/tiles/tilesSlice';
import { importArmies } from '../../features/armies/armiesSlice';
import { importFactions } from '../../features/factions/factionsSlice';
import {
  deselectTile,
  deselectArmy,
  setScreen,
  toggleFactionsPanel,
  openShortcuts,
  closeShortcuts,
} from '../../features/ui/uiSlice';
import { renameCurrentMap, unloadMap } from '../../features/currentMap/currentMapSlice';
import { renameMap, getAllMaps } from '../../utils/mapsStorage';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const Bar = styled.div<{ $rightPanelOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-bottom: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  z-index: ${({ theme }) => {
    return theme.zIndex.toolbar;
  }};
  flex-shrink: 0;

  @media (min-width: 601px) {
    padding-right: ${({ $rightPanelOpen }) => {
      return $rightPanelOpen ? '296px' : '16px';
    }};
    transition: padding-right 0.25s ease;
  }
`;

const BackBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  white-space: nowrap;
  &:hover {
    background: ${({ theme }) => {
      return theme.panelBorder;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const MapNameInput = styled.input`
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme }) => {
    return theme.text;
  }};
  background: transparent;
  border: none;
  border-bottom: 1.5px solid transparent;
  border-radius: 0;
  padding: 2px 4px;
  outline: none;
  min-width: 0;
  flex: 1;
  max-width: 260px;
  transition: border-color 0.15s;
  cursor: text;

  @media (min-width: 601px) {
    max-width: 100%;
    margin-right: auto;
  }

  &:hover,
  &:focus {
    border-bottom-color: ${({ theme }) => {
      return theme.textMuted;
    }};
  }
`;

const DesktopFactionsBtn = styled.button<{ $active: boolean }>`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    background: ${({ $active, theme }) => {
      return $active ? theme.panelBorder : 'transparent';
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
    &:hover {
      background: ${({ theme }) => {
        return theme.panelBorder;
      }};
    }
  }
`;

const ShortcutsBtn = styled.button<{ $active: boolean }>`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    background: ${({ $active, theme }) => {
      return $active ? theme.panelBorder : 'transparent';
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.15s;
    line-height: 1;
    flex-shrink: 0;
    &:hover {
      background: ${({ theme }) => {
        return theme.panelBorder;
      }};
    }
  }
`;

const Sheet = styled.div<{ $open: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: ${({ $open }) => {
    return $open ? '0' : '-100%';
  }};
  z-index: ${({ theme }) => {
    return theme.zIndex.sheet;
  }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-top: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  border-radius: 16px 16px 0 0;
  padding: 8px 0 env(safe-area-inset-bottom, 0);
  transition: bottom 0.25s ease;
  max-width: 480px;
  margin: 0 auto;

  @media (min-width: 601px) {
    left: auto;
    right: 16px;
    bottom: auto;
    top: ${({ $open }) => {
      return $open ? '52px' : '-200%';
    }};
    border-radius: 8px;
    border: 2px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    min-width: 220px;
    padding: 4px 0;
    transition:
      top 0.2s ease,
      opacity 0.2s ease;
    opacity: ${({ $open }) => {
      return $open ? 1 : 0;
    }};
    pointer-events: ${({ $open }) => {
      return $open ? 'auto' : 'none';
    }};
  }
`;

const SheetHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => {
    return theme.panelBorder;
  }};
  margin: 8px auto 12px;

  @media (min-width: 601px) {
    display: none;
  }
`;

const Toolbar = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const tiles = useAppSelector((state) => {
    return state.tiles;
  });
  const armies = useAppSelector((state) => {
    return state.armies;
  });
  const factions = useAppSelector((state) => {
    return state.factions;
  });
  const mapName = useAppSelector((state) => {
    return state.currentMap.name;
  });
  const mapId = useAppSelector((state) => {
    return state.currentMap.id;
  });
  const factionsOpen = useAppSelector((state) => {
    return state.ui.factionsOpen;
  });
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
  });
  const showShortcuts = useAppSelector((state) => {
    return state.ui.showShortcuts;
  });
  const selectedArmyId = useAppSelector((state) => {
    return state.ui.selectedArmyId;
  });
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [localName, setLocalName] = useState('');
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const rightPanelOpen =
    mapMode === 'terrain' ||
    mapMode === 'terrain-paint' ||
    mapMode === 'faction' ||
    showShortcuts ||
    selectedArmyId !== null;

  const displayName = editing ? localName : mapName;

  const handleNameFocus = () => {
    setLocalName(mapName);
    setEditing(true);
  };

  const handleNameBlur = () => {
    setEditing(false);
    const trimmed = localName.trim() || t('home.untitledMap');
    dispatch(renameCurrentMap(trimmed));
    if (mapId) renameMap(mapId, trimmed);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  const handleBack = () => {
    dispatch(deselectTile());
    dispatch(deselectArmy());
    dispatch(unloadMap());
    dispatch(importTiles({}));
    dispatch(importArmies({}));
    dispatch(setScreen('home'));
  };

  const handleExport = () => {
    setSettingsOpen(false);
    const payload = { name: mapName || 'hex-map', tiles, armies, factions };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapName || 'hex-map'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target!.result as string);
        if (data && typeof data === 'object' && data.tiles) {
          dispatch(importTiles(data.tiles));
          dispatch(importArmies(data.armies ?? {}));
          dispatch(importFactions(data.factions ?? []));
          const desired = (data.name || '').trim() || 'Untitled Map';
          const takenNames = new Set(
            getAllMaps()
              .filter((m) => {
                return m.id !== mapId;
              })
              .map((m) => {
                return m.name;
              })
          );
          let finalName = desired;
          if (takenNames.has(finalName)) {
            let n = 2;
            while (takenNames.has(`${desired} (${n})`)) n++;
            finalName = `${desired} (${n})`;
          }
          dispatch(renameCurrentMap(finalName));
          if (mapId) renameMap(mapId, finalName);
        } else {
          dispatch(importTiles(data));
          dispatch(importArmies({}));
          dispatch(importFactions([]));
        }
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFactionsClick = () => {
    setSettingsOpen(false);
    dispatch(toggleFactionsPanel());
  };

  const handleShortcutsToggle = () => {
    if (showShortcuts) {
      dispatch(closeShortcuts());
    } else {
      dispatch(openShortcuts());
    }
  };

  const handleShortcutsMobile = () => {
    setSettingsOpen(false);
    dispatch(openShortcuts());
  };

  return (
    <>
      <Bar $rightPanelOpen={rightPanelOpen}>
        <BackBtn onClick={handleBack} data-testid="back-btn">
          {t('toolbar.back')}
        </BackBtn>
        <MapNameInput
          data-testid="map-name-input"
          value={displayName}
          onChange={(e) => {
            return setLocalName(e.target.value);
          }}
          onFocus={handleNameFocus}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          maxLength={48}
        />
        <DesktopFactionsBtn
          data-testid="factions-btn"
          $active={factionsOpen}
          onClick={handleFactionsClick}
        >
          {t('toolbar.factions')}
        </DesktopFactionsBtn>
        <ShortcutsBtn
          $active={showShortcuts}
          onClick={handleShortcutsToggle}
          aria-label={t('toolbar.keyboardShortcuts')}
        >
          ⌨
        </ShortcutsBtn>
        <LanguageToggle
          onAfterSelect={() => {
            return setSettingsOpen(false);
          }}
        />
        <SettingsButton
          $active={settingsOpen}
          onClick={() => {
            return setSettingsOpen((o) => {
              return !o;
            });
          }}
          aria-label="Settings"
        >
          ⚙
        </SettingsButton>
      </Bar>

      <Backdrop
        $open={settingsOpen}
        onClick={() => {
          return setSettingsOpen(false);
        }}
      />

      <Sheet $open={settingsOpen}>
        <SheetHandle />
        <SheetItem $active={factionsOpen} $desktopHide onClick={handleFactionsClick}>
          <SheetIcon>⚑</SheetIcon>
          {t('toolbar.factions')}
        </SheetItem>
        <SheetItem $desktopHide onClick={handleShortcutsMobile}>
          <SheetIcon>⌨</SheetIcon>
          {t('toolbar.keyboardShortcuts')}
        </SheetItem>
        <SheetItem data-testid="export-json-btn" onClick={handleExport}>
          <SheetIcon>⬇</SheetIcon>
          {t('toolbar.exportJSON')}
        </SheetItem>
        <SheetItem
          data-testid="import-json-btn"
          onClick={() => {
            setSettingsOpen(false);
            fileInput.current?.click();
          }}
        >
          <SheetIcon>⬆</SheetIcon>
          {t('toolbar.importJSON')}
        </SheetItem>
        <SheetItem
          $desktopHide
          onClick={() => {
            setSettingsOpen(false);
            setLangModalOpen(true);
          }}
        >
          <SheetIcon>🌐</SheetIcon>
          {t('toolbar.languageLabel')}
        </SheetItem>
      </Sheet>

      <LanguageModal
        open={langModalOpen}
        onClose={() => {
          return setLangModalOpen(false);
        }}
        onAfterSelect={() => {
          return setSettingsOpen(false);
        }}
      />

      <input
        ref={fileInput}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
    </>
  );
};

export default Toolbar;
