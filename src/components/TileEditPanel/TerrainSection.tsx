import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  enterTerrainPaint,
  exitTerrainPaint,
  setActivePaintBrush,
} from '../../features/ui/uiSlice';
import { updateTile } from '../../features/tiles/tilesSlice';
import { theme } from '../../styles/theme';
import useTerrainList from '../../hooks/useTerrainList';
import type { TerrainType } from '../../types/domain';
import { SectionLabel } from '../shared/SectionLabel';
import { Divider } from '../shared/Divider';
import { BrushIcon, CloseIcon } from '../../assets/icons/ui';

const BTN_ICON_PROPS = {
  width: '1em',
  height: '1em',
  style: { marginRight: '0.4em', flexShrink: 0 },
  'aria-hidden': true,
} as const;

const TerrainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const TerrainBtn = styled.button<{ $active: boolean; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active, $color, theme: t }) => {
      return $active
        ? `color-mix(in srgb, ${$color} ${t.terrainButtonMix.activePercent}%, white)`
        : 'transparent';
    }};
  background: ${({ $color }) => {
    return $color;
  }}33;
  color: ${({ theme: t }) => {
    return t.text;
  }};
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    border-color: ${({ $color, theme: t }) => {
      return `color-mix(in srgb, ${$color} ${t.terrainButtonMix.hoverPercent}%, white)`;
    }};
    background: ${({ $color }) => {
      return $color;
    }}55;
  }

  &:focus-visible {
    outline: 3px solid
      ${({ $color, theme: t }) => {
        return `color-mix(in srgb, ${$color} ${t.terrainButtonMix.focusPercent}%, white)`;
      }};
    outline-offset: 2px;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    filter: brightness(0) invert(1);
    opacity: 0.85;
  }
  span.label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const PaintModeBtn = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme: t }) => {
      return t.ui.paintMode;
    }}66;
  background: ${({ theme: t }) => {
    return t.ui.paintMode;
  }}0f;
  color: ${({ theme: t }) => {
    return t.text;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: t }) => {
      return t.ui.paintMode;
    }}26;
    border-color: ${({ theme: t }) => {
      return t.ui.paintMode;
    }}b3;
  }
`;

const PaintModeHeader = styled.div`
  position: relative;
`;

const PaintModeTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme: t }) => {
    return t.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ExitPaintBtn = styled.button`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme: t }) => {
      return t.surface.borderMedium;
    }};
  background: ${({ theme: t }) => {
    return t.surface.card;
  }};
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  cursor: pointer;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  &:hover {
    background: ${({ theme: t }) => {
      return t.surface.borderFaint;
    }};
    border-color: ${({ theme: t }) => {
      return t.surface.borderFocus;
    }};
    color: ${({ theme: t }) => {
      return t.text;
    }};
  }
`;

const FeatureBrushRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeatureBrushLabel = styled.span`
  flex: 0 0 72px;
  font-size: 0.85rem;
  color: ${({ theme: t }) => {
    return t.text;
  }};
`;

const FeatureBrushBtnGroup = styled.div`
  display: flex;
  gap: 6px;
  flex: 1;
`;

const FeatureBrushBtn = styled.button<{ $active: boolean; $color: string }>`
  flex: 1;
  padding: 8px 6px;
  border-radius: 7px;
  border: 2px solid
    ${({ $active, $color }) => {
      return $active ? $color : theme.surface.borderFaint;
    }};
  background: ${({ $active, $color }) => {
    return $active ? `${$color}22` : theme.surface.base;
  }};
  color: ${({ theme: t }) => {
    return t.text;
  }};
  cursor: pointer;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;
  &:hover {
    border-color: ${({ $color }) => {
      return $color;
    }}77;
  }
  &:focus-visible {
    outline: 2px solid
      ${({ $color }) => {
        return $color;
      }};
    outline-offset: 2px;
  }
`;

const TerrainSection = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const terrainList = useTerrainList();
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
  });
  const activePaintBrush = useAppSelector((state) => {
    return state.ui.activePaintBrush;
  });
  const tile = useAppSelector((state) => {
    const key = state.ui.selectedTile;
    return key ? (state.tiles[key] ?? null) : null;
  });

  const isPaint = mapMode === 'terrain-paint';

  const terrainGrid = (
    <TerrainGrid>
      {terrainList.map(({ id, color, Icon: TerrainIcon, iconUrl, name }) => {
        const isActive = isPaint ? activePaintBrush === id : tile?.terrain === id;
        return (
          <TerrainBtn
            key={id}
            data-testid={isPaint ? `paint-brush-${id}` : `terrain-btn-${id}`}
            $active={isActive}
            $color={color}
            onClick={() => {
              if (isPaint) {
                dispatch(setActivePaintBrush(activePaintBrush === id ? null : id));
              } else {
                if (!tile) return;
                dispatch(updateTile({ q: tile.q, r: tile.r, terrain: id as TerrainType }));
              }
            }}
          >
            {TerrainIcon ? (
              <TerrainIcon className="icon" />
            ) : iconUrl ? (
              <img className="icon" src={iconUrl} alt="" aria-hidden />
            ) : (
              <span
                className="icon"
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  background: color,
                  borderRadius: '3px',
                  display: 'block',
                }}
              />
            )}
            <span className="label">
              {t(`terrain.${id}` as `terrain.${TerrainType}`, { defaultValue: name })}
            </span>
          </TerrainBtn>
        );
      })}
    </TerrainGrid>
  );

  if (isPaint) {
    return (
      <>
        <PaintModeHeader>
          <PaintModeTitle>
            <BrushIcon
              width="1em"
              height="1em"
              style={{ marginRight: '0.4em', verticalAlign: '-0.15em' }}
              aria-hidden
            />
            {t('tilePanel.paintMode')}
          </PaintModeTitle>
          <ExitPaintBtn
            data-testid="exit-paint-btn"
            onClick={() => {
              return dispatch(exitTerrainPaint());
            }}
          >
            <CloseIcon {...BTN_ICON_PROPS} />
            {t('tilePanel.exitPaint')}
          </ExitPaintBtn>
        </PaintModeHeader>

        <div>
          <SectionLabel>{t('tilePanel.terrain')}</SectionLabel>
          {terrainGrid}
        </div>

        <Divider />

        <div>
          <SectionLabel>{t('tilePanel.features')}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <FeatureBrushRow>
              <FeatureBrushLabel>
                <theme.icons.features.river
                  style={{
                    width: '1rem',
                    height: '1rem',
                    verticalAlign: 'middle',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.85,
                  }}
                />{' '}
                {t('features.river')}
              </FeatureBrushLabel>
              <FeatureBrushBtnGroup>
                <FeatureBrushBtn
                  $active={activePaintBrush === 'river-on'}
                  $color={theme.river.color}
                  onClick={() => {
                    return dispatch(
                      setActivePaintBrush(activePaintBrush === 'river-on' ? null : 'river-on')
                    );
                  }}
                >
                  {t('tilePanel.riverAdd')}
                </FeatureBrushBtn>
                <FeatureBrushBtn
                  $active={activePaintBrush === 'river-off'}
                  $color={theme.textMuted}
                  onClick={() => {
                    return dispatch(
                      setActivePaintBrush(activePaintBrush === 'river-off' ? null : 'river-off')
                    );
                  }}
                >
                  {t('tilePanel.riverRemove')}
                </FeatureBrushBtn>
              </FeatureBrushBtnGroup>
            </FeatureBrushRow>
            <FeatureBrushRow>
              <FeatureBrushLabel>
                <theme.icons.features.road
                  style={{
                    width: '1rem',
                    height: '1rem',
                    verticalAlign: 'middle',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.85,
                  }}
                />{' '}
                {t('features.road')}
              </FeatureBrushLabel>
              <FeatureBrushBtnGroup>
                <FeatureBrushBtn
                  $active={activePaintBrush === 'road-on'}
                  $color={theme.road.color}
                  onClick={() => {
                    return dispatch(
                      setActivePaintBrush(activePaintBrush === 'road-on' ? null : 'road-on')
                    );
                  }}
                >
                  {t('tilePanel.roadAdd')}
                </FeatureBrushBtn>
                <FeatureBrushBtn
                  $active={activePaintBrush === 'road-off'}
                  $color={theme.textMuted}
                  onClick={() => {
                    return dispatch(
                      setActivePaintBrush(activePaintBrush === 'road-off' ? null : 'road-off')
                    );
                  }}
                >
                  {t('tilePanel.roadRemove')}
                </FeatureBrushBtn>
              </FeatureBrushBtnGroup>
            </FeatureBrushRow>
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <SectionLabel>{t('tilePanel.terrain')}</SectionLabel>
      {terrainGrid}
      <PaintModeBtn
        data-testid="paint-terrain-btn"
        style={{ marginTop: '10px' }}
        onClick={() => {
          return dispatch(enterTerrainPaint(null));
        }}
      >
        <BrushIcon {...BTN_ICON_PROPS} />
        {t('tilePanel.paintTerrain')}
      </PaintModeBtn>
    </div>
  );
};

export default TerrainSection;
