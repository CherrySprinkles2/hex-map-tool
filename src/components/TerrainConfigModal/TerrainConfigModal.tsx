import React, { useState } from 'react';
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
import { theme } from '../../styles/theme';
import type { CustomTerrainType, PatternKey } from '../../types/domain';
import { CloseIcon } from '../../assets/icons/ui';
import { ModalBackdrop } from '../shared/modal';
import TerrainListView from './TerrainListView';
import TerrainFormView from './TerrainFormView';
import type { OrderedEntry } from './TerrainListView';
import type { FormState } from './TerrainFormView';

const BUILTIN_IDS = ['grass', 'farm', 'forest', 'mountain', 'lake', 'ocean'] as const;

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

const DEFAULT_FORM: FormState = {
  name: 'New Terrain',
  color: '#8B6914',
  patternKey: 'grass' as PatternKey,
  isDeepWater: false,
  icon: '',
};

type ModalView = 'list' | 'form';
type FormMode = 'add' | 'edit';

interface Props {
  onClose: () => void;
}

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
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const orderedList: OrderedEntry[] = order
    .map((id): OrderedEntry | null => {
      const builtin = BUILTIN_IDS.find((bid) => {
        return bid === id;
      });
      if (builtin) {
        const td = theme.terrain[builtin];
        return {
          id,
          color: td.color,
          Icon:
            (theme.icons.terrain[builtin] as React.ComponentType<React.SVGProps<SVGSVGElement>>) ??
            null,
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
    .filter((x): x is OrderedEntry => {
      return x !== null;
    });

  BUILTIN_IDS.forEach((bid) => {
    if (!order.includes(bid)) {
      const td = theme.terrain[bid];
      orderedList.push({
        id: bid,
        color: td.color,
        Icon:
          (theme.icons.terrain[bid] as React.ComponentType<React.SVGProps<SVGSVGElement>>) ?? null,
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
      const count = Object.values(tiles).filter((tile) => {
        return tile.terrain === id;
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
    const count = Object.values(tiles).filter((tile) => {
      return tile.terrain === id;
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
    const sanitised = { ...form, color: form.color.trim() };
    if (formMode === 'edit' && editingId) {
      dispatch(updateCustomTerrain({ id: editingId, ...sanitised }));
    } else {
      dispatch(addCustomTerrain({ id: generateId('terrain'), ...sanitised }));
    }
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
              <IconBtn onClick={onClose}>
                <CloseIcon width="1em" height="1em" aria-hidden />
              </IconBtn>
            </ModalHeader>
            <TerrainListView
              orderedList={orderedList}
              disabled={disabled}
              custom={custom}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onToggleBuiltin={handleToggleBuiltin}
              onDeleteCustom={handleDeleteCustom}
              onOpenEditForm={openEditForm}
              onOpenAddForm={openAddForm}
            />
          </>
        ) : (
          <>
            <ModalHeader>
              <IconBtn
                onClick={() => {
                  setView('list');
                }}
              >
                {t('terrainConfig.back')}
              </IconBtn>
              <ModalTitle>
                {formMode === 'add'
                  ? t('terrainConfig.newTerrainTitle')
                  : t('terrainConfig.editTerrainTitle')}
              </ModalTitle>
              <IconBtn onClick={onClose}>
                <CloseIcon width="1em" height="1em" aria-hidden />
              </IconBtn>
            </ModalHeader>
            <TerrainFormView
              form={form}
              setForm={setForm}
              formMode={formMode}
              onSave={handleSave}
            />
          </>
        )}
      </ModalCard>
    </ModalBackdrop>
  );
};

export default TerrainConfigModal;
