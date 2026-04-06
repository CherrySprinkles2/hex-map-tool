import React from 'react';
import styled from 'styled-components';

type Variant = 'simple' | 'bordered';

const SimpleBtn = styled.button`
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
  &:hover {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const BorderedBtn = styled.button`
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
`;

interface CloseButtonProps {
  onClick: () => void;
  variant?: Variant;
  title?: string;
  'aria-label'?: string;
}

export const CloseButton = ({
  onClick,
  variant = 'simple',
  title,
  'aria-label': ariaLabel,
}: CloseButtonProps): React.ReactElement => {
  if (variant === 'bordered') {
    return (
      <BorderedBtn onClick={onClick} title={title} aria-label={ariaLabel}>
        ×
      </BorderedBtn>
    );
  }
  return (
    <SimpleBtn onClick={onClick} title={title} aria-label={ariaLabel}>
      ×
    </SimpleBtn>
  );
};
