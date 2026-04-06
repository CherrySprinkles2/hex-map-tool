export interface TerrainEntry {
  color: string;
  label: string;
  icon: string;
}

export interface ZIndexScale {
  toggle: number;
  toolbar: number;
  panel: number;
  backdrop: number;
  sheet: number;
}

export interface AppTheme {
  background: string;
  panelBackground: string;
  panelBorder: string;
  text: string;
  textMuted: string;
  accent: string;

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
    wallColor: string;
    wallWidth: number;
    palisadeColor: string;
    groundColor: string;
    buildingColor: string;
    brickColor: string;
    palisadeMarkColor: string;
    brickCount: number;
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

  army: {
    tokenFill: string;
    tokenStroke: string;
    selectedColor: string;
    movingColor: string;
    labelFill: string;
    labelStroke: string;
    labelStrokeWidth: number;
    ringDash: string;
    tokenRadius: number;
    ringRadius: number;
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
}
