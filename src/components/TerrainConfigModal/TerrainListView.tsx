import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { theme } from '../../styles/theme';
import { CloseIcon, PencilIcon } from '../../assets/icons/ui';
import type { CustomTerrainType } from '../../types/domain';

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
  background: ${({ theme: t }) => {
    return t.surface.subtle;
  }};
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: ${({ $color }) => {
    return $color;
  }};
  border: 1px solid
    ${({ theme: t }) => {
      return t.surface.borderMedium;
    }};
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
  background: ${({ $enabled, theme: t }) => {
    return $enabled ? t.ui.success : t.surface.border;
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

export interface OrderedEntry {
  id: string;
  color: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
  iconUrl: string;
  name: string;
  isCustom: boolean;
}

interface TerrainListViewProps {
  orderedList: OrderedEntry[];
  disabled: string[];
  custom: CustomTerrainType[];
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
  onToggleBuiltin: (id: string) => void;
  onDeleteCustom: (id: string) => void;
  onOpenEditForm: (ct: CustomTerrainType) => void;
  onOpenAddForm: () => void;
}

const TerrainListView = ({
  orderedList,
  disabled,
  custom,
  onMoveUp,
  onMoveDown,
  onToggleBuiltin,
  onDeleteCustom,
  onOpenEditForm,
  onOpenAddForm,
}: TerrainListViewProps): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      {orderedList.map((entry, idx) => {
        const isEnabled = !disabled.includes(entry.id);
        return (
          <TerrainRow key={entry.id}>
            <SmallBtn
              onClick={() => {
                onMoveUp(idx);
              }}
              disabled={idx === 0}
            >
              ↑
            </SmallBtn>
            <SmallBtn
              onClick={() => {
                onMoveDown(idx);
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
                  onToggleBuiltin(entry.id);
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
                    if (ct) onOpenEditForm(ct);
                  }}
                >
                  <PencilIcon width="1em" height="1em" aria-hidden />
                </SmallBtn>
                <SmallBtn
                  $variant="danger"
                  onClick={() => {
                    onDeleteCustom(entry.id);
                  }}
                >
                  <CloseIcon width="1em" height="1em" aria-hidden />
                </SmallBtn>
              </>
            )}
          </TerrainRow>
        );
      })}
      <AddBtn onClick={onOpenAddForm}>{t('terrainConfig.addTerrain')}</AddBtn>
    </>
  );
};

export default TerrainListView;
