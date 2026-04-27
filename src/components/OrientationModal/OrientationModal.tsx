import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setOrientation } from '../../features/currentMap/currentMapSlice';
import { ModalCard, ModalTitle } from '../shared/modal';
import type { HexOrientation } from '../../types/domain';

const ModalBackdrop = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => {
    return $open ? 'flex' : 'none';
  }};
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => {
    return theme.zIndex.langModal;
  }};
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => {
    return theme.surface.overlayHeavy;
  }};
`;

const OptionBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active, theme }) => {
      return $active ? theme.textMuted : 'transparent';
    }};
  background: ${({ $active, theme }) => {
    return $active ? theme.surface.hoverWeak : theme.surface.base;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  font-weight: ${({ $active }) => {
    return $active ? '600' : '400';
  }};
  cursor: pointer;
  text-align: left;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
  }
`;

const HexPreview = styled.svg`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
`;

interface OrientationModalProps {
  open: boolean;
  onClose: () => void;
}

export const OrientationModal = ({ open, onClose }: OrientationModalProps): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const current = useAppSelector((state) => {
    return state.currentMap.orientation ?? 'pointy-top';
  });

  const select = (o: HexOrientation) => {
    dispatch(setOrientation(o));
    onClose();
  };

  return (
    <ModalBackdrop $open={open} onClick={onClose}>
      <ModalCard
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <ModalTitle>{t('orientation.title')}</ModalTitle>
        <OptionBtn
          $active={current === 'pointy-top'}
          onClick={() => {
            return select('pointy-top');
          }}
        >
          <HexPreview viewBox="0 0 70 70" aria-hidden>
            <polygon
              points="54,24 54,46 35,57 16,46 16,24 35,13"
              fill="currentColor"
              opacity="0.18"
              stroke="currentColor"
              strokeWidth="2"
            />
          </HexPreview>
          {t('orientation.pointyTop')}
        </OptionBtn>
        <OptionBtn
          $active={current === 'flat-top'}
          onClick={() => {
            return select('flat-top');
          }}
        >
          <HexPreview viewBox="0 0 70 70" aria-hidden>
            <polygon
              points="57,35 46,54 24,54 13,35 24,16 46,16"
              fill="currentColor"
              opacity="0.18"
              stroke="currentColor"
              strokeWidth="2"
            />
          </HexPreview>
          {t('orientation.flatTop')}
        </OptionBtn>
      </ModalCard>
    </ModalBackdrop>
  );
};
