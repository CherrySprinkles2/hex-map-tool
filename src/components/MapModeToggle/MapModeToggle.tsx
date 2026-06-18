import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { setOverlay } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MapIcon, FlagIcon, SwordsIcon, LeafIcon, NoteIcon } from '../../assets/icons/ui';
import type { Overlay } from '../../types/state';

const PANEL_OFFSET = '300px';

type OverlayLabelKey = `overlayPanel.${Overlay}`;

type OverlayDef = {
  id: Overlay;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  labelKey: OverlayLabelKey;
};

const OVERLAYS: OverlayDef[] = [
  { id: 'terrain', Icon: MapIcon, labelKey: 'overlayPanel.terrain' },
  { id: 'faction', Icon: FlagIcon, labelKey: 'overlayPanel.faction' },
  { id: 'army', Icon: SwordsIcon, labelKey: 'overlayPanel.army' },
  { id: 'forage', Icon: LeafIcon, labelKey: 'overlayPanel.forage' },
  { id: 'notes', Icon: NoteIcon, labelKey: 'overlayPanel.notes' },
];

const Panel = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: ${({ theme }) => {
    return theme.zIndex.toggle;
  }};
  display: flex;
  flex-direction: column;
  border-radius: 16px;
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

const List = styled.div<{ $expanded: boolean }>`
  display: ${({ $expanded }) => {
    return $expanded ? 'flex' : 'none';
  }};
  flex-direction: column;

  @media (min-width: 601px) {
    display: flex;
  }
`;

const OverlayBtn = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
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
  text-align: left;

  & > svg {
    width: 1.05em;
    height: 1.05em;
    flex-shrink: 0;
  }

  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

// Mobile-only header: shows the active overlay and toggles the list open/closed.
const CollapsedToggle = styled(OverlayBtn)`
  @media (min-width: 601px) {
    display: none;
  }
`;

const MapModeToggle = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const overlay = useAppSelector((state) => {
    return state.ui.overlay;
  });
  const [expanded, setExpanded] = useState(false);

  const active = OVERLAYS.find((o) => {
    return o.id === overlay;
  })!;
  const ActiveIcon = active.Icon;

  const handlePick = (id: Overlay) => {
    dispatch(setOverlay(id));
    setExpanded(false);
  };

  return (
    <Panel>
      <CollapsedToggle
        $active
        aria-expanded={expanded}
        data-testid="overlay-panel-toggle"
        onClick={() => {
          return setExpanded((v) => {
            return !v;
          });
        }}
      >
        <ActiveIcon aria-hidden />
        {t(active.labelKey)}
      </CollapsedToggle>
      <List $expanded={expanded}>
        {OVERLAYS.map(({ id, Icon, labelKey }) => {
          return (
            <OverlayBtn
              key={id}
              $active={overlay === id}
              data-testid={`map-mode-${id}`}
              onClick={() => {
                return handlePick(id);
              }}
            >
              <Icon aria-hidden />
              {t(labelKey)}
            </OverlayBtn>
          );
        })}
      </List>
    </Panel>
  );
};

export default MapModeToggle;
