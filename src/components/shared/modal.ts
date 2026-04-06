import styled from 'styled-components';

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
