// React-component wrappers for the terrain pattern SVGs. Vite's SVGR plugin
// transforms `?react` imports to React components with full SVG prop support.
// The same files are also imported as URLs by `patternCache.ts` to rasterise
// them into canvas patterns — don't rename the .svg files without updating
// both import styles.
export { default as GrassPattern } from './grass.svg?react';
export { default as FarmPattern } from './farm.svg?react';
export { default as ForestPattern } from './forest.svg?react';
export { default as MountainPattern } from './mountain.svg?react';
export { default as LakePattern } from './lake.svg?react';
export { default as OceanPattern } from './ocean.svg?react';
export { default as DesertPattern } from './desert.svg?react';
export { default as SwampPattern } from './swamp.svg?react';
export { default as JunglePattern } from './jungle.svg?react';
export { default as HillsPattern } from './hills.svg?react';
export { default as BadlandsPattern } from './badlands.svg?react';
