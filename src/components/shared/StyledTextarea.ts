import styled from 'styled-components';

export const StyledTextarea = styled.textarea<{ $minHeight?: string }>`
  width: 100%;
  min-height: ${({ $minHeight }) => {
    return $minHeight ?? '130px';
  }};
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.active;
    }};
  background: ${({ theme }) => {
    return theme.surface.card;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.875rem;
  line-height: 1.5;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  font-family: inherit;
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
