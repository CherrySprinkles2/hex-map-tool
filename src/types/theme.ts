import type React from 'react';

type SvgIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface IconsMap {
  terrain: Record<string, SvgIcon>;
  features: {
    river: SvgIcon;
    road: SvgIcon;
    port: SvgIcon;
  };
  army: {
    land: SvgIcon;
    naval: SvgIcon;
  };
  town: {
    village: SvgIcon;
    town: SvgIcon;
    city: SvgIcon;
  };
}

export interface TerrainEntry {
  color: string;
  label: string;
}

export interface SurfaceScale {
  // Backgrounds
  base: string;
  subtle: string;
  card: string;
  hoverWeak: string;
  hover: string;
  activeWeak: string;
  active: string;
  // Borders
  borderFaint: string;
  border: string;
  borderMedium: string;
  borderStrong: string;
  borderFocus: string;
  // Dark overlays
  overlayLight: string;
  overlayMedium: string;
  overlayHeavy: string;
}

export interface UiColors {
  success: string;
  successLight: string;
  successImport: string;
  danger: string;
  dangerLight: string;
  paintMode: string;
}

export interface ZIndexScale {
  toggle: number;
  toolbar: number;
  panel: number;
  dropdown: number;
  backdrop: number;
  sheet: number;
  langModal: number;
  modal: number;
}

export interface AppTheme {
  background: string;
  panelBackground: string;
  panelBorder: string;
  text: string;
  textMuted: string;
  accent: string;

  surface: SurfaceScale;
  ui: UiColors;

  terrain: Record<string, TerrainEntry>;

  tileStroke: string;
  selectedStroke: string;
  ghostFill: string;
  ghostStroke: string;

  waterEdge: {
    oceanWidth: number;
    lakeWidth: number;
    opacity: number;
  };

  river: {
    color: string;
    width: number;
    linecap: string;
    tension: number;
    poolRadius: number;
  };

  road: {
    color: string;
    width: number;
    linecap: string;
    tension: number;
    poolRadius: number;
  };

  town: {
    color: string;
    labelColor: string;
    labelShadow: string;
    groundColor: string;
    buildingColor: string;
    streetColor: string;
    courtyardColor: string;
    fortification: {
      none: {
        groundColor: string;
      };
      palisade: {
        wallColor: string;
        wallWidth: number;
        markColor: string;
        markCount: number;
      };
      stone: {
        wallColor: string;
        wallWidth: number;
        markColor: string;
        markCount: number;
      };
    };
    size: {
      village: { radius: number; buildingCount: number };
      town: { radius: number; buildingCount: number };
      city: { radius: number; buildingCount: number };
    };
  };

  garrison: {
    borderColor: string;
    borderWidth: number;
    nameColor: string;
    nameShadow: string;
  };

  port: {
    color: string;
    plankWidth: number;
    pilingWidth: number;
    plankHalf: number;
    pilingLen: number;
  };

  causeway: {
    color: string;
    width: number;
    linecap: string;
    notchColor: string;
    notchWidth: number;
  };

  factionColors: string[];

  selection: {
    fillColor: string;
    hoverAlpha: number;
    pulseMaxAlpha: number;
    pulsePeriodMs: number;
  };

  army: {
    tokenFill: string;
    tokenStroke: string;
    movingColor: string;
    labelFill: string;
    labelStroke: string;
    labelStrokeWidth: number;
    tokenRadius: number;
    stackSpacing: number;
  };

  terrainButtonMix: {
    /** % of the terrain colour kept when mixed with white on hover (lower = more white) */
    hoverPercent: number;
    /** % of the terrain colour kept when mixed with white in the active/selected state */
    activePercent: number;
    /** % of the terrain colour kept when mixed with white on focus-visible */
    focusPercent: number;
  };

  zIndex: ZIndexScale;
  icons: IconsMap;
}
