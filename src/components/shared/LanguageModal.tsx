import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { ModalCard, ModalTitle, ModalOptionButton } from './modal';

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
        <ModalOptionButton
          $active={currentLang === 'en'}
          onClick={() => {
            return select('en');
          }}
        >
          🇬🇧 English
        </ModalOptionButton>
        <ModalOptionButton
          $active={currentLang === 'fi'}
          onClick={() => {
            return select('fi');
          }}
        >
          🇫🇮 Suomi
        </ModalOptionButton>
      </ModalCard>
    </ModalBackdrop>
  );
};
