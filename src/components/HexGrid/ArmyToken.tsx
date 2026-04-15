import React, { useMemo, useCallback } from 'react';
import { useTheme } from 'styled-components';
import { axialToPixel, toKey, DEEP_WATER } from '../../utils/hexUtils';
import { deleteArmy } from '../../features/armies/armiesSlice';
import { selectArmy, deselectArmy } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { Army } from '../../types/domain';

interface ArmyTokenProps {
  army: Army;
  tileIndex: number;
  total: number;
}

const ArmyToken = React.memo(({ army, tileIndex, total }: ArmyTokenProps): React.ReactElement => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { id, q, r, name, factionId } = army;

  const tileKey = useMemo(() => {
    return toKey(q, r);
  }, [q, r]);
  const terrain = useAppSelector((state) => {
    return state.tiles[tileKey]?.terrain ?? 'grass';
  });
  const isSelected = useAppSelector((state) => {
    return state.ui.selectedArmyId === id;
  });
  const isMoving = useAppSelector((state) => {
    return state.ui.movingArmyId === id;
  });
  const factionColor = useAppSelector((state) => {
    if (!factionId) return null;
    return (
      state.factions.find((f) => {
        return f.id === factionId;
      })?.color ?? null
    );
  });

  const ArmyIcon = DEEP_WATER.has(terrain) ? theme.icons.army.naval : theme.icons.army.land;
  const iconSize = theme.army.tokenRadius * 1.1;

  const { x: baseX, y: baseY } = useMemo(() => {
    return axialToPixel(q, r);
  }, [q, r]);
  const offsetX = (tileIndex - (total - 1) / 2) * theme.army.stackSpacing;
  const cx = baseX + offsetX;
  const cy = baseY - 8;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isSelected) dispatch(deselectArmy());
      else dispatch(selectArmy(id));
    },
    [isSelected, dispatch, id]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(deleteArmy(id));
      dispatch(deselectArmy());
    },
    [dispatch, id]
  );

  const activeColor = isMoving ? theme.army.movingColor : theme.army.selectedColor;
  const strokeColor = isSelected || isMoving ? activeColor : theme.army.tokenStroke;

  return (
    <g onClick={handleClick} onContextMenu={handleContextMenu} style={{ cursor: 'pointer' }}>
      {(isSelected || isMoving) && (
        <circle
          cx={cx}
          cy={cy}
          r={theme.army.ringRadius}
          fill="none"
          stroke={activeColor}
          strokeWidth={2}
          strokeDasharray={theme.army.ringDash}
          strokeLinecap="round"
          style={{ pointerEvents: 'none', animation: 'marchingAnts 1s linear infinite' }}
        />
      )}

      <circle
        cx={cx}
        cy={cy}
        r={theme.army.tokenRadius}
        fill={theme.army.tokenFill}
        stroke={strokeColor}
        strokeWidth={1.5}
      />

      {factionColor && (
        <circle
          cx={cx + theme.army.tokenRadius * 0.65}
          cy={cy + theme.army.tokenRadius * 0.65}
          r={4}
          fill={factionColor}
          stroke={theme.army.tokenFill}
          strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
      )}

      <ArmyIcon
        x={cx - iconSize / 2}
        y={cy - iconSize / 2}
        width={iconSize}
        height={iconSize}
        style={{ pointerEvents: 'none', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
      />

      {name && (
        <text
          x={cx}
          y={cy + theme.army.tokenRadius + 14}
          textAnchor="middle"
          fontSize={9}
          fill={theme.army.labelFill}
          stroke={theme.army.labelStroke}
          strokeWidth={theme.army.labelStrokeWidth}
          paintOrder="stroke"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {name}
        </text>
      )}
    </g>
  );
});

export default ArmyToken;
