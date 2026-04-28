import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { setMapMode } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MapIcon, FlagIcon, SwordsIcon } from '../../assets/icons/ui';

const PANEL_OFFSET = '300px';

const Toggle = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: ${({ theme }) => {
    return theme.zIndex.toggle;
  }};
  display: flex;
  border-radius: 24px;
  border: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  overflow: hidden;
  box-shadow: 0 4px 16px
    ${({ theme }) => {
      return theme.surface.overlayMedium;
    }};

  @media (min-width: 601px) {
    right: ${PANEL_OFFSET};
  }
`;

const ModeBtn = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: ${({ $active, theme }) => {
    return $active ? theme.panelBorder : 'transparent';
  }};
  color: ${({ $active, theme }) => {
    return $active ? theme.text : theme.textMuted;
  }};
  font-size: 0.78rem;
  font-weight: ${({ $active }) => {
    return $active ? '600' : '400';
  }};
  letter-spacing: 0.05em;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  white-space: nowrap;

  & > svg {
    width: 1em;
    height: 1em;
    flex-shrink: 0;
  }

  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const MapModeToggle = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
  });

  return (
    <Toggle>
      <ModeBtn
        $active={mapMode === 'terrain'}
        data-testid="map-mode-terrain"
        onClick={() => {
          return dispatch(setMapMode('terrain'));
        }}
      >
        <MapIcon aria-hidden />
        {t('mapModeToggle.terrain')}
      </ModeBtn>
      <ModeBtn
        $active={mapMode === 'faction'}
        data-testid="map-mode-faction"
        onClick={() => {
          return dispatch(setMapMode('faction'));
        }}
      >
        <FlagIcon aria-hidden />
        {t('mapModeToggle.faction')}
      </ModeBtn>
      <ModeBtn
        $active={mapMode === 'army'}
        data-testid="map-mode-army"
        onClick={() => {
          return dispatch(setMapMode('army'));
        }}
      >
        <SwordsIcon aria-hidden />
        {t('mapModeToggle.army')}
      </ModeBtn>
    </Toggle>
  );
};

export default MapModeToggle;
