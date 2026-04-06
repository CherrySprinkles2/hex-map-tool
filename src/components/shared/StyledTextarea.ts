import styled from 'styled-components';

export const StyledTextarea = styled.textarea<{ $minHeight?: string }>`
  width: 100%;
  min-height: ${({ $minHeight }) => {
    return $minHeight ?? '130px';
  }};
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
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
    border-color: rgba(255, 255, 255, 0.35);
  }

  &::placeholder {
    color: ${({ theme }) => {
      return theme.textMuted;
    }};
  }
`;
