import styled from 'styled-components';

/** A titled block inside the Settings modal. Sections stack vertically with dividers. */
export const SettingsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0 14px;
  border-bottom: 1px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 4px;
  }
`;

export const SettingsSectionHeading = styled.h4`
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin: 0;
`;
