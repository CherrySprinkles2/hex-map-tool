import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { setActiveFaction, setMapMode } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

const Panel = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: ${({ $open }) => {
    return $open ? '0' : '-300px';
  }};
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
  transition: right 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: ${({ theme }) => {
    return theme.zIndex.panel;
  }};
  overflow-y: auto;

  @media (max-width: 600px) {
    top: auto;
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
  margin: 0 auto 8px;

  @media (max-width: 600px) {
    display: block;
  }
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 4px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
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
    ${({ $active, $color }) => {
      return $active ? ($color ?? 'rgba(255,255,255,0.4)') : 'transparent';
    }};
  background: ${({ $active, $color }) => {
    return $active ? ($color ? `${$color}22` : 'rgba(255,255,255,0.06)') : 'rgba(255,255,255,0.03)';
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
    background: ${({ $color }) => {
      return $color ? `${$color}18` : 'rgba(255,255,255,0.07)';
    }};
    border-color: ${({ $color }) => {
      return $color ?? 'rgba(255,255,255,0.2)';
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
  border: 1px solid rgba(255, 255, 255, 0.15);
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

const FactionPaintPanel = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const factions = useAppSelector((state) => {
    return state.factions;
  });
  const activeFactionId = useAppSelector((state) => {
    return state.ui.activeFactionId;
  });
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
  });

  const isOpen = mapMode === 'faction';

  return (
    <Panel $open={isOpen}>
      <DragHandle />
      <Header>
        <Title>{t('factionPaintPanel.title')}</Title>
        <CloseBtn
          onClick={() => {
            return dispatch(setMapMode('terrain'));
          }}
        >
          ✕
        </CloseBtn>
      </Header>
      <Hint>{isTouchDevice ? t('factionPaintPanel.hintTouch') : t('factionPaintPanel.hint')}</Hint>

      <FactionBtn
        $active={activeFactionId === null}
        $color={null}
        onClick={() => {
          return dispatch(setActiveFaction(null));
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
            $active={activeFactionId === faction.id}
            $color={faction.color}
            onClick={() => {
              return dispatch(setActiveFaction(faction.id));
            }}
          >
            <Swatch $color={faction.color} />
            {faction.name}
          </FactionBtn>
        );
      })}
    </Panel>
  );
};

export default FactionPaintPanel;
