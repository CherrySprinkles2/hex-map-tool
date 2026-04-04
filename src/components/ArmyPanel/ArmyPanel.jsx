import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { updateArmy, deleteArmy } from '../../features/armies/armiesSlice';
import { deselectArmy, startMovingArmy, stopMovingArmy } from '../../features/ui/uiSlice';

const Panel = styled.div`
  position: fixed;
  top: 0;
  left: ${({ $open }) => ($open ? '0' : '-300px')};
  width: 280px;
  height: 100vh;
  background: ${({ theme }) => theme.panelBackground};
  border-right: 2px solid ${({ theme }) => theme.panelBorder};
  padding: 24px 16px;
  transition: left 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 100;
  overflow-y: auto;

  @media (max-width: 600px) {
    top: auto;
    left: 0;
    bottom: ${({ $open }) => ($open ? '0' : '-60vh')};
    width: 100%;
    height: 60vh;
    border-right: none;
    border-top: 2px solid ${({ theme }) => theme.panelBorder};
    border-radius: 16px 16px 0 0;
    padding: 16px 16px 32px;
    transition: bottom 0.25s ease;
  }
`;

const DragHandle = styled.div`
  display: none;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.panelBorder};
  margin: 0 auto -8px;

  @media (max-width: 600px) {
    display: block;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PanelTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover { color: ${({ theme }) => theme.text}; }
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.textMuted};
  margin-bottom: 4px;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
  }

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }
`;

const CompositionTextarea = styled.textarea`
  width: 100%;
  min-height: 130px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem;
  line-height: 1.5;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;

  &:focus {
    border-color: rgba(255, 255, 255, 0.35);
  }

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }
`;

const MoveBtn = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid ${({ $active }) => $active ? '#ffaa00' : 'rgba(255,255,255,0.2)'};
  background: ${({ $active }) => $active ? 'rgba(255,170,0,0.15)' : 'rgba(255,255,255,0.03)'};
  color: ${({ $active, theme }) => $active ? '#ffaa00' : theme.text};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s, border-color 0.15s;
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(255,170,0,0.25)' : 'rgba(255,255,255,0.08)'};
  }
`;

const DeleteBtn = styled.button`
  margin-top: auto;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.accent};
  background: transparent;
  color: ${({ theme }) => theme.accent};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.accent}22; }
`;

const Hint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  background: rgba(255,170,0,0.08);
  border: 1px solid rgba(255,170,0,0.2);
  border-radius: 6px;
  padding: 8px 10px;
  line-height: 1.5;
`;

const ArmyPanel = () => {
  const dispatch = useDispatch();
  const selectedArmyId = useSelector((state) => state.ui.selectedArmyId);
  const movingArmyId   = useSelector((state) => state.ui.movingArmyId);
  const army           = useSelector((state) => state.armies[selectedArmyId] ?? null);

  const isOpen    = selectedArmyId !== null && army !== null;
  const isMoving  = movingArmyId === selectedArmyId;

  const [localName, setLocalName]               = useState('');
  const [localComposition, setLocalComposition] = useState('');

  // Sync local state when the selected army changes
  useEffect(() => {
    if (army) {
      setLocalName(army.name);
      setLocalComposition(army.composition);
    }
  }, [army?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key closes the panel (or cancels move mode first)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMoving) dispatch(stopMovingArmy());
        else dispatch(deselectArmy());
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isMoving]);

  const handleNameBlur = useCallback(() => {
    if (!army) return;
    const trimmed = localName.trim() || 'New Army';
    setLocalName(trimmed);
    dispatch(updateArmy({ id: army.id, name: trimmed }));
  }, [army, localName, dispatch]);

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') e.target.blur();
  }, []);

  const handleCompositionBlur = useCallback(() => {
    if (!army) return;
    dispatch(updateArmy({ id: army.id, composition: localComposition }));
  }, [army, localComposition, dispatch]);

  const handleMoveToggle = useCallback(() => {
    if (!army) return;
    if (isMoving) dispatch(stopMovingArmy());
    else dispatch(startMovingArmy(army.id));
  }, [army, isMoving, dispatch]);

  const handleDelete = useCallback(() => {
    if (!army) return;
    dispatch(deleteArmy(army.id));
    dispatch(deselectArmy());
  }, [army, dispatch]);

  const handleClose = useCallback(() => {
    if (isMoving) dispatch(stopMovingArmy());
    dispatch(deselectArmy());
  }, [isMoving, dispatch]);

  return (
    <Panel $open={isOpen}>
      <DragHandle />
      <PanelHeader>
        <PanelTitle>⚔ Army</PanelTitle>
        <CloseBtn onClick={handleClose} title="Close (Esc)">×</CloseBtn>
      </PanelHeader>

      {army && (
        <>
          <div>
            <SectionLabel>Name</SectionLabel>
            <NameInput
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              placeholder="Army name"
              maxLength={40}
            />
          </div>

          <div>
            <SectionLabel>Composition</SectionLabel>
            <CompositionTextarea
              value={localComposition}
              onChange={(e) => setLocalComposition(e.target.value)}
              onBlur={handleCompositionBlur}
              placeholder={`e.g.\n500 Infantry\n120 Cavalry\n20 Cannon`}
            />
          </div>

          <MoveBtn $active={isMoving} onClick={handleMoveToggle}>
            {isMoving ? '✕ Cancel Move' : '↪ Move Army'}
          </MoveBtn>

          {isMoving && (
            <Hint>Tap any tile on the map to move this army there. Pan and zoom work normally.</Hint>
          )}

          <DeleteBtn onClick={handleDelete}>✕ Delete Army</DeleteBtn>
        </>
      )}
    </Panel>
  );
};

export default ArmyPanel;
