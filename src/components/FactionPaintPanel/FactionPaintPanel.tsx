import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { setFactionBrush, setMapMode } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SidePanel } from '../shared/SidePanel';
import { DragHandle } from '../shared/DragHandle';
import { PanelHeader } from '../shared/PanelHeader';
import { FlagIcon } from '../../assets/icons/ui';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

const Hint = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin: 0 0 12px;
  line-height: 1.5;
`;

const FactionBtn = styled.button<{ $active: boolean; $color: string | null }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active, $color, theme }) => {
      return $active ? ($color ?? theme.surface.borderFocus) : 'transparent';
    }};
  background: ${({ $active, $color, theme }) => {
    return $active ? ($color ? `${$color}22` : theme.surface.hoverWeak) : theme.surface.subtle;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.875rem;
  font-weight: ${({ $active }) => {
    return $active ? '600' : '400';
  }};
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    background: ${({ $color, theme }) => {
      return $color ? `${$color}18` : theme.surface.hoverWeak;
    }};
    border-color: ${({ $color, theme }) => {
      return $color ?? theme.surface.borderMedium;
    }};
  }
`;

const Swatch = styled.span<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: ${({ $color }) => {
    return $color;
  }};
  flex-shrink: 0;
  border: 1px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
`;

const NoFactionDot = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px dashed
    ${({ theme }) => {
      return theme.textMuted;
    }};
  flex-shrink: 0;
`;

const Empty = styled.div`
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.82rem;
  text-align: center;
  padding: 16px 0;
  line-height: 1.6;
`;

interface FactionPaintPanelProps {
  suppressed: boolean;
}

const FactionPaintPanel = ({ suppressed }: FactionPaintPanelProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const factions = useAppSelector((state) => {
    return state.factions;
  });
  const activeFactionId = useAppSelector((state) => {
    return state.ui.activeFactionId;
  });
  const factionBrushActive = useAppSelector((state) => {
    return state.ui.factionBrushActive;
  });
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
  });

  const isOpen = mapMode === 'faction';

  return (
    <SidePanel $open={isOpen && !suppressed} $gap="8px">
      <DragHandle />
      <PanelHeader
        title={t('factionPaintPanel.title')}
        icon={<FlagIcon aria-hidden />}
        onClose={() => {
          return dispatch(setMapMode('terrain'));
        }}
        $marginBottom="4px"
      />
      <Hint>{isTouchDevice ? t('factionPaintPanel.hintTouch') : t('factionPaintPanel.hint')}</Hint>

      <FactionBtn
        $active={factionBrushActive && activeFactionId === null}
        $color={null}
        onClick={() => {
          return dispatch(setFactionBrush(null));
        }}
      >
        <NoFactionDot />
        {t('factionPaintPanel.unassigned')}
      </FactionBtn>

      {factions.length === 0 && (
        <Empty>
          {t('factionPaintPanel.noFactions')
            .split('\n')
            .map((line, i) => {
              return (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              );
            })}
        </Empty>
      )}

      {factions.map((faction) => {
        return (
          <FactionBtn
            key={faction.id}
            $active={factionBrushActive && activeFactionId === faction.id}
            $color={faction.color}
            onClick={() => {
              return dispatch(setFactionBrush(faction.id));
            }}
          >
            <Swatch $color={faction.color} />
            {faction.name}
          </FactionBtn>
        );
      })}
    </SidePanel>
  );
};

export default FactionPaintPanel;
