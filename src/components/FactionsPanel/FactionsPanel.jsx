import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { addFaction, deleteFaction, updateFaction } from '../../features/factions/factionsSlice';
import { closeFactionsPanel } from '../../features/ui/uiSlice';
import { theme } from '../../styles/theme';

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: ${({ $open }) => ($open ? '0' : '-320px')};
  width: 300px;
  height: 100vh;
  background: ${({ theme }) => theme.panelBackground};
  border-left: 2px solid ${({ theme }) => theme.panelBorder};
  padding: 24px 16px;
  transition: right 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 0;
  z-index: 100;
  overflow-y: auto;

  @media (max-width: 600px) {
    top: auto;
    right: 0;
    bottom: ${({ $open }) => ($open ? '0' : '-70vh')};
    width: 100%;
    height: 70vh;
    border-left: none;
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
  margin: 0 auto 12px;

  @media (max-width: 600px) {
    display: block;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 2px 6px;
  &:hover { color: ${({ theme }) => theme.text}; }
`;

const FactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const FactionCard = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid ${({ theme }) => theme.panelBorder};
  border-left: 4px solid ${({ $color }) => $color};
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NameInput = styled.input`
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  background: transparent;
  border: none;
  border-bottom: 1.5px solid transparent;
  padding: 2px 4px;
  outline: none;
  min-width: 0;
  &:hover, &:focus {
    border-bottom-color: ${({ theme }) => theme.textMuted};
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 4px;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.accent}; }
`;

const SectionLabel = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.textMuted};
  margin-bottom: 4px;
`;

const SwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Swatch = styled.button`
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 2px solid ${({ $active }) => ($active ? '#fff' : 'transparent')};
  background: ${({ $color }) => $color};
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  outline: none;
  &:hover { border-color: rgba(255,255,255,0.6); }
`;

const DescInput = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.text};
  background: rgba(0,0,0,0.2);
  border: 1px solid ${({ theme }) => theme.panelBorder};
  border-radius: 4px;
  padding: 6px 8px;
  resize: vertical;
  min-height: 52px;
  outline: none;
  font-family: inherit;
  line-height: 1.4;
  &:focus { border-color: ${({ theme }) => theme.textMuted}; }
`;

const AddBtn = styled.button`
  margin-top: 16px;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1.5px dashed ${({ theme }) => theme.panelBorder};
  background: transparent;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.82rem;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: border-color 0.15s, color 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.textMuted};
    color: ${({ theme }) => theme.text};
  }
`;

const Empty = styled.div`
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.82rem;
  text-align: center;
  padding: 24px 0 8px;
`;

const FactionItem = ({ faction }) => {
  const dispatch = useDispatch();
  const [localName, setLocalName] = useState(faction.name);
  const [localDesc, setLocalDesc] = useState(faction.description);

  const commitName = useCallback(() => {
    const trimmed = localName.trim() || 'New Faction';
    setLocalName(trimmed);
    dispatch(updateFaction({ id: faction.id, name: trimmed }));
  }, [dispatch, faction.id, localName]);

  const commitDesc = useCallback(() => {
    dispatch(updateFaction({ id: faction.id, description: localDesc }));
  }, [dispatch, faction.id, localDesc]);

  return (
    <FactionCard theme={theme} $color={faction.color}>
      <CardRow>
        <NameInput
          theme={theme}
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
          maxLength={48}
        />
        <DeleteBtn theme={theme} onClick={() => dispatch(deleteFaction(faction.id))} title="Delete faction">✕</DeleteBtn>
      </CardRow>

      <div>
        <SectionLabel theme={theme}>Colour</SectionLabel>
        <SwatchRow>
          {theme.factionColors.map((c) => (
            <Swatch
              key={c}
              $color={c}
              $active={faction.color === c}
              onClick={() => dispatch(updateFaction({ id: faction.id, color: c }))}
              title={c}
            />
          ))}
        </SwatchRow>
      </div>

      <div>
        <SectionLabel theme={theme}>Description</SectionLabel>
        <DescInput
          theme={theme}
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
          onBlur={commitDesc}
          placeholder="Notes about this faction…"
          maxLength={500}
        />
      </div>
    </FactionCard>
  );
};

const FactionsPanel = () => {
  const dispatch  = useDispatch();
  const factions  = useSelector((state) => state.factions);
  const isOpen    = useSelector((state) => state.ui.factionsOpen);

  const handleAdd = () => {
    const usedColors = new Set(factions.map((f) => f.color));
    const nextColor  = theme.factionColors.find((c) => !usedColors.has(c)) ?? theme.factionColors[0];
    dispatch(addFaction({ color: nextColor }));
  };

  return (
    <Panel theme={theme} $open={isOpen}>
      <DragHandle theme={theme} />
      <Header>
        <Title theme={theme}>⚑ Factions</Title>
        <CloseBtn theme={theme} onClick={() => dispatch(closeFactionsPanel())}>✕</CloseBtn>
      </Header>

      <FactionList>
        {factions.length === 0 && (
          <Empty theme={theme}>No factions yet. Add one below.</Empty>
        )}
        {factions.map((faction) => (
          <FactionItem key={faction.id} faction={faction} />
        ))}
      </FactionList>

      <AddBtn theme={theme} onClick={handleAdd}>＋ Add Faction</AddBtn>
    </Panel>
  );
};

export default FactionsPanel;
