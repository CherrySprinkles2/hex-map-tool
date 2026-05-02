import styled from 'styled-components';

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;

  && > * {
    border-radius: 0;
  }
  && > *:first-child {
    border-radius: 8px 8px 0 0;
  }
  && > *:last-child {
    border-radius: 0 0 8px 8px;
  }
  && > *:first-child:last-child {
    border-radius: 8px;
  }
  && > * + * {
    margin-top: -2px;
  }
`;
