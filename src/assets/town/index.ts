// React-component wrappers for the canvas town SVGs. Also imported as URLs
// by `drawTowns.ts` to rasterise them into offscreen canvases — don't rename
// the .svg files without updating both import styles.
export { default as VillageArt } from './village.svg?react';
export { default as TownArt } from './town.svg?react';
export { default as CityArt } from './city.svg?react';
