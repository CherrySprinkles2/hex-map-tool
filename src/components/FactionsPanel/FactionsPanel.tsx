import React, { useState, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { addFaction, deleteFaction, updateFaction } from '../../features/factions/factionsSlice';
import { closeFactionsPanel } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { Faction } from '../../types/domain';

const Panel = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: ${({ $open }) => {
    return $open ? '0' : '-320px';
  }};
  width: 300px;
  height: 100vh;
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-left: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  padding: 24px 16px;
  transition: right 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 0;
  z-index: ${({ theme }) => {
    return theme.zIndex.panel;
  }};
  overflow-y: auto;

  @media (max-width: 600px) {
    top: auto;
    right: 0;
    bottom: ${({ $open }) => {
      return $open ? '0' : '-70vh';
    }};
    width: 100%;
    height: 70vh;
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
  margin: 0 auto 12px;

  @media (max-width: 600px) {
    display: block;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
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
  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const FactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const FactionCard = styled.div<{ $color: string }>`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  border-left: 4px solid
    ${({ $color }) => {
      return $color;
    }};
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NameInput = styled.input`
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  background: transparent;
  border: none;
  border-bottom: 1.5px solid transparent;
  padding: 2px 4px;
  outline: none;
  min-width: 0;
  &:hover,
  &:focus {
    border-bottom-color: ${({ theme }) => {
      return theme.textMuted;
    }};
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 4px;
  flex-shrink: 0;
  &:hover {
    color: ${({ theme }) => {
      return theme.accent;
    }};
  }
`;

const SectionLabel = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin-bottom: 4px;
`;

const SwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Swatch = styled.button<{ $active: boolean; $color: string }>`
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 2px solid
    ${({ $active }) => {
      return $active ? '#fff' : 'transparent';
    }};
  background: ${({ $color }) => {
    return $color;
  }};
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  outline: none;
  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const DescInput = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  font-size: 0.78rem;
  color: ${({ theme }) => {
    return theme.text;
  }};
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  border-radius: 4px;
  padding: 6px 8px;
  resize: vertical;
  min-height: 52px;
  outline: none;
  font-family: inherit;
  line-height: 1.4;
  &:focus {
    border-color: ${({ theme }) => {
      return theme.textMuted;
    }};
  }
`;

const AddBtn = styled.button`
  margin-top: 16px;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1.5px dashed
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.82rem;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition:
    border-color 0.15s,
    color 0.15s;
  &:hover {
    border-color: ${({ theme }) => {
      return theme.textMuted;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const Empty = styled.div`
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.82rem;
  text-align: center;
  padding: 24px 0 8px;
`;

interface FactionItemProps {
  faction: Faction;
}

const FactionItem = ({ faction }: FactionItemProps): React.ReactElement => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [localName, setLocalName] = useState(faction.name);
  const [localDesc, setLocalDesc] = useState(faction.description);

  const commitName = useCallback(() => {
    const trimmed = localName.trim() || 'New Faction';
    setLocalName(trimmed);
    dispatch(updateFaction({ id: faction.id, name: trimmed }));
  }, [dispatch, faction.id, localName]);

  const commitDesc = useCallback(() => {
    dispatch(updateFaction({ id: faction.id, description: localDesc }));
  }, [dispatch, faction.id, localDesc]);

  return (
    <FactionCard $color={faction.color}>
      <CardRow>
        <NameInput
          value={localName}
          onChange={(e) => {
            return setLocalName(e.target.value);
          }}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          maxLength={48}
        />
        <DeleteBtn
          onClick={() => {
            return dispatch(deleteFaction(faction.id));
          }}
          title="Delete faction"
        >
          ✕
        </DeleteBtn>
      </CardRow>

      <div>
        <SectionLabel>{t('factionsPanel.colour')}</SectionLabel>
        <SwatchRow>
          {theme.factionColors.map((c) => {
            return (
              <Swatch
                key={c}
                $color={c}
                $active={faction.color === c}
                onClick={() => {
                  return dispatch(updateFaction({ id: faction.id, color: c }));
                }}
                title={c}
              />
            );
          })}
        </SwatchRow>
      </div>

      <div>
        <SectionLabel>{t('factionsPanel.description')}</SectionLabel>
        <DescInput
          value={localDesc}
          onChange={(e) => {
            return setLocalDesc(e.target.value);
          }}
          onBlur={commitDesc}
          placeholder={t('factionsPanel.descriptionPlaceholder')}
          maxLength={500}
        />
      </div>
    </FactionCard>
  );
};

const FactionsPanel = (): React.ReactElement => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const factions = useAppSelector((state) => {
    return state.factions;
  });
  const isOpen = useAppSelector((state) => {
    return state.ui.factionsOpen;
  });

  const handleAdd = () => {
    const usedColors = new Set(
      factions.map((f) => {
        return f.color;
      })
    );
    const nextColor =
      theme.factionColors.find((c) => {
        return !usedColors.has(c);
      }) ?? theme.factionColors[0];
    dispatch(addFaction({ color: nextColor }));
  };

  return (
    <Panel $open={isOpen}>
      <DragHandle />
      <Header>
        <Title>{t('factionsPanel.title')}</Title>
        <CloseBtn
          onClick={() => {
            return dispatch(closeFactionsPanel());
          }}
        >
          ✕
        </CloseBtn>
      </Header>

      <FactionList>
        {factions.length === 0 && <Empty>{t('factionsPanel.noFactions')}</Empty>}
        {factions.map((faction) => {
          return <FactionItem key={faction.id} faction={faction} />;
        })}
      </FactionList>

      <AddBtn onClick={handleAdd}>{t('factionsPanel.addFaction')}</AddBtn>
    </Panel>
  );
};

export default FactionsPanel;
