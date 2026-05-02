import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { CloseIcon } from '../../assets/icons/ui';
import PatternSwatch from './PatternSwatch';
import type { PatternKey } from '../../types/domain';

export interface FormState {
  name: string;
  color: string;
  patternKey: PatternKey;
  isDeepWater: boolean;
  icon: string;
}

const PATTERN_OPTIONS: PatternKey[] = [
  'grass',
  'farm',
  'forest',
  'mountain',
  'lake',
  'ocean',
  'desert',
  'swamp',
  'jungle',
  'hills',
  'badlands',
  'none',
];

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 0.8rem;
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  width: 90px;
  flex-shrink: 0;
`;

const FormInput = styled.input`
  flex: 1;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid
    ${({ theme: t }) => {
      return t.panelBorder;
    }};
  background: ${({ theme: t }) => {
    return t.surface.overlayLight;
  }};
  color: ${({ theme: t }) => {
    return t.text;
  }};
  font-size: 0.85rem;
  outline: none;
  &:focus {
    border-color: ${({ theme: t }) => {
      return t.surface.borderFocus;
    }};
  }
`;

const FieldHint = styled.p`
  font-size: 0.72rem;
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  margin: -4px 0 0 98px;
  line-height: 1.4;
  a {
    color: inherit;
    text-decoration: underline;
    opacity: 0.8;
    &:hover {
      opacity: 1;
    }
  }
`;

const SwatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-left: 98px;
`;

const SmallBtn = styled.button`
  padding: 3px 7px;
  border-radius: 4px;
  border: 1px solid
    ${({ theme: t }) => {
      return t.panelBorder;
    }};
  background: transparent;
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  font-size: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    opacity: 0.8;
  }
`;

const SaveBtn = styled.button`
  padding: 8px 0;
  border-radius: 8px;
  border: 1.5px solid
    ${({ theme: t }) => {
      return t.ui.success;
    }};
  background: transparent;
  color: ${({ theme: t }) => {
    return t.ui.successLight;
  }};
  font-size: 0.875rem;
  cursor: pointer;
  width: 100%;
  margin-top: 4px;
  &:hover {
    background: ${({ theme: t }) => {
      return `${t.ui.successLight}1a`;
    }};
  }
`;

interface TerrainFormViewProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  formMode: 'add' | 'edit';
  onSave: () => void;
}

const TerrainFormView = ({
  form,
  setForm,
  formMode,
  onSave,
}: TerrainFormViewProps): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow>
        <FormLabel>{t('terrainConfig.fieldName')}</FormLabel>
        <FormInput
          value={form.name}
          onChange={(e) => {
            setForm((f) => {
              return { ...f, name: e.target.value };
            });
          }}
        />
      </FormRow>

      <FormRow>
        <FormLabel>{t('terrainConfig.fieldColor')}</FormLabel>
        <FormInput
          type="color"
          value={form.color}
          style={{ maxWidth: 48, padding: '2px 4px' }}
          onChange={(e) => {
            setForm((f) => {
              return { ...f, color: e.target.value };
            });
          }}
        />
        <FormInput
          value={form.color}
          onChange={(e) => {
            setForm((f) => {
              return { ...f, color: e.target.value };
            });
          }}
          style={{ maxWidth: 100 }}
        />
      </FormRow>

      <FormRow>
        <FormLabel>{t('terrainConfig.fieldPattern')}</FormLabel>
      </FormRow>
      <SwatchGrid>
        {PATTERN_OPTIONS.map((pk) => {
          return (
            <PatternSwatch
              key={pk}
              patternKey={pk}
              color={form.color}
              selected={form.patternKey === pk}
              onClick={() => {
                setForm((f) => {
                  return { ...f, patternKey: pk };
                });
              }}
            />
          );
        })}
      </SwatchGrid>

      <FormRow>
        <FormLabel>{t('terrainConfig.fieldIcon')}</FormLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {form.icon && (
            <img
              src={form.icon}
              alt=""
              style={{
                width: 32,
                height: 32,
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                opacity: 0.85,
                border: `1px solid ${theme.surface.border}`,
                borderRadius: 4,
                padding: 2,
              }}
            />
          )}
          <FormInput
            type="file"
            accept=".svg,image/svg+xml"
            style={{ maxWidth: 220, padding: '4px' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                setForm((f) => {
                  return { ...f, icon: reader.result as string };
                });
              };
              reader.readAsDataURL(file);
            }}
          />
          {form.icon && (
            <SmallBtn
              onClick={() => {
                setForm((f) => {
                  return { ...f, icon: '' };
                });
              }}
            >
              <CloseIcon width="1em" height="1em" aria-hidden />
            </SmallBtn>
          )}
        </div>
      </FormRow>
      <FieldHint>{t('terrainConfig.iconHint')}</FieldHint>

      <FormRow>
        <FormLabel>{t('terrainConfig.fieldDeepWater')}</FormLabel>
        <input
          type="checkbox"
          checked={form.isDeepWater}
          onChange={(e) => {
            setForm((f) => {
              return { ...f, isDeepWater: e.target.checked };
            });
          }}
        />
      </FormRow>
      <FieldHint style={{ marginTop: '-8px' }}>{t('terrainConfig.deepWaterHint')}</FieldHint>

      <SaveBtn onClick={onSave}>
        {formMode === 'add' ? t('terrainConfig.save') : t('terrainConfig.save')}
      </SaveBtn>
    </>
  );
};

export default TerrainFormView;
