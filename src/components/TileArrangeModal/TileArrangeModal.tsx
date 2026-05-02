import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import TileArrangeCanvas from './TileArrangeCanvas';
import type { Tile, Army, Faction } from '../../types/domain';

const DESKTOP_MQ = '(min-width: 601px)';
const CANVAS_SIZE_MOBILE = 380;
const CANVAS_SIZE_DESKTOP = 760;

interface Props {
  tile: Tile;
  armies: Army[];
  factions: Faction[];
  onClose: () => void;
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: ${({ theme }) => {
    return theme.zIndex.modal;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  border-radius: 12px;
  padding: 20px;
  width: min(430px, 94vw);
  display: flex;
  flex-direction: column;
  gap: 14px;
  @media (max-width: 600px) {
    position: fixed;
    inset: 0;
    width: auto;
    border-radius: 0;
    padding: 12px;
    overflow-y: auto;
  }
  @media ${DESKTOP_MQ} {
    width: min(820px, 94vw);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${({ theme }) => {
    return theme.text;
  }};
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  line-height: 1;
  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const TileArrangeModal = ({ tile, armies, factions, onClose }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [canvasSize, setCanvasSize] = useState<number>(() => {
    return window.matchMedia(DESKTOP_MQ).matches ? CANVAS_SIZE_DESKTOP : CANVAS_SIZE_MOBILE;
  });

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const handler = (e: MediaQueryListEvent): void => {
      setCanvasSize(e.matches ? CANVAS_SIZE_DESKTOP : CANVAS_SIZE_MOBILE);
    };
    mq.addEventListener('change', handler);
    return () => {
      mq.removeEventListener('change', handler);
    };
  }, []);

  return ReactDOM.createPortal(
    <Backdrop
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('tilePanel.arrangeArmies')}
    >
      <Card
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Header>
          <Title>{t('tilePanel.arrangeArmies')}</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            ✕
          </CloseBtn>
        </Header>
        <TileArrangeCanvas
          tile={tile}
          armies={armies}
          factions={factions}
          canvasSize={canvasSize}
        />
      </Card>
    </Backdrop>,
    document.body
  );
};

export default TileArrangeModal;
