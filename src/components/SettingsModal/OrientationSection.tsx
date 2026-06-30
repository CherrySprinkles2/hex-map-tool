import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setOrientation } from '../../features/currentMap/currentMapSlice';
import { ModalOptionButton } from '../shared/modal';
import { SettingsSection, SettingsSectionHeading } from './SettingsSection';
import type { HexOrientation } from '../../types/domain';

const HexPreview = styled.svg`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
`;

export const OrientationSection = (): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const current = useAppSelector((state) => {
    return state.currentMap.orientation ?? 'pointy-top';
  });

  const select = (o: HexOrientation): void => {
    dispatch(setOrientation(o));
  };

  return (
    <SettingsSection data-testid="orientation-section">
      <SettingsSectionHeading>{t('settings.orientationHeading')}</SettingsSectionHeading>
      <ModalOptionButton
        data-testid="orientation-pointy-btn"
        $active={current === 'pointy-top'}
        onClick={() => {
          return select('pointy-top');
        }}
      >
        <HexPreview viewBox="0 0 70 70" aria-hidden>
          <polygon
            points="54,24 54,46 35,57 16,46 16,24 35,13"
            fill="currentColor"
            opacity="0.18"
            stroke="currentColor"
            strokeWidth="2"
          />
        </HexPreview>
        {t('orientation.pointyTop')}
      </ModalOptionButton>
      <ModalOptionButton
        data-testid="orientation-flat-btn"
        $active={current === 'flat-top'}
        onClick={() => {
          return select('flat-top');
        }}
      >
        <HexPreview viewBox="0 0 70 70" aria-hidden>
          <polygon
            points="57,35 46,54 24,54 13,35 24,16 46,16"
            fill="currentColor"
            opacity="0.18"
            stroke="currentColor"
            strokeWidth="2"
          />
        </HexPreview>
        {t('orientation.flatTop')}
      </ModalOptionButton>
    </SettingsSection>
  );
};
