import React from 'react';
import styled from 'styled-components';
import { CloseIcon } from '../../assets/icons/ui';

type Variant = 'simple' | 'bordered';

const desktopHiddenCss = `
  @media (min-width: 601px) {
    display: none;
  }
`;

const SimpleBtn = styled.button<{ $desktopHidden?: boolean }>`
  background: none;
  border: none;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
  ${({ $desktopHidden }) => {
    return $desktopHidden ? desktopHiddenCss : '';
  }}
`;

const BorderedBtn = styled.button<{ $desktopHidden?: boolean }>`
  padding: 4px 8px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.panelBorder;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
  ${({ $desktopHidden }) => {
    return $desktopHidden ? desktopHiddenCss : '';
  }}
`;

interface CloseButtonProps {
  onClick: () => void;
  variant?: Variant;
  title?: string;
  'aria-label'?: string;
  /** Hide the button on desktop (≥601px); used by always-visible side panels. */
  desktopHidden?: boolean;
}

export const CloseButton = ({
  onClick,
  variant = 'simple',
  title,
  'aria-label': ariaLabel,
  desktopHidden,
}: CloseButtonProps): React.ReactElement => {
  const Btn = variant === 'bordered' ? BorderedBtn : SimpleBtn;
  return (
    <Btn onClick={onClick} title={title} aria-label={ariaLabel} $desktopHidden={desktopHidden}>
      <CloseIcon width="1em" height="1em" aria-hidden />
    </Btn>
  );
};
