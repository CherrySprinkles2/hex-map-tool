import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  disableBuiltinTerrain,
  enableBuiltinTerrain,
  addCustomTerrain,
  updateCustomTerrain,
  removeCustomTerrain,
  reorderTerrains,
} from '../../features/terrainConfig/terrainConfigSlice';
import { deleteTilesByTerrain } from '../../features/tiles/tilesSlice';
import { generateId } from '../../utils/generateId';
import { patternMarkColor } from '../../utils/patternColor';
import { theme } from '../../styles/theme';
import { TERRAIN_ICON } from '../../assets/icons/terrain';
import type { CustomTerrainType, PatternKey } from '../../types/domain';

const BUILTIN_IDS = ['grass', 'farm', 'forest', 'mountain', 'lake', 'ocean'] as const;
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

// ── Shared layout ─────────────────────────────────────────────────────────────

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled.div`
  background: ${({ theme: t }) => {
    return t.panelBackground;
  }};
  border: 2px solid
    ${({ theme: t }) => {
      return t.panelBorder;
    }};
  border-radius: 12px;
  padding: 20px;
  width: min(520px, 95vw);
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme: t }) => {
    return t.text;
  }};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover {
    color: ${({ theme: t }) => {
      return t.text;
    }};
  }
`;

// ── List view ─────────────────────────────────────────────────────────────────

const TerrainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid
    ${({ theme: t }) => {
      return t.panelBorder;
    }};
  background: rgba(255, 255, 255, 0.03);
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: ${({ $color }) => {
    return $color;
  }};
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

const TerrainIconImg = styled.img`
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
  opacity: 0.8;
`;

const TerrainIconSwatch = styled.span<{ $color: string }>`
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: ${({ $color }) => {
    return $color;
  }};
  flex-shrink: 0;
  opacity: 0.5;
`;

const TerrainName = styled.span<{ $muted?: boolean }>`
  flex: 1;
  font-size: 0.85rem;
  color: ${({ $muted, theme: t }) => {
    return $muted ? t.textMuted : t.text;
  }};
`;

const SmallBtn = styled.button<{ $variant?: 'danger' | 'default' }>`
  padding: 3px 7px;
  border-radius: 4px;
  border: 1px solid
    ${({ $variant, theme: t }) => {
      return $variant === 'danger' ? '#c0392b' : t.panelBorder;
    }};
  background: transparent;
  color: ${({ $variant }) => {
    return $variant === 'danger' ? '#e74c3c' : '#aaa';
  }};
  font-size: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const ToggleTrack = styled.button<{ $enabled: boolean }>`
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: none;
  background: ${({ $enabled }) => {
    return $enabled ? '#27ae60' : 'rgba(255,255,255,0.15)';
  }};
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  padding: 0;
  &:hover {
    opacity: 0.85;
  }
`;

const ToggleThumb = styled.span<{ $enabled: boolean }>`
  position: absolute;
  top: 3px;
  left: ${({ $enabled }) => {
    return $enabled ? '19px' : '3px';
  }};
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  transition: left 0.2s;
  pointer-events: none;
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

// ── Form view ─────────────────────────────────────────────────────────────────

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
  background: rgba(0, 0, 0, 0.3);
  color: ${({ theme: t }) => {
    return t.text;
  }};
  font-size: 0.85rem;
  outline: none;
  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
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

const SwatchBtn = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px;
  border-radius: 6px;
  border: 2px solid
    ${({ $selected, theme: t }) => {
      return $selected ? t.selectedStroke : 'transparent';
    }};
  background: ${({ $selected }) => {
    return $selected ? 'rgba(255,255,255,0.08)' : 'transparent';
  }};
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const SwatchLabel = styled.span`
  font-size: 0.65rem;
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  text-transform: capitalize;
`;

const SaveBtn = styled.button`
  padding: 8px 0;
  border-radius: 8px;
  border: 1.5px solid #27ae60;
  background: transparent;
  color: #2ecc71;
  font-size: 0.875rem;
  cursor: pointer;
  width: 100%;
  margin-top: 4px;
  &:hover {
    background: rgba(46, 204, 113, 0.1);
  }
`;

// ── Pattern swatch SVG helpers ────────────────────────────────────────────────

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
    default: // 'none'
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

// ── Form state ────────────────────────────────────────────────────────────────

interface CustomFormState {
  name: string;
  color: string;
  patternKey: PatternKey;
  isDeepWater: boolean;
  icon: string;
}

const DEFAULT_FORM: CustomFormState = {
  name: 'New Terrain',
  color: '#8B6914',
  patternKey: 'grass',
  isDeepWater: false,
  icon: '',
};

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

type ModalView = 'list' | 'form';
type FormMode = 'add' | 'edit';

const TerrainConfigModal = ({ onClose }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { disabled, custom, order } = useAppSelector((state) => {
    return state.terrainConfig;
  });
  const tiles = useAppSelector((state) => {
    return state.tiles;
  });

  const [view, setView] = useState<ModalView>('list');
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomFormState>(DEFAULT_FORM);

  // Build ordered display list
  const orderedList = order
    .map((id) => {
      const builtin = BUILTIN_IDS.find((bid) => {
        return bid === id;
      });
      if (builtin) {
        const td = theme.terrain[builtin];
        return {
          id,
          color: td.color,
          Icon: TERRAIN_ICON[builtin] ?? null,
          iconUrl: '',
          name: builtin,
          isCustom: false,
        };
      }
      const ct = custom.find((c) => {
        return c.id === id;
      });
      if (ct) {
        return {
          id: ct.id,
          color: ct.color,
          Icon: null,
          iconUrl: ct.icon ?? '',
          name: ct.name,
          isCustom: true,
        };
      }
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => {
      return x !== null;
    });
  BUILTIN_IDS.forEach((bid) => {
    if (!order.includes(bid)) {
      const td = theme.terrain[bid];
      orderedList.push({
        id: bid,
        color: td.color,
        Icon: TERRAIN_ICON[bid] ?? null,
        iconUrl: '',
        name: bid,
        isCustom: false,
      });
    }
  });
  custom.forEach((ct) => {
    if (!order.includes(ct.id)) {
      orderedList.push({
        id: ct.id,
        color: ct.color,
        Icon: null,
        iconUrl: ct.icon ?? '',
        name: ct.name,
        isCustom: true,
      });
    }
  });

  const handleMoveUp = (idx: number): void => {
    if (idx === 0) return;
    const newOrder = [...order];
    const a = newOrder[idx - 1];
    const b = newOrder[idx];
    newOrder[idx - 1] = b;
    newOrder[idx] = a;
    dispatch(reorderTerrains(newOrder));
  };

  const handleMoveDown = (idx: number): void => {
    if (idx >= orderedList.length - 1) return;
    const newOrder = [...order];
    const a = newOrder[idx];
    const b = newOrder[idx + 1];
    newOrder[idx] = b;
    newOrder[idx + 1] = a;
    dispatch(reorderTerrains(newOrder));
  };

  const handleToggleBuiltin = (id: string): void => {
    const isDisabled = disabled.includes(id);
    if (!isDisabled) {
      const count = Object.values(tiles).filter((t) => {
        return t.terrain === id;
      }).length;
      if (count > 0) {
        const ok = window.confirm(t('terrainConfig.disableWarning', { count }));
        if (!ok) return;
      }
      dispatch(disableBuiltinTerrain(id));
    } else {
      dispatch(enableBuiltinTerrain(id));
    }
  };

  const handleDeleteCustom = (id: string): void => {
    const count = Object.values(tiles).filter((t) => {
      return t.terrain === id;
    }).length;
    if (count > 0) {
      const ok = window.confirm(t('terrainConfig.deleteWarning', { count }));
      if (ok) {
        dispatch(deleteTilesByTerrain(id));
      }
    }
    dispatch(removeCustomTerrain(id));
  };

  const openAddForm = (): void => {
    setFormMode('add');
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setView('form');
  };

  const openEditForm = (ct: CustomTerrainType): void => {
    setFormMode('edit');
    setEditingId(ct.id);
    setForm({
      name: ct.name,
      color: ct.color,
      patternKey: ct.patternKey,
      isDeepWater: ct.isDeepWater,
      icon: ct.icon,
    });
    setView('form');
  };

  const handleSave = (): void => {
    if (formMode === 'edit' && editingId) {
      dispatch(updateCustomTerrain({ id: editingId, ...form }));
    } else {
      dispatch(addCustomTerrain({ id: generateId('terrain'), ...form }));
    }
    setView('list');
  };

  const handleBackToList = (): void => {
    setView('list');
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalCard
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {view === 'list' ? (
          <>
            <ModalHeader>
              <ModalTitle>{t('terrainConfig.title')}</ModalTitle>
              <IconBtn onClick={onClose}>✕</IconBtn>
            </ModalHeader>

            {orderedList.map((entry, idx) => {
              const isEnabled = !disabled.includes(entry.id);
              return (
                <TerrainRow key={entry.id}>
                  <SmallBtn
                    onClick={() => {
                      handleMoveUp(idx);
                    }}
                    disabled={idx === 0}
                  >
                    ↑
                  </SmallBtn>
                  <SmallBtn
                    onClick={() => {
                      handleMoveDown(idx);
                    }}
                    disabled={idx >= orderedList.length - 1}
                  >
                    ↓
                  </SmallBtn>
                  <ColorSwatch $color={entry.color} />
                  {entry.Icon ? (
                    <entry.Icon
                      style={{
                        width: '22px',
                        height: '22px',
                        flexShrink: 0,
                        filter: 'brightness(0) invert(1)',
                        opacity: 0.8,
                      }}
                    />
                  ) : entry.iconUrl ? (
                    <TerrainIconImg src={entry.iconUrl} alt="" aria-hidden />
                  ) : (
                    <TerrainIconSwatch $color={entry.color} />
                  )}
                  <TerrainName $muted={!isEnabled && !entry.isCustom}>
                    {entry.isCustom ? entry.name : String(t(`terrain.${entry.id}` as any))}
                  </TerrainName>
                  {!entry.isCustom && (
                    <ToggleTrack
                      $enabled={isEnabled}
                      onClick={() => {
                        handleToggleBuiltin(entry.id);
                      }}
                    >
                      <ToggleThumb $enabled={isEnabled} />
                    </ToggleTrack>
                  )}
                  {entry.isCustom && (
                    <>
                      <SmallBtn
                        onClick={() => {
                          const ct = custom.find((c) => {
                            return c.id === entry.id;
                          });
                          if (ct) openEditForm(ct);
                        }}
                      >
                        ✏
                      </SmallBtn>
                      <SmallBtn
                        $variant="danger"
                        onClick={() => {
                          handleDeleteCustom(entry.id);
                        }}
                      >
                        ✕
                      </SmallBtn>
                    </>
                  )}
                </TerrainRow>
              );
            })}

            <AddBtn onClick={openAddForm}>{t('terrainConfig.addTerrain')}</AddBtn>
          </>
        ) : (
          <>
            <ModalHeader>
              <IconBtn onClick={handleBackToList}>{t('terrainConfig.back')}</IconBtn>
              <ModalTitle>
                {formMode === 'add'
                  ? t('terrainConfig.newTerrainTitle')
                  : t('terrainConfig.editTerrainTitle')}
              </ModalTitle>
              <IconBtn onClick={onClose}>✕</IconBtn>
            </ModalHeader>

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
                      border: '1px solid rgba(255,255,255,0.15)',
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
                    ✕
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

            <SaveBtn onClick={handleSave}>{t('terrainConfig.save')}</SaveBtn>
          </>
        )}
      </ModalCard>
    </ModalBackdrop>
  );
};

export default TerrainConfigModal;
