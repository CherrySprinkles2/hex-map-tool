import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { setMapMode } from '../../features/ui/uiSlice';

// On desktop, the terrain/faction panel is always visible — keep the toggle clear of it
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);

  @media (min-width: 601px) {
    right: ${PANEL_OFFSET};
  }
`;

const ModeBtn = styled.button`
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

  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const MapModeToggle = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const mapMode = useSelector((state) => {
    return state.ui.mapMode;
  });

  return (
    <Toggle>
      <ModeBtn
        $active={mapMode === 'terrain'}
        onClick={() => {
          return dispatch(setMapMode('terrain'));
        }}
      >
        {t('mapModeToggle.terrain')}
      </ModeBtn>
      <ModeBtn
        $active={mapMode === 'faction'}
        onClick={() => {
          return dispatch(setMapMode('faction'));
        }}
      >
        {t('mapModeToggle.faction')}
      </ModeBtn>
    </Toggle>
  );
};

export default MapModeToggle;
