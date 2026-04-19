import styled from 'styled-components';

export const Backdrop = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => {
    return $open ? 'block' : 'none';
  }};
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => {
    return theme.zIndex.backdrop;
  }};
`;

export const SheetItem = styled.button<{ $active?: boolean; $desktopHide?: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 24px;
  background: ${({ $active, theme }) => {
    return $active ? theme.surface.hoverWeak : 'transparent';
  }};
  border: none;
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
  letter-spacing: 0.02em;

  &:hover {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
  }

  @media (min-width: 601px) {
    padding: 10px 20px;
    font-size: 0.85rem;
    display: ${({ $desktopHide }) => {
      return $desktopHide ? 'none' : 'flex';
    }};
  }
`;

export const SheetIcon = styled.span`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};

  & > svg {
    width: 20px;
    height: 20px;
  }
`;
