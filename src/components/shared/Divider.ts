import styled from 'styled-components';

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
`;
