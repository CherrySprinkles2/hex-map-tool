import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { ModalCard, ModalTitle } from './modal';

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

  @media (min-width: 601px) {
    display: none;
  }
`;

const LangOption = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
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

interface LanguageModalProps {
  open: boolean;
  onClose: () => void;
  onAfterSelect?: () => void;
}

export const LanguageModal = ({
  open,
  onClose,
  onAfterSelect,
}: LanguageModalProps): React.ReactElement => {
  const { t } = useTranslation();
  const { currentLang, handleLanguageSelect } = useLanguage();

  const select = (lang: string) => {
    handleLanguageSelect(lang);
    onClose();
    onAfterSelect?.();
  };

  return (
    <ModalBackdrop $open={open} onClick={onClose}>
      <ModalCard
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <ModalTitle>{t('toolbar.languageLabel')}</ModalTitle>
        <LangOption
          $active={currentLang === 'en'}
          onClick={() => {
            return select('en');
          }}
        >
          🇬🇧 English
        </LangOption>
        <LangOption
          $active={currentLang === 'fi'}
          onClick={() => {
            return select('fi');
          }}
        >
          🇫🇮 Suomi
        </LangOption>
      </ModalCard>
    </ModalBackdrop>
  );
};
