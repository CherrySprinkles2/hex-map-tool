import React from 'react';
import styled from 'styled-components';
import { ModalBackdrop, ModalCard, ModalTitle } from './modal';

const Message = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin: 0;
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 9px 12px;
  border-radius: 6px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
  }
`;

const DeleteBtn = styled.button`
  flex: 1;
  padding: 9px 12px;
  border-radius: 6px;
  border: 2px solid
    ${({ theme }) => {
      return theme.accent;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.accent;
  }};
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.accent;
    }}22;
  }
`;

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps): React.ReactElement | null => {
  if (!open) return null;

  return (
    <ModalBackdrop onClick={onCancel}>
      <ModalCard
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <ModalTitle>{title}</ModalTitle>
        <Message>{message}</Message>
        <ButtonRow>
          <CancelBtn data-testid="confirm-modal-cancel-btn" onClick={onCancel}>
            {cancelLabel}
          </CancelBtn>
          <DeleteBtn data-testid="confirm-modal-confirm-btn" onClick={onConfirm}>
            {confirmLabel}
          </DeleteBtn>
        </ButtonRow>
      </ModalCard>
    </ModalBackdrop>
  );
};
