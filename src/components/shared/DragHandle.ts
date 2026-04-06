import styled from 'styled-components';

export const DragHandle = styled.div<{ $margin?: string }>`
  display: none;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => {
    return theme.panelBorder;
  }};
  margin: ${({ $margin }) => {
    return $margin ?? '0 auto 8px';
  }};

  @media (max-width: 600px) {
    display: block;
  }
`;
