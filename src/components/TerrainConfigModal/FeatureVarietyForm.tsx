import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

export interface FeatureFormState {
  name: string;
  color: string;
  width: number;
}

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

const WidthValue = styled.span`
  font-size: 0.85rem;
  color: ${({ theme: t }) => {
    return t.text;
  }};
  width: 28px;
  text-align: right;
`;

const Preview = styled.div`
  margin-left: 98px;
  height: 24px;
  display: flex;
  align-items: center;
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

interface FeatureVarietyFormProps {
  form: FeatureFormState;
  setForm: React.Dispatch<React.SetStateAction<FeatureFormState>>;
  onSave: () => void;
}

const FeatureVarietyForm = ({
  form,
  setForm,
  onSave,
}: FeatureVarietyFormProps): React.ReactElement => {
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
        <FormLabel>{t('terrainConfig.fieldWidth')}</FormLabel>
        <input
          type="range"
          min={1}
          max={14}
          step={1}
          value={form.width}
          style={{ flex: 1 }}
          onChange={(e) => {
            setForm((f) => {
              return { ...f, width: Number(e.target.value) };
            });
          }}
        />
        <WidthValue>{form.width}</WidthValue>
      </FormRow>

      <Preview>
        <svg width="100%" height="24" aria-hidden>
          <line
            x1="0"
            y1="12"
            x2="100%"
            y2="12"
            stroke={form.color}
            strokeWidth={form.width}
            strokeLinecap="round"
          />
        </svg>
      </Preview>

      <SaveBtn onClick={onSave}>{t('terrainConfig.save')}</SaveBtn>
    </>
  );
};

export default FeatureVarietyForm;
