// React-component wrappers for the terrain pattern SVGs. CRA's SVGR pipeline
// exposes the `ReactComponent` named export for each .svg file, giving us
// prop-based extension (fill, stroke, className, width, height, …) for free.
// The same files are also imported as URLs by `patternCache.ts` to rasterise
// them into canvas patterns — don't rename the .svg files without updating
// both import styles.
export { ReactComponent as GrassPattern } from './grass.svg';
export { ReactComponent as FarmPattern } from './farm.svg';
export { ReactComponent as ForestPattern } from './forest.svg';
export { ReactComponent as MountainPattern } from './mountain.svg';
export { ReactComponent as LakePattern } from './lake.svg';
export { ReactComponent as OceanPattern } from './ocean.svg';
export { ReactComponent as DesertPattern } from './desert.svg';
export { ReactComponent as SwampPattern } from './swamp.svg';
export { ReactComponent as JunglePattern } from './jungle.svg';
export { ReactComponent as HillsPattern } from './hills.svg';
export { ReactComponent as BadlandsPattern } from './badlands.svg';
