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
`;

interface PanelHeaderProps {
  title: string;
  onClose: () => void;
  closeVariant?: 'simple' | 'bordered';
  $marginBottom?: string;
}

export const PanelHeader = ({
  title,
  onClose,
  closeVariant = 'simple',
  $marginBottom,
}: PanelHeaderProps): React.ReactElement => {
  return (
    <HeaderRow $marginBottom={$marginBottom}>
      <Title>{title}</Title>
      <CloseButton onClick={onClose} variant={closeVariant} />
    </HeaderRow>
  );
};
