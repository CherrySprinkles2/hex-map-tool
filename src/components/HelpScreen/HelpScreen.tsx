import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  HelpOverviewIcon,
  HelpCanvasIcon,
  HelpTerrainIcon,
  HelpRiversRoadsIcon,
  HelpTownsIcon,
  HelpArmiesIcon,
  HelpFactionsIcon,
  HelpSavingIcon,
  HelpShortcutsIcon,
  HelpMapsIcon,
} from '../../assets/icons/help';

// ── Types ─────────────────────────────────────────────────────────────────────

type HelpSectionId =
  | 'overview'
  | 'canvas'
  | 'terrain'
  | 'riversroads'
  | 'towns'
  | 'armies'
  | 'factions'
  | 'saving'
  | 'shortcuts'
  | 'maps';

interface SectionMeta {
  id: HelpSectionId;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  titleKey: string;
  summaryKey: string;
}

const SECTIONS: SectionMeta[] = [
  {
    id: 'overview',
    Icon: HelpOverviewIcon,
    titleKey: 'help.sections.overview.title',
    summaryKey: 'help.sections.overview.summary',
  },
  {
    id: 'canvas',
    Icon: HelpCanvasIcon,
    titleKey: 'help.sections.canvas.title',
    summaryKey: 'help.sections.canvas.summary',
  },
  {
    id: 'terrain',
    Icon: HelpTerrainIcon,
    titleKey: 'help.sections.terrain.title',
    summaryKey: 'help.sections.terrain.summary',
  },
  {
    id: 'riversroads',
    Icon: HelpRiversRoadsIcon,
    titleKey: 'help.sections.riversroads.title',
    summaryKey: 'help.sections.riversroads.summary',
  },
  {
    id: 'towns',
    Icon: HelpTownsIcon,
    titleKey: 'help.sections.towns.title',
    summaryKey: 'help.sections.towns.summary',
  },
  {
    id: 'armies',
    Icon: HelpArmiesIcon,
    titleKey: 'help.sections.armies.title',
    summaryKey: 'help.sections.armies.summary',
  },
  {
    id: 'factions',
    Icon: HelpFactionsIcon,
    titleKey: 'help.sections.factions.title',
    summaryKey: 'help.sections.factions.summary',
  },
  {
    id: 'saving',
    Icon: HelpSavingIcon,
    titleKey: 'help.sections.saving.title',
    summaryKey: 'help.sections.saving.summary',
  },
  {
    id: 'shortcuts',
    Icon: HelpShortcutsIcon,
    titleKey: 'help.sections.shortcuts.title',
    summaryKey: 'help.sections.shortcuts.summary',
  },
  {
    id: 'maps',
    Icon: HelpMapsIcon,
    titleKey: 'help.sections.maps.title',
    summaryKey: 'help.sections.maps.summary',
  },
];

// ── Layout ────────────────────────────────────────────────────────────────────

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: ${({ theme }) => {
    return theme.background;
  }};
  overflow: hidden;
`;

// Full-width bar so the border-bottom spans the entire viewport.
const Header = styled.div`
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-bottom: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  flex-shrink: 0;
  z-index: 10;
`;

// Constrains the header's buttons and title to the page max-width.
const HeaderInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
`;

const HeaderTitle = styled.h1`
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme }) => {
    return theme.text;
  }};
`;

const Breadcrumb = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-weight: 400;
  margin-left: 8px;

  &::before {
    content: '/ ';
  }
`;

const NavBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: ${({ theme }) => {
      return theme.panelBorder;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

// ── Grid view ─────────────────────────────────────────────────────────────────

const GridScroll = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const GridScrollInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px 40px 48px;

  @media (max-width: 600px) {
    padding: 20px 16px 32px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 20px;
  border-radius: 10px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    border-color: ${({ theme }) => {
      return theme.textMuted;
    }};
    background: ${({ theme }) => {
      return theme.panelBorder;
    }};
  }
`;

const CardIcon = styled.div`
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  opacity: 0.85;
`;

const CardTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.03em;
`;

const CardSummary = styled.div`
  font-size: 0.78rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  line-height: 1.45;
`;

// ── Section view ──────────────────────────────────────────────────────────────

const SectionScroll = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const SectionScrollInner = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 36px 40px 48px;

  @media (max-width: 600px) {
    padding: 20px 16px 32px;
  }
`;

// Readable line-length cap for body text within the page-level constraint.
const SectionInner = styled.div`
  max-width: 740px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 24px;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => {
    return theme.text;
  }};
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  border-radius: 8px;
  border: 1.5px dashed
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  padding: 20px 24px;
  margin-bottom: 28px;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.78rem;
  line-height: 1.6;
`;

const PlaceholderTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 6px;
`;

const PlaceholderBody = styled.div`
  line-height: 1.65;
`;

const PlaceholderDimensions = styled.div`
  margin-top: 10px;
  opacity: 0.55;
  font-size: 0.72rem;
`;

const SubHeading = styled.h3`
  margin: 24px 0 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => {
    return theme.text;
  }};
  letter-spacing: 0.02em;
`;

const Para = styled.p`
  margin: 0 0 14px;
  font-size: 0.875rem;
  line-height: 1.65;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
`;

const ShortcutsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-top: 8px;
`;

const ShortcutsTh = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-weight: 600;
`;

const ShortcutsTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  vertical-align: top;
`;

const KeyBadge = styled.code`
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  font-size: 0.8rem;
  color: ${({ theme }) => {
    return theme.text;
  }};
  white-space: nowrap;
`;

const SectionNav = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  gap: 12px;
`;

// ── Section content ───────────────────────────────────────────────────────────

// ── Image placeholder descriptions ───────────────────────────────────────────
//
// Replace each <ImagePlaceholder> entry with:
//   <SectionImage src={importedPng} alt={t('help.imageAlt', { section: '...' })} />
// once screenshots are available. Place PNG files in
//   src/components/HelpScreen/images/
// at the recommended 2× retina resolution listed in each placeholder.
//
// All screenshots should use the dark app theme and a browser window at
// approximately 1400×700px viewport before cropping, so the UI proportions
// match the container aspect ratio.

interface ImageSpec {
  filename: string;
  dimensions: string;
  description: string;
}

const IMAGE_SPECS: Partial<Record<HelpSectionId, ImageSpec>> = {
  overview: {
    filename: 'overview.png',
    dimensions: '1480 × 648 px (2× retina of 740 × 324)',
    description:
      'A full editor view showing a moderately large map with varied terrain — grass, forest, mountain, lake, and ocean tiles visible. ' +
      'A river and road should be visible crossing several tiles, and at least one town with a name label should appear on the canvas. ' +
      'No panels open. The toolbar should be visible at the top. ' +
      'The intent is to show the full scope of the tool at a glance.',
  },
  canvas: {
    filename: 'canvas.png',
    dimensions: '1480 × 648 px (2× retina of 740 × 324)',
    description:
      'A close-up of the hex grid showing three things clearly: ' +
      '(1) at least two faint ghost tiles at the edge of the map, ' +
      '(2) one tile selected and visually highlighted, ' +
      '(3) the tile edit panel open on the right side. ' +
      'The surrounding terrain should show a mix of types so the grid layout is obvious. ' +
      'Crop to show roughly the central third of the editor canvas plus the right panel.',
  },
  terrain: {
    filename: 'terrain.png',
    dimensions: '1480 × 648 px (2× retina of 740 × 324)',
    description:
      'The tile edit panel open on the right, with the Terrain section clearly visible — ' +
      'all terrain type options (icons + labels) should be readable. ' +
      'The selected tile on the canvas should have a distinct terrain type applied (e.g. Forest or Mountain). ' +
      'The canvas behind should show several adjacent tiles with different terrain types ' +
      'so the variety of textures is visible.',
  },
  riversroads: {
    filename: 'rivers-roads.png',
    dimensions: '1480 × 648 px (2× retina of 740 × 324)',
    description:
      'A close-up of the map canvas (no panel open) showing a river and a road running across ' +
      'the same area. Ideally they share at least one tile edge so the offset anchor behaviour ' +
      '(river and road on opposite sides of the edge) is visible. ' +
      'If possible include a water tile with a causeway road crossing it. ' +
      'The paths should be clearly visible — zoom in so individual tiles are at least 80px wide.',
  },
  towns: {
    filename: 'towns.png',
    dimensions: '1480 × 648 px (2× retina of 740 × 324)',
    description:
      'A town tile on the canvas with its name label visible below the settlement icon. ' +
      'The town should border at least one water tile that has a port/dock icon rendered on the shared edge. ' +
      'The town edit panel (or tile edit panel showing town fields) should be open on the right. ' +
      'The town size and fortification fields should be readable in the panel.',
  },
  armies: {
    filename: 'armies.png',
    dimensions: '1480 × 648 px (2× retina of 740 × 324)',
    description:
      'A town tile on the canvas with a garrison visual — the settlement icon should show the ' +
      'garrisoned state (castle/fort appearance with the garrison ring). ' +
      'The army panel should be open on the LEFT side of the screen showing the army name and ' +
      'composition fields with example values filled in. ' +
      'The army name should also be visible above the town icon on the canvas.',
  },
  factions: {
    filename: 'factions.png',
    dimensions: '1480 × 648 px (2× retina of 740 × 324)',
    description:
      'The editor in Faction mode. At least two distinct faction colours should be painted ' +
      'across different areas of the map — the colour tint over terrain tiles should be clearly visible. ' +
      'The faction paint panel should be visible on the right, showing two or more faction entries ' +
      'with their colour swatches. ' +
      'Ideally the two painted territories share a border so the division is obvious.',
  },
  maps: {
    filename: 'home-screen.png',
    dimensions: '1480 × 648 px (2× retina of 740 × 324)',
    description:
      'The home screen (not the editor) showing: ' +
      '(1) the New Map dashed card on the left, ' +
      '(2) two or three user map cards with names and "Edited X ago" timestamps, ' +
      '(3) the two built-in example map cards with their "Example" badges. ' +
      'The full header (title, Import button, language toggle) should be visible at the top.',
  },
};

const renderImage = (sectionId: HelpSectionId): React.ReactElement => {
  const spec = IMAGE_SPECS[sectionId];
  if (!spec) return <></>;
  return (
    <ImagePlaceholder>
      <PlaceholderTitle>Screenshot placeholder — {spec.filename}</PlaceholderTitle>
      <PlaceholderBody>{spec.description}</PlaceholderBody>
      <PlaceholderDimensions>Recommended: {spec.dimensions}</PlaceholderDimensions>
    </ImagePlaceholder>
  );
};

const SectionContent = ({ sectionId }: { sectionId: HelpSectionId }): React.ReactElement => {
  const { t: tTyped } = useTranslation();
  // Dynamic section keys are constructed at runtime from the validated sectionId.
  // The keys are guaranteed to exist in both locale files; cast to bypass
  // react-i18next's static key inference which does not support template literals.
  const t = tTyped as unknown as (key: string) => string;
  const s = `help.sections.${sectionId}`;

  switch (sectionId) {
    case 'overview':
      return (
        <>
          {renderImage(sectionId)}
          <Para>{t(`${s}.para1`)}</Para>
          <Para>{t(`${s}.para2`)}</Para>
          <Para>{t(`${s}.para3`)}</Para>
        </>
      );

    case 'canvas':
      return (
        <>
          {renderImage(sectionId)}
          <SubHeading>{t(`${s}.heading1`)}</SubHeading>
          <Para>{t(`${s}.para1`)}</Para>
          <Para>{t(`${s}.para2`)}</Para>
          <SubHeading>{t(`${s}.heading2`)}</SubHeading>
          <Para>{t(`${s}.para3`)}</Para>
          <SubHeading>{t(`${s}.heading3`)}</SubHeading>
          <Para>{t(`${s}.para4`)}</Para>
        </>
      );

    case 'terrain':
      return (
        <>
          {renderImage(sectionId)}
          <SubHeading>{t(`${s}.heading1`)}</SubHeading>
          <Para>{t(`${s}.para1`)}</Para>
          <Para>{t(`${s}.para2`)}</Para>
          <SubHeading>{t(`${s}.heading2`)}</SubHeading>
          <Para>{t(`${s}.para3`)}</Para>
          <SubHeading>{t(`${s}.heading3`)}</SubHeading>
          <Para>{t(`${s}.para4`)}</Para>
        </>
      );

    case 'riversroads':
      return (
        <>
          {renderImage(sectionId)}
          <SubHeading>{t(`${s}.heading1`)}</SubHeading>
          <Para>{t(`${s}.para1`)}</Para>
          <SubHeading>{t(`${s}.heading2`)}</SubHeading>
          <Para>{t(`${s}.para2`)}</Para>
          <SubHeading>{t(`${s}.heading3`)}</SubHeading>
          <Para>{t(`${s}.para3`)}</Para>
        </>
      );

    case 'towns':
      return (
        <>
          {renderImage(sectionId)}
          <SubHeading>{t(`${s}.heading1`)}</SubHeading>
          <Para>{t(`${s}.para1`)}</Para>
          <SubHeading>{t(`${s}.heading2`)}</SubHeading>
          <Para>{t(`${s}.para2`)}</Para>
          <SubHeading>{t(`${s}.heading3`)}</SubHeading>
          <Para>{t(`${s}.para3`)}</Para>
          <SubHeading>{t(`${s}.heading4`)}</SubHeading>
          <Para>{t(`${s}.para4`)}</Para>
          <SubHeading>{t(`${s}.heading5`)}</SubHeading>
          <Para>{t(`${s}.para5`)}</Para>
        </>
      );

    case 'armies':
      return (
        <>
          {renderImage(sectionId)}
          <SubHeading>{t(`${s}.heading1`)}</SubHeading>
          <Para>{t(`${s}.para1`)}</Para>
          <SubHeading>{t(`${s}.heading2`)}</SubHeading>
          <Para>{t(`${s}.para2`)}</Para>
          <SubHeading>{t(`${s}.heading3`)}</SubHeading>
          <Para>{t(`${s}.para3`)}</Para>
          <SubHeading>{t(`${s}.heading4`)}</SubHeading>
          <Para>{t(`${s}.para4`)}</Para>
          <SubHeading>{t(`${s}.heading5`)}</SubHeading>
          <Para>{t(`${s}.para5`)}</Para>
        </>
      );

    case 'factions':
      return (
        <>
          {renderImage(sectionId)}
          <SubHeading>{t(`${s}.heading1`)}</SubHeading>
          <Para>{t(`${s}.para1`)}</Para>
          <SubHeading>{t(`${s}.heading2`)}</SubHeading>
          <Para>{t(`${s}.para2`)}</Para>
          <SubHeading>{t(`${s}.heading3`)}</SubHeading>
          <Para>{t(`${s}.para3`)}</Para>
        </>
      );

    case 'saving':
      return (
        <>
          <SubHeading>{t(`${s}.heading1`)}</SubHeading>
          <Para>{t(`${s}.para1`)}</Para>
          <Para>{t(`${s}.para2`)}</Para>
          <SubHeading>{t(`${s}.heading2`)}</SubHeading>
          <Para>{t(`${s}.para3`)}</Para>
        </>
      );

    case 'shortcuts':
      return (
        <ShortcutsTable>
          <thead>
            <tr>
              <ShortcutsTh>{t('help.sections.shortcuts.colAction')}</ShortcutsTh>
              <ShortcutsTh>{t('help.sections.shortcuts.colDescription')}</ShortcutsTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <ShortcutsTd>
                <KeyBadge>Ctrl+Z</KeyBadge>
              </ShortcutsTd>
              <ShortcutsTd>{t('shortcuts.undo')}</ShortcutsTd>
            </tr>
            <tr>
              <ShortcutsTd>
                <KeyBadge>Ctrl+Y</KeyBadge> / <KeyBadge>Ctrl+Shift+Z</KeyBadge>
              </ShortcutsTd>
              <ShortcutsTd>{t('shortcuts.redo')}</ShortcutsTd>
            </tr>
            <tr>
              <ShortcutsTd>
                <KeyBadge>Escape</KeyBadge>
              </ShortcutsTd>
              <ShortcutsTd>{t('shortcuts.escape')}</ShortcutsTd>
            </tr>
            <tr>
              <ShortcutsTd>
                <KeyBadge>Delete</KeyBadge> / <KeyBadge>Backspace</KeyBadge>
              </ShortcutsTd>
              <ShortcutsTd>{t('shortcuts.delete')}</ShortcutsTd>
            </tr>
            <tr>
              <ShortcutsTd>
                <KeyBadge>R</KeyBadge>
              </ShortcutsTd>
              <ShortcutsTd>{t('shortcuts.resetViewport')}</ShortcutsTd>
            </tr>
          </tbody>
        </ShortcutsTable>
      );

    case 'maps':
      return (
        <>
          {renderImage(sectionId)}
          <SubHeading>{t(`${s}.heading1`)}</SubHeading>
          <Para>{t(`${s}.para1`)}</Para>
          <SubHeading>{t(`${s}.heading2`)}</SubHeading>
          <Para>{t(`${s}.para2`)}</Para>
          <SubHeading>{t(`${s}.heading3`)}</SubHeading>
          <Para>{t(`${s}.para3`)}</Para>
        </>
      );

    default:
      return <></>;
  }
};

// ── Main component ────────────────────────────────────────────────────────────

const HelpScreen = (): React.ReactElement => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { t: tTyped } = useTranslation();
  // Section titleKey / summaryKey are variable strings validated against the locale files
  // at authoring time; cast to bypass react-i18next's static key inference.
  const t = tTyped as unknown as (key: string) => string;

  const validSectionId = section
    ? (SECTIONS.find((s) => {
        return s.id === section;
      })?.id ?? null)
    : null;

  // Redirect unknown section IDs to the grid
  if (section && !validSectionId) {
    return <Navigate to="/help" replace />;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const openSection = (sectionId: HelpSectionId) => {
    navigate(`/help/${sectionId}`);
  };

  if (!section) {
    return (
      <Shell>
        <Header>
          <HeaderInner>
            <NavBtn onClick={handleBack}>{t('help.back')}</NavBtn>
            <HeaderTitle>{t('help.pageTitle')}</HeaderTitle>
          </HeaderInner>
        </Header>
        <GridScroll>
          <GridScrollInner>
            <Grid>
              {SECTIONS.map(({ id, Icon, titleKey, summaryKey }) => {
                return (
                  <Card
                    key={id}
                    onClick={() => {
                      return openSection(id);
                    }}
                  >
                    <CardIcon>
                      <Icon width={40} height={40} />
                    </CardIcon>
                    <CardTitle>{t(titleKey)}</CardTitle>
                    <CardSummary>{t(summaryKey)}</CardSummary>
                  </Card>
                );
              })}
            </Grid>
          </GridScrollInner>
        </GridScroll>
      </Shell>
    );
  }

  // Section view
  const currentIndex = SECTIONS.findIndex((s) => {
    return s.id === section;
  });
  const prevSection = currentIndex > 0 ? SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex < SECTIONS.length - 1 ? SECTIONS[currentIndex + 1] : null;
  const currentMeta = SECTIONS[currentIndex];

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <NavBtn onClick={handleBack}>{t('help.back')}</NavBtn>
          <HeaderTitle>
            {t('help.pageTitle')}
            <Breadcrumb>{t(currentMeta.titleKey)}</Breadcrumb>
          </HeaderTitle>
        </HeaderInner>
      </Header>
      <SectionScroll key={section}>
        <SectionScrollInner>
          <SectionInner>
            <SectionTitle>{t(currentMeta.titleKey)}</SectionTitle>
            <SectionContent sectionId={section as HelpSectionId} />
            <SectionNav>
              <NavBtn
                onClick={() => {
                  return prevSection ? openSection(prevSection.id) : navigate('/help');
                }}
              >
                {prevSection ? `← ${t(prevSection.titleKey)}` : t('help.back')}
              </NavBtn>
              {nextSection && (
                <NavBtn
                  onClick={() => {
                    return openSection(nextSection.id);
                  }}
                >
                  {`${t(nextSection.titleKey)} →`}
                </NavBtn>
              )}
            </SectionNav>
          </SectionInner>
        </SectionScrollInner>
      </SectionScroll>
    </Shell>
  );
};

export default HelpScreen;
