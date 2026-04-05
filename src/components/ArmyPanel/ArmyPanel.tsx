import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { updateArmy, deleteArmy, setArmyFaction } from '../../features/armies/armiesSlice';
import { deselectArmy, startMovingArmy, stopMovingArmy } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const Panel = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-left: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: ${({ theme }) => {
    return theme.zIndex.panel;
  }};
  overflow-y: auto;

  @media (min-width: 601px) {
    opacity: ${({ $open }) => {
      return $open ? '1' : '0';
    }};
    pointer-events: ${({ $open }) => {
      return $open ? 'auto' : 'none';
    }};
    transition: opacity 0.25s ease;
  }

  @media (max-width: 600px) {
    top: auto;
    left: 0;
    right: 0;
    bottom: ${({ $open }) => {
      return $open ? '0' : '-60vh';
    }};
    width: 100%;
    height: 60vh;
    border-left: none;
    border-top: 2px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    border-radius: 16px 16px 0 0;
    padding: 16px 16px 32px;
    transition: bottom 0.25s ease;
  }
`;

const DragHandle = styled.div`
  display: none;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => {
    return theme.panelBorder;
  }};
  margin: 0 auto -8px;

  @media (max-width: 600px) {
    display: block;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PanelTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin-bottom: 4px;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
  }

  &::placeholder {
    color: ${({ theme }) => {
      return theme.textMuted;
    }};
  }
`;

const CompositionTextarea = styled.textarea`
  width: 100%;
  min-height: 130px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.875rem;
  line-height: 1.5;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;

  &:focus {
    border-color: rgba(255, 255, 255, 0.35);
  }

  &::placeholder {
    color: ${({ theme }) => {
      return theme.textMuted;
    }};
  }
`;

const MoveBtn = styled.button<{ $active: boolean }>`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active }) => {
      return $active ? '#ffaa00' : 'rgba(255,255,255,0.2)';
    }};
  background: ${({ $active }) => {
    return $active ? 'rgba(255,170,0,0.15)' : 'rgba(255,255,255,0.03)';
  }};
  color: ${({ $active, theme }) => {
    return $active ? '#ffaa00' : theme.text;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ $active }) => {
      return $active ? 'rgba(255,170,0,0.25)' : 'rgba(255,255,255,0.08)';
    }};
  }
`;

const DeleteBtn = styled.button`
  margin-top: auto;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.accent;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.accent;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.accent;
    }}22;
  }
`;

const FactionSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
  appearance: none;

  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
  }

  option {
    background: ${({ theme }) => {
      return theme.panelBackground;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const Hint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  background: rgba(255, 170, 0, 0.08);
  border: 1px solid rgba(255, 170, 0, 0.2);
  border-radius: 6px;
  padding: 8px 10px;
  line-height: 1.5;
`;

const ArmyPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const selectedArmyId = useAppSelector((state) => {
    return state.ui.selectedArmyId;
  });
  const movingArmyId = useAppSelector((state) => {
    return state.ui.movingArmyId;
  });
  const army = useAppSelector((state) => {
    return selectedArmyId ? (state.armies[selectedArmyId] ?? null) : null;
  });
  const factions = useAppSelector((state) => {
    return state.factions;
  });

  const isOpen = selectedArmyId !== null && army !== null;
  const isMoving = movingArmyId === selectedArmyId;

  const { t } = useTranslation();

  const [localName, setLocalName] = useState('');
  const [localComposition, setLocalComposition] = useState('');

  useEffect(() => {
    if (army) {
      setLocalName(army.name);
      setLocalComposition(army.composition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArmyId]); // intentional: sync only when army identity changes

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMoving) dispatch(stopMovingArmy());
        else dispatch(deselectArmy());
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      return document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, isMoving]);

  const handleNameBlur = useCallback(() => {
    if (!army) return;
    const trimmed = localName.trim() || 'New Army';
    setLocalName(trimmed);
    dispatch(updateArmy({ id: army.id, name: trimmed }));
  }, [army, localName, dispatch]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  }, []);

  const handleCompositionBlur = useCallback(() => {
    if (!army) return;
    dispatch(updateArmy({ id: army.id, composition: localComposition }));
  }, [army, localComposition, dispatch]);

  const handleFactionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!army) return;
      const value = e.target.value;
      dispatch(setArmyFaction({ id: army.id, factionId: value === '' ? null : value }));
    },
    [army, dispatch]
  );

  const handleMoveToggle = useCallback(() => {
    if (!army) return;
    if (isMoving) dispatch(stopMovingArmy());
    else dispatch(startMovingArmy(army.id));
  }, [army, isMoving, dispatch]);

  const handleDelete = useCallback(() => {
    if (!army) return;
    dispatch(deleteArmy(army.id));
    dispatch(deselectArmy());
  }, [army, dispatch]);

  const handleClose = useCallback(() => {
    if (isMoving) dispatch(stopMovingArmy());
    dispatch(deselectArmy());
  }, [isMoving, dispatch]);

  return (
    <Panel $open={isOpen}>
      <DragHandle />
      <PanelHeader>
        <PanelTitle>{t('armyPanel.title')}</PanelTitle>
        <CloseBtn onClick={handleClose} title="Close (Esc)">
          ×
        </CloseBtn>
      </PanelHeader>

      {army && (
        <>
          <div>
            <SectionLabel>{t('armyPanel.name')}</SectionLabel>
            <NameInput
              value={localName}
              onChange={(e) => {
                return setLocalName(e.target.value);
              }}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              placeholder={t('armyPanel.namePlaceholder')}
              maxLength={40}
            />
          </div>

          <div>
            <SectionLabel>{t('armyPanel.composition')}</SectionLabel>
            <CompositionTextarea
              value={localComposition}
              onChange={(e) => {
                return setLocalComposition(e.target.value);
              }}
              onBlur={handleCompositionBlur}
              placeholder={t('armyPanel.compositionPlaceholder')}
            />
          </div>

          {factions.length > 0 && (
            <div>
              <SectionLabel>{t('armyPanel.faction')}</SectionLabel>
              <FactionSelect value={army.factionId ?? ''} onChange={handleFactionChange}>
                <option value="">{t('armyPanel.factionNone')}</option>
                {factions.map((f) => {
                  return (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  );
                })}
              </FactionSelect>
            </div>
          )}

          <MoveBtn $active={isMoving} onClick={handleMoveToggle}>
            {isMoving ? t('armyPanel.cancelMove') : t('armyPanel.moveArmy')}
          </MoveBtn>

          {isMoving && <Hint>{t('armyPanel.moveHint')}</Hint>}

          <DeleteBtn onClick={handleDelete}>{t('armyPanel.deleteArmy')}</DeleteBtn>
        </>
      )}
    </Panel>
  );
};

export default ArmyPanel;
