export const patternMarkColor = (baseColor: string, opacity = 0.25): string => {
  const hex = baseColor.trim().replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const mark = luminance > 0.5 ? '0,0,0' : '255,255,255';
  return `rgba(${mark},${opacity})`;
};
