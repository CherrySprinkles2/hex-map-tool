import styled from 'styled-components';

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => {
    return theme.zIndex.modal;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => {
    return theme.surface.overlayHeavy;
  }};
`;

export const ModalOptionButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid
    ${({ $active, theme }) => {
      return $active ? theme.textMuted : 'transparent';
    }};
  background: ${({ $active, theme }) => {
    return $active ? theme.surface.hoverWeak : theme.surface.base;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
  font-weight: ${({ $active }) => {
    return $active ? '600' : '400';
  }};
  cursor: pointer;
  text-align: left;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
  }
`;

export const ModalCard = styled.div`
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  border-radius: 12px;
  padding: 20px 16px;
  width: min(320px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ModalTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 4px;
`;
