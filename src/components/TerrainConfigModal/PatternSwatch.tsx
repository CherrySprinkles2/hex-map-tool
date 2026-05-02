import React, { useRef } from 'react';
import styled from 'styled-components';
import { patternMarkColor } from '../../utils/patternColor';
import type { PatternKey } from '../../types/domain';

const SwatchBtn = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px;
  border-radius: 6px;
  border: 2px solid
    ${({ $selected, theme }) => {
      return $selected ? theme.selectedStroke : 'transparent';
    }};
  background: ${({ $selected, theme }) => {
    return $selected ? theme.surface.hover : 'transparent';
  }};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => {
      return theme.surface.hoverWeak;
    }};
  }
`;

const SwatchLabel = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  text-transform: capitalize;
`;

const renderSwatchDefs = (id: string, patternKey: PatternKey, mark: string): React.ReactElement => {
  switch (patternKey) {
    case 'grass':
      return (
        <pattern id={id} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <line
            x1="2"
            y1="11"
            x2="4"
            y2="6"
            stroke={mark}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line x1="4" y1="11" x2="6" y2="7" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <line
            x1="9"
            y1="11"
            x2="11"
            y2="6"
            stroke={mark}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="11"
            y1="11"
            x2="13"
            y2="7"
            stroke={mark}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line x1="5" y1="5" x2="7" y2="1" stroke={mark} strokeWidth="1" strokeLinecap="round" />
        </pattern>
      );
    case 'farm':
      return (
        <pattern id={id} x="0" y="0" width="20" height="7" patternUnits="userSpaceOnUse">
          <line x1="0" y1="3.5" x2="20" y2="3.5" stroke={mark} strokeWidth="1.2" />
        </pattern>
      );
    case 'forest':
      return (
        <pattern id={id} x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2.8" fill={mark} />
          <circle cx="11.5" cy="4" r="2" fill={mark} />
          <circle cx="7.5" cy="10.5" r="2.8" fill={mark} />
          <circle cx="1" cy="11" r="1.6" fill={mark} />
          <circle cx="14" cy="11" r="1.6" fill={mark} />
        </pattern>
      );
    case 'mountain':
      return (
        <pattern id={id} x="0" y="0" width="22" height="13" patternUnits="userSpaceOnUse">
          <polyline
            points="0,11 5.5,5 11,11 16.5,5 22,11"
            stroke={mark}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="0,7 5.5,1 11,7 16.5,1 22,7"
            stroke={mark}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </pattern>
      );
    case 'lake':
      return (
        <pattern id={id} x="0" y="0" width="30" height="10" patternUnits="userSpaceOnUse">
          <path
            d="M0,3 C4,1.5 8,4.5 12,3 C16,1.5 20,4.5 24,3 C26,2.3 28,1.8 30,3"
            stroke={mark}
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0,7.5 C4,6 8,9 12,7.5 C16,6 20,9 24,7.5 C26,6.8 28,6.3 30,7.5"
            stroke={mark}
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </pattern>
      );
    case 'ocean':
      return (
        <pattern id={id} x="0" y="0" width="50" height="18" patternUnits="userSpaceOnUse">
          <path
            d="M0,5 C7,2 14,8 21,5 C28,2 35,8 42,5 C45,3.5 47.5,2.5 50,5"
            stroke={mark}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0,12 C7,9 14,15 21,12 C28,9 35,15 42,12 C45,10.5 47.5,9.5 50,12"
            stroke={mark}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </pattern>
      );
    case 'desert':
      return (
        <pattern id={id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="1" fill={mark} />
          <circle cx="10" cy="2" r="0.8" fill={mark} />
          <circle cx="7" cy="9" r="1.1" fill={mark} />
          <circle cx="14" cy="7" r="0.8" fill={mark} />
          <circle cx="2" cy="13" r="0.9" fill={mark} />
          <circle cx="11" cy="13" r="1" fill={mark} />
          <circle cx="5" cy="7" r="0.7" fill={mark} />
        </pattern>
      );
    case 'swamp':
      return (
        <pattern id={id} x="0" y="0" width="18" height="16" patternUnits="userSpaceOnUse">
          <line x1="3" y1="14" x2="3" y2="6" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <line x1="3" y1="8" x2="1" y2="5" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <line x1="3" y1="8" x2="5" y2="5" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <line
            x1="12"
            y1="14"
            x2="12"
            y2="7"
            stroke={mark}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line x1="12" y1="9" x2="10" y2="6" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <line x1="12" y1="9" x2="14" y2="6" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <path
            d="M0,14.5 C3,13.5 6,15.5 9,14.5 C12,13.5 15,15.5 18,14.5"
            stroke={mark}
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
        </pattern>
      );
    case 'jungle':
      return (
        <pattern id={id} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2.5" fill={mark} />
          <circle cx="9" cy="2.5" r="2" fill={mark} />
          <circle cx="6" cy="8" r="2.5" fill={mark} />
          <circle cx="1" cy="9" r="1.5" fill={mark} />
          <circle cx="11" cy="8.5" r="1.5" fill={mark} />
          <circle cx="5" cy="5.5" r="1.2" fill={mark} />
        </pattern>
      );
    case 'hills':
      return (
        <pattern id={id} x="0" y="0" width="24" height="14" patternUnits="userSpaceOnUse">
          <path
            d="M0,12 Q6,5 12,12 Q18,5 24,12"
            stroke={mark}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0,8 Q6,1 12,8 Q18,1 24,8"
            stroke={mark}
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </pattern>
      );
    case 'badlands':
      return (
        <pattern id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="2" y1="5" x2="7" y2="9" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <line x1="7" y1="9" x2="5" y2="14" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <line
            x1="5"
            y1="14"
            x2="10"
            y2="17"
            stroke={mark}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line x1="12" y1="2" x2="16" y2="7" stroke={mark} strokeWidth="1" strokeLinecap="round" />
          <line
            x1="16"
            y1="7"
            x2="13"
            y2="12"
            stroke={mark}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="13"
            y1="12"
            x2="18"
            y2="16"
            stroke={mark}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="7"
            y1="9"
            x2="13"
            y2="12"
            stroke={mark}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </pattern>
      );
    default:
      return <pattern id={id} x="0" y="0" width="1" height="1" patternUnits="userSpaceOnUse" />;
  }
};

interface PatternSwatchProps {
  patternKey: PatternKey;
  color: string;
  selected: boolean;
  onClick: () => void;
}

const PatternSwatch = React.memo(
  ({ patternKey, color, selected, onClick }: PatternSwatchProps): React.ReactElement => {
    const uid = useRef(Math.random().toString(36).slice(2, 9)).current;
    const mark = patternMarkColor(color, 0.3);
    const patId = `sp-${uid}`;
    return (
      <SwatchBtn $selected={selected} onClick={onClick}>
        <svg width="40" height="40" style={{ borderRadius: 5, display: 'block' }}>
          {patternKey !== 'none' && <defs>{renderSwatchDefs(patId, patternKey, mark)}</defs>}
          <rect x="0" y="0" width="40" height="40" rx="5" fill={color} />
          {patternKey !== 'none' && (
            <rect x="0" y="0" width="40" height="40" rx="5" fill={`url(#${patId})`} />
          )}
        </svg>
        <SwatchLabel>{patternKey}</SwatchLabel>
      </SwatchBtn>
    );
  }
);

export default PatternSwatch;
