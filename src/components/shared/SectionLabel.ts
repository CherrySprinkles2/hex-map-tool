import styled from 'styled-components';

export const SectionLabel = styled.div`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin-bottom: 4px;
`;
