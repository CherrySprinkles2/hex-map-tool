import React from 'react';
import styled from 'styled-components';
import { HexIcon } from '../../assets/icons/ui';

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  opacity: 0.45;
`;

const EmptyIcon = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  opacity: 0.45;
`;

const EmptyText = styled.p`
  font-size: 0.85rem;
  text-align: center;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  line-height: 1.5;
  margin: 0;
`;

interface PanelEmptyStateProps {
  text: string;
  icon?: React.ComponentType<{ width?: string; height?: string }>;
}

export const PanelEmptyState = ({
  text,
  icon = HexIcon,
}: PanelEmptyStateProps): React.ReactElement => {
  return (
    <EmptyState>
      <EmptyIcon as={icon} />
      <EmptyText>{text}</EmptyText>
    </EmptyState>
  );
};
