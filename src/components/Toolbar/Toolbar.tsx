import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Backdrop, SheetItem, SheetIcon } from '../shared/sheet';
import { LanguageToggle } from '../shared/LanguageToggle';
import { LanguageModal } from '../shared/LanguageModal';
import { SettingsButton } from '../shared/SettingsButton';
import {
  KeyboardIcon,
  SettingsIcon,
  FlagIcon,
  MapIcon,
  GlobeIcon,
  DownloadIcon,
  QuestionIcon,
} from '../../assets/icons/ui';
import { importTiles } from '../../features/tiles/tilesSlice';
import { importArmies } from '../../features/armies/armiesSlice';
import {
  deselectTile,
  deselectArmy,
  toggleFactionsPanel,
  openShortcuts,
  closeShortcuts,
} from '../../features/ui/uiSlice';
import { renameCurrentMap, unloadMap } from '../../features/currentMap/currentMapSlice';
import { renameMap } from '../../utils/mapsStorage';
import { captureThumbnail } from '../../utils/captureThumbnail';
import { useAppDispatch, useAppSelector, useAppStore } from '../../app/hooks';
import TerrainConfigModal from '../TerrainConfigModal/TerrainConfigModal';

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

const MapNameInput = styled.input<{ $hasError?: boolean }>`
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme }) => {
    return theme.text;
  }};
  background: transparent;
  border: none;
  border-bottom: 1.5px solid
    ${({ $hasError, theme }) => {
      return $hasError ? theme.accent : 'transparent';
    }};
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
    border-bottom-color: ${({ $hasError, theme }) => {
      return $hasError ? theme.accent : theme.textMuted;
    }};
  }
`;

const NameError = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => {
    return theme.accent;
  }};
  position: absolute;
  top: 100%;
  left: 0;
  white-space: nowrap;
  padding: 2px 4px;
`;

const MapNameWrapper = styled.div`
  position: relative;
  min-width: 0;
  flex: 1;

  @media (min-width: 601px) {
    margin-right: auto;
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

const HelpBtn = styled.button`
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
    background: transparent;
    color: ${({ theme }) => {
      return theme.textMuted;
    }};
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
    line-height: 1;
    flex-shrink: 0;
    &:hover {
      background: ${({ theme }) => {
        return theme.panelBorder;
      }};
      color: ${({ theme }) => {
        return theme.text;
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
  const navigate = useNavigate();
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
  const [localName, setLocalName] = useState('');
  const [editing, setEditing] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [terrainConfigOpen, setTerrainConfigOpen] = useState(false);
  const store = useAppStore();

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
    setNameError(null);
  };

  const handleNameBlur = () => {
    setEditing(false);
    const trimmed = localName.trim() || t('home.untitledMap');
    if (mapId) {
      const result = renameMap(mapId, trimmed);
      if (!result.ok) {
        setNameError(t('toolbar.nameTaken'));
        return;
      }
      setNameError(null);
    }
    dispatch(renameCurrentMap(trimmed));
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
    navigate('/');
  };

  const handleExport = () => {
    setSettingsOpen(false);
    const terrainConfig = store.getState().terrainConfig;
    const thumbnail = captureThumbnail(tiles, terrainConfig.custom);
    const payload = {
      name: mapName || 'hex-map',
      tiles,
      armies,
      factions,
      terrainConfig,
      thumbnail,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapName || 'hex-map'}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

  const handleHelpClick = () => {
    setSettingsOpen(false);
    navigate('/help');
  };

  return (
    <>
      <Bar $rightPanelOpen={rightPanelOpen}>
        <BackBtn onClick={handleBack} data-testid="back-btn">
          {t('toolbar.back')}
        </BackBtn>
        <MapNameWrapper>
          <MapNameInput
            data-testid="map-name-input"
            $hasError={nameError !== null}
            value={displayName}
            onChange={(e) => {
              return setLocalName(e.target.value);
            }}
            onFocus={handleNameFocus}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            maxLength={48}
          />
          {nameError && <NameError>{nameError}</NameError>}
        </MapNameWrapper>
        <DesktopFactionsBtn
          data-testid="factions-btn"
          $active={factionsOpen}
          onClick={handleFactionsClick}
        >
          <FlagIcon width="1em" height="1em" aria-hidden />
          {t('toolbar.factions')}
        </DesktopFactionsBtn>
        <ShortcutsBtn
          $active={showShortcuts}
          onClick={handleShortcutsToggle}
          aria-label={t('toolbar.keyboardShortcuts')}
        >
          <KeyboardIcon width="1.1em" height="1.1em" aria-hidden />
        </ShortcutsBtn>
        <HelpBtn onClick={handleHelpClick} aria-label={t('help.helpButtonLabel')}>
          <QuestionIcon width="1.1em" height="1.1em" aria-hidden />
        </HelpBtn>
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
          <SettingsIcon width="1.1em" height="1.1em" aria-hidden />
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
        <SheetItem
          data-testid="mobile-factions-btn"
          $active={factionsOpen}
          $desktopHide
          onClick={handleFactionsClick}
        >
          <SheetIcon>
            <FlagIcon aria-hidden />
          </SheetIcon>
          {t('toolbar.factions')}
        </SheetItem>
        <SheetItem $desktopHide onClick={handleShortcutsMobile}>
          <SheetIcon>
            <KeyboardIcon aria-hidden />
          </SheetIcon>
          {t('toolbar.keyboardShortcuts')}
        </SheetItem>
        <SheetItem $desktopHide onClick={handleHelpClick}>
          <SheetIcon>
            <QuestionIcon aria-hidden />
          </SheetIcon>
          {t('help.helpButtonLabel')}
        </SheetItem>
        <SheetItem
          onClick={() => {
            setSettingsOpen(false);
            setTerrainConfigOpen(true);
          }}
        >
          <SheetIcon>
            <MapIcon aria-hidden />
          </SheetIcon>
          {t('terrainConfig.title')}
        </SheetItem>
        <SheetItem data-testid="export-json-btn" onClick={handleExport}>
          <SheetIcon>
            <DownloadIcon aria-hidden />
          </SheetIcon>
          {t('toolbar.exportJSON')}
        </SheetItem>
        <SheetItem
          $desktopHide
          onClick={() => {
            setSettingsOpen(false);
            setLangModalOpen(true);
          }}
        >
          <SheetIcon>
            <GlobeIcon aria-hidden />
          </SheetIcon>
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

      {terrainConfigOpen && (
        <TerrainConfigModal
          onClose={() => {
            return setTerrainConfigOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Toolbar;
