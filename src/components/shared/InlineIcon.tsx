import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  color: inherit;

  & > svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  children: React.ReactNode;
};

export const InlineIcon = ({ children, ...rest }: Props): React.ReactElement => {
  return <Wrapper {...rest}>{children}</Wrapper>;
};
