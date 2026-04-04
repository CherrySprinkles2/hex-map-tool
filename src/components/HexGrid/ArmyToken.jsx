import React, { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { axialToPixel, toKey, DEEP_WATER } from '../../utils/hexUtils';
import { deleteArmy } from '../../features/armies/armiesSlice';
import { selectArmy, deselectArmy } from '../../features/ui/uiSlice';
import { useTheme } from 'styled-components';

const ArmyToken = React.memo(({ army, tileIndex, total }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { id, q, r, name, factionId } = army;

  const tileKey = useMemo(() => {
    return toKey(q, r);
  }, [q, r]);
  const terrain = useSelector((state) => {
    return state.tiles[tileKey]?.terrain ?? 'grass';
  });
  const isSelected = useSelector((state) => {
    return state.ui.selectedArmyId === id;
  });
  const isMoving = useSelector((state) => {
    return state.ui.movingArmyId === id;
  });
  const factionColor = useSelector((state) => {
    if (!factionId) return null;
    return (
      state.factions.find((f) => {
        return f.id === factionId;
      })?.color ?? null
    );
  });

  const icon = DEEP_WATER.has(terrain) ? '⛵' : '⚔️';

  const { x: baseX, y: baseY } = useMemo(() => {
    return axialToPixel(q, r);
  }, [q, r]);
  const offsetX = (tileIndex - (total - 1) / 2) * theme.army.stackSpacing;
  const cx = baseX + offsetX;
  const cy = baseY - 8;

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (isSelected) dispatch(deselectArmy());
      else dispatch(selectArmy(id));
    },
    [isSelected, dispatch, id]
  );

  const handleContextMenu = useCallback(
    (e) => {
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

      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={theme.army.tokenRadius}
        fill={theme.army.tokenFill}
        stroke={strokeColor}
        strokeWidth={1.5}
      />

      {/* Faction colour dot (bottom-right of token) */}
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

      {/* Emoji icon */}
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fontSize={13}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {icon}
      </text>

      {/* Name label below token */}
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
