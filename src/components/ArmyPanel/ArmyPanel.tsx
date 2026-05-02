import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { updateArmy, deleteArmy, setArmyFaction } from '../../features/armies/armiesSlice';
import { deselectArmy, startMovingArmy, stopMovingArmy } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { PanelHeader } from '../shared/PanelHeader';
import { SectionLabel } from '../shared/SectionLabel';
import { StyledTextarea } from '../shared/StyledTextarea';
import { StyledInput } from '../shared/StyledInput';
import { ButtonGroup } from '../shared/ButtonGroup';
import { DangerButton } from '../shared/DangerButton';
import { ConfirmModal } from '../shared/ConfirmModal';
import { SwordsIcon, MoveArrowIcon, CloseIcon, TrashIcon } from '../../assets/icons/ui';
import styled from 'styled-components';

const BTN_ICON_PROPS = {
  width: '1em',
  height: '1em',
  style: { marginRight: '0.4em', flexShrink: 0 },
  'aria-hidden': true,
} as const;

// ── Styled components ──────────────────────────────────────────────────────────

const MoveBtn = styled.button<{ $active: boolean }>`
  position: relative;
  padding: 10px;
  border-radius: 0;
  border: 2px solid
    ${({ $active, theme }) => {
      return $active ? theme.army.movingColor : theme.surface.borderMedium;
    }};
  background: ${({ $active, theme }) => {
    return $active ? `${theme.army.movingColor}26` : theme.surface.subtle;
  }};
  color: ${({ $active, theme }) => {
    return $active ? theme.army.movingColor : theme.text;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  z-index: ${({ $active }) => {
    return $active ? 1 : 0;
  }};
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ $active, theme }) => {
      return $active ? `${theme.army.movingColor}40` : theme.surface.hover;
    }};
  }
`;

const Hint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  background: ${({ theme }) => {
    return `${theme.army.movingColor}14`;
  }};
  border: 1px solid
    ${({ theme }) => {
      return `${theme.army.movingColor}33`;
    }};
  border-radius: 6px;
  padding: 8px 10px;
  line-height: 1.5;
`;

// ── Custom dropdown ────────────────────────────────────────────────────────────

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownTrigger = styled.button<{ $open: boolean }>`
  width: 100%;
  padding: 8px 36px 8px 12px;
  border-radius: 8px;
  border: 2px solid
    ${({ $open, theme }) => {
      return $open ? theme.surface.borderFocus : theme.surface.border;
    }};
  background: ${({ theme }) => {
    return theme.surface.card;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => {
      return theme.surface.borderMedium;
    }};
  }

  &::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%)
      ${({ $open }) => {
        return $open ? 'rotate(180deg)' : 'rotate(0deg)';
      }};
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid
      ${({ theme }) => {
        return theme.surface.borderFocus;
      }};
    transition: transform 0.15s;
  }
`;

const DropdownList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  box-shadow: 0 8px 24px
    ${({ theme }) => {
      return theme.surface.overlayMedium;
    }};
  z-index: ${({ theme }) => {
    return theme.zIndex.dropdown;
  }};
  max-height: 200px;
  overflow-y: auto;
`;

const DropdownOption = styled.li<{ $selected: boolean }>`
  padding: 8px 12px;
  font-size: 0.9rem;
  color: ${({ $selected, theme }) => {
    return $selected ? theme.text : theme.textMuted;
  }};
  background: ${({ $selected, theme }) => {
    return $selected ? theme.surface.hover : 'transparent';
  }};
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => {
      return theme.surface.borderFaint;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

interface FactionDropdownProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

const FactionDropdown = ({
  value,
  options,
  onChange,
}: FactionDropdownProps): React.ReactElement => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((o) => {
      return o.value === value;
    })?.label ??
    options[0]?.label ??
    '';

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      return document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => {
        return !prev;
      });
    }
  };

  return (
    <DropdownWrapper ref={wrapperRef}>
      <DropdownTrigger
        type="button"
        $open={open}
        onClick={() => {
          setOpen((prev) => {
            return !prev;
          });
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selectedLabel}
      </DropdownTrigger>
      {open && (
        <DropdownList role="listbox">
          {options.map((opt) => {
            return (
              <DropdownOption
                key={opt.value}
                $selected={opt.value === value}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </DropdownOption>
            );
          })}
        </DropdownList>
      )}
    </DropdownWrapper>
  );
};

// ── Panel ──────────────────────────────────────────────────────────────────────

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
  const [localNotes, setLocalNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (army) {
      setLocalName(army.name);
      setLocalComposition(army.composition);
      setLocalNotes(army.notes ?? '');
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

  const handleNotesBlur = useCallback(() => {
    if (!army) return;
    dispatch(updateArmy({ id: army.id, notes: localNotes }));
  }, [army, localNotes, dispatch]);

  const handleFactionChange = useCallback(
    (value: string) => {
      if (!army) return;
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
    setShowDeleteConfirm(true);
  }, [army]);

  const handleDeleteConfirm = useCallback(() => {
    if (!army) return;
    setShowDeleteConfirm(false);
    dispatch(deleteArmy(army.id));
    dispatch(deselectArmy());
  }, [army, dispatch]);

  const handleClose = useCallback(() => {
    if (isMoving) dispatch(stopMovingArmy());
    dispatch(deselectArmy());
  }, [isMoving, dispatch]);

  const factionOptions = [
    { value: '', label: t('armyPanel.factionNone') },
    ...factions.map((f) => {
      return { value: f.id, label: f.name };
    }),
  ];

  return (
    <>
      <ConfirmModal
        open={showDeleteConfirm}
        title={t('armyPanel.deleteArmy')}
        message={t('armyPanel.deleteConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          return setShowDeleteConfirm(false);
        }}
      />
      <SidePanel $open={isOpen} $gap="20px">
        <DragHandle $margin="0 auto -8px" />
        <PanelHeader
          title={t('armyPanel.title')}
          icon={<SwordsIcon aria-hidden />}
          onClose={handleClose}
        />

        {army && (
          <>
            <div>
              <SectionLabel>{t('armyPanel.name')}</SectionLabel>
              <StyledInput
                data-testid="army-name-input"
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

            {factions.length > 0 && (
              <div>
                <SectionLabel>{t('armyPanel.faction')}</SectionLabel>
                <FactionDropdown
                  value={army.factionId ?? ''}
                  options={factionOptions}
                  onChange={handleFactionChange}
                />
              </div>
            )}

            <ButtonGroup>
              <MoveBtn data-testid="move-army-btn" $active={isMoving} onClick={handleMoveToggle}>
                {isMoving ? (
                  <>
                    <CloseIcon {...BTN_ICON_PROPS} />
                    {t('armyPanel.cancelMove')}
                  </>
                ) : (
                  <>
                    <MoveArrowIcon {...BTN_ICON_PROPS} />
                    {t('armyPanel.moveArmy')}
                  </>
                )}
              </MoveBtn>
              <DangerButton data-testid="delete-army-btn" onClick={handleDelete}>
                <TrashIcon {...BTN_ICON_PROPS} />
                {t('armyPanel.deleteArmy')}
              </DangerButton>
            </ButtonGroup>

            {isMoving && <Hint>{t('armyPanel.moveHint')}</Hint>}

            <div>
              <SectionLabel>{t('armyPanel.composition')}</SectionLabel>
              <StyledTextarea
                value={localComposition}
                onChange={(e) => {
                  return setLocalComposition(e.target.value);
                }}
                onBlur={handleCompositionBlur}
                placeholder={t('armyPanel.compositionPlaceholder')}
              />
            </div>

            <div>
              <SectionLabel>{t('armyPanel.notes')}</SectionLabel>
              <StyledTextarea
                value={localNotes}
                onChange={(e) => {
                  return setLocalNotes(e.target.value);
                }}
                onBlur={handleNotesBlur}
                placeholder={t('armyPanel.notesPlaceholder')}
              />
            </div>
          </>
        )}
      </SidePanel>
    </>
  );
};

export default ArmyPanel;
