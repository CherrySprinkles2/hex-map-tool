import React from 'react';
import styled from 'styled-components';
import { CloseButton } from './CloseButton';

const HeaderRow = styled.div<{ $marginBottom?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ $marginBottom }) => {
    return $marginBottom ?? '0';
  }};
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.4em;

  & > svg {
    width: 1em;
    height: 1em;
    flex-shrink: 0;
  }
`;

interface PanelHeaderProps {
  title: string;
  onClose: () => void;
  icon?: React.ReactNode;
  closeVariant?: 'simple' | 'bordered';
  $marginBottom?: string;
}

export const PanelHeader = ({
  title,
  onClose,
  icon,
  closeVariant = 'simple',
  $marginBottom,
}: PanelHeaderProps): React.ReactElement => {
  return (
    <HeaderRow $marginBottom={$marginBottom}>
      <Title>
        {icon}
        {title}
      </Title>
      <CloseButton onClick={onClose} variant={closeVariant} />
    </HeaderRow>
  );
};
