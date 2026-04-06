import styled from 'styled-components';

export const SettingsButton = styled.button<{ $active: boolean }>`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ $active, theme }) => {
    return $active ? theme.panelBorder : 'transparent';
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
  line-height: 1;
  flex-shrink: 0;
  &:hover {
    background: ${({ theme }) => {
      return theme.panelBorder;
    }};
  }
`;
