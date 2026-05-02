import styled from 'styled-components';

export const StyledInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
  background: ${({ theme }) => {
    return theme.surface.card;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => {
      return theme.surface.borderFocus;
    }};
  }

  &::placeholder {
    color: ${({ theme }) => {
      return theme.textMuted;
    }};
  }
`;
