import React from 'react';
import styled from 'styled-components';
import { CloseIcon, PencilIcon } from '../../assets/icons/ui';
import type { FeatureVariety } from '../../types/domain';

const SectionHeading = styled.h3`
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  margin: 8px 0 2px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid
    ${({ theme: t }) => {
      return t.panelBorder;
    }};
  background: ${({ theme: t }) => {
    return t.surface.subtle;
  }};
`;

const Sample = styled.span<{ $color: string; $width: number }>`
  width: 28px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  &::after {
    content: '';
    width: 100%;
    height: ${({ $width }) => {
      return `${Math.min($width, 14)}px`;
    }};
    border-radius: 3px;
    background: ${({ $color }) => {
      return $color;
    }};
  }
`;

const Name = styled.span`
  flex: 1;
  font-size: 0.85rem;
  color: ${({ theme: t }) => {
    return t.text;
  }};
`;

const SmallBtn = styled.button<{ $variant?: 'danger' | 'default' }>`
  padding: 3px 7px;
  border-radius: 4px;
  border: 1px solid
    ${({ $variant, theme: t }) => {
      return $variant === 'danger' ? t.ui.danger : t.panelBorder;
    }};
  background: transparent;
  color: ${({ $variant, theme: t }) => {
    return $variant === 'danger' ? t.ui.dangerLight : t.textMuted;
  }};
  font-size: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    opacity: 0.8;
  }
`;

const AddBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1.5px dashed
    ${({ theme: t }) => {
      return t.panelBorder;
    }};
  background: transparent;
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  font-size: 0.85rem;
  cursor: pointer;
  width: 100%;
  &:hover {
    border-color: ${({ theme: t }) => {
      return t.text;
    }};
    color: ${({ theme: t }) => {
      return t.text;
    }};
  }
`;

interface FeatureVarietySectionProps {
  title: string;
  varieties: FeatureVariety[];
  defaultId: string;
  addLabel: string;
  addTestId: string;
  onAdd: () => void;
  onEdit: (v: FeatureVariety) => void;
  onDelete: (id: string) => void;
}

const FeatureVarietySection = ({
  title,
  varieties,
  defaultId,
  addLabel,
  addTestId,
  onAdd,
  onEdit,
  onDelete,
}: FeatureVarietySectionProps): React.ReactElement => {
  return (
    <>
      <SectionHeading>{title}</SectionHeading>
      {varieties.map((v) => {
        return (
          <Row key={v.id} data-testid={`variety-row-${v.id}`}>
            <Sample $color={v.color} $width={v.width} />
            <Name>{v.name}</Name>
            <SmallBtn
              onClick={() => {
                onEdit(v);
              }}
            >
              <PencilIcon width="1em" height="1em" aria-hidden />
            </SmallBtn>
            <SmallBtn
              $variant="danger"
              disabled={v.id === defaultId}
              style={v.id === defaultId ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
              onClick={() => {
                if (v.id !== defaultId) onDelete(v.id);
              }}
            >
              <CloseIcon width="1em" height="1em" aria-hidden />
            </SmallBtn>
          </Row>
        );
      })}
      <AddBtn onClick={onAdd}>{addLabel}</AddBtn>
    </>
  );
};

export default FeatureVarietySection;
