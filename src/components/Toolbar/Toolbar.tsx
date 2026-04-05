import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
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

const SettingsBtn = styled.button<{ $active: boolean }>`
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

const LangToggle = styled.div`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    overflow: hidden;
    flex-shrink: 0;
  }
`;

const LangBtn = styled.button<{ $active: boolean }>`
  padding: 5px 10px;
  border: none;
  background: ${({ $active, theme }) => {
    return $active ? theme.panelBorder : 'transparent';
  }};
  color: ${({ $active, theme }) => {
    return $active ? theme.text : theme.textMuted;
  }};
  font-size: 0.75rem;
  font-weight: ${({ $active }) => {
    return $active ? '700' : '400';
  }};
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
    background: ${({ $active, theme }) => {
      return $active ? theme.panelBorder : 'rgba(255,255,255,0.06)';
    }};
  }
`;

const ModalBackdrop = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => {
    return $open ? 'flex' : 'none';
  }};
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => {
    return theme.zIndex.sheet + 1;
  }};
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);

  @media (min-width: 601px) {
    display: none;
  }
`;

const ModalCard = styled.div`
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  border-radius: 12px;
  padding: 20px 16px;
  width: min(320px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModalTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 4px;
`;

const LangOption = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active, theme }) => {
      return $active ? theme.textMuted : 'transparent';
    }};
  background: ${({ $active }) => {
    return $active ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  font-weight: ${({ $active }) => {
    return $active ? '600' : '400';
  }};
  cursor: pointer;
  text-align: left;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Backdrop = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => {
    return $open ? 'block' : 'none';
  }};
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => {
    return theme.zIndex.backdrop;
  }};
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

const SheetItem = styled.button<{ $active?: boolean; $desktopHide?: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 24px;
  background: ${({ $active }) => {
    return $active ? 'rgba(255,255,255,0.06)' : 'transparent';
  }};
  border: none;
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
  letter-spacing: 0.02em;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  @media (min-width: 601px) {
    padding: 10px 20px;
    font-size: 0.85rem;
    display: ${({ $desktopHide }) => {
      return $desktopHide ? 'none' : 'flex';
    }};
  }
`;

const SheetIcon = styled.span`
  font-size: 1.1rem;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
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

  const handleLanguageSelect = (lang: string) => {
    i18n.changeLanguage(lang);
    setLangModalOpen(false);
    setSettingsOpen(false);
  };

  const currentLang = i18n.language.startsWith('fi') ? 'fi' : 'en';

  return (
    <>
      <Bar $rightPanelOpen={rightPanelOpen}>
        <BackBtn onClick={handleBack}>{t('toolbar.back')}</BackBtn>
        <MapNameInput
          value={displayName}
          onChange={(e) => {
            return setLocalName(e.target.value);
          }}
          onFocus={handleNameFocus}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          maxLength={48}
        />
        <DesktopFactionsBtn $active={factionsOpen} onClick={handleFactionsClick}>
          {t('toolbar.factions')}
        </DesktopFactionsBtn>
        <ShortcutsBtn
          $active={showShortcuts}
          onClick={handleShortcutsToggle}
          aria-label={t('toolbar.keyboardShortcuts')}
        >
          ⌨
        </ShortcutsBtn>
        <LangToggle aria-label="Language">
          <LangBtn
            $active={currentLang === 'en'}
            onClick={() => {
              return handleLanguageSelect('en');
            }}
          >
            EN
          </LangBtn>
          <LangBtn
            $active={currentLang === 'fi'}
            onClick={() => {
              return handleLanguageSelect('fi');
            }}
          >
            FI
          </LangBtn>
        </LangToggle>
        <SettingsBtn
          $active={settingsOpen}
          onClick={() => {
            return setSettingsOpen((o) => {
              return !o;
            });
          }}
          aria-label="Settings"
        >
          ⚙
        </SettingsBtn>
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
        <SheetItem onClick={handleExport}>
          <SheetIcon>⬇</SheetIcon>
          {t('toolbar.exportJSON')}
        </SheetItem>
        <SheetItem
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

      <ModalBackdrop
        $open={langModalOpen}
        onClick={() => {
          return setLangModalOpen(false);
        }}
      >
        <ModalCard
          onClick={(e) => {
            return e.stopPropagation();
          }}
        >
          <ModalTitle>{t('toolbar.languageLabel')}</ModalTitle>
          <LangOption
            $active={currentLang === 'en'}
            onClick={() => {
              return handleLanguageSelect('en');
            }}
          >
            🇬🇧 English
          </LangOption>
          <LangOption
            $active={currentLang === 'fi'}
            onClick={() => {
              return handleLanguageSelect('fi');
            }}
          >
            🇫🇮 Suomi
          </LangOption>
        </ModalCard>
      </ModalBackdrop>

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
