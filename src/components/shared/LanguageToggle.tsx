import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../hooks/useLanguage';

const Toggle = styled.div`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    border-radius: 6px;
    border: 1.5px solid
      ${({ theme }) => {
        return theme.panelBorder;
      }};
    overflow: hidden;
    flex-shrink: 0;
  }
`;

const LangBtn = styled.button<{ $active: boolean }>`
  padding: 5px 10px;
  border: none;
  background: ${({ $active, theme }) => {
    return $active ? theme.panelBorder : 'transparent';
  }};
  color: ${({ $active, theme }) => {
    return $active ? theme.text : theme.textMuted;
  }};
  font-size: 0.75rem;
  font-weight: ${({ $active }) => {
    return $active ? '700' : '400';
  }};
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
    background: ${({ $active, theme }) => {
      return $active ? theme.panelBorder : theme.surface.hoverWeak;
    }};
  }
`;

interface LanguageToggleProps {
  onAfterSelect?: () => void;
}

export const LanguageToggle = ({ onAfterSelect }: LanguageToggleProps): React.ReactElement => {
  const { currentLang, handleLanguageSelect } = useLanguage();

  const select = (lang: string) => {
    handleLanguageSelect(lang);
    onAfterSelect?.();
  };

  return (
    <Toggle aria-label="Language">
      <LangBtn
        $active={currentLang === 'en'}
        onClick={() => {
          return select('en');
        }}
      >
        EN
      </LangBtn>
      <LangBtn
        $active={currentLang === 'fi'}
        onClick={() => {
          return select('fi');
        }}
      >
        FI
      </LangBtn>
    </Toggle>
  );
};
