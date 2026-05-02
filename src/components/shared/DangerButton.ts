import styled from 'styled-components';

export const DangerButton = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.accent;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.accent;
  }};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => {
      return `${theme.accent}22`;
    }};
  }
`;
