type ScrollToFn = (worldX: number, worldY: number) => void;

let scrollToFn: ScrollToFn | null = null;

export const registerViewportAnimator = (fn: ScrollToFn): void => {
  scrollToFn = fn;
};

export const unregisterViewportAnimator = (): void => {
  scrollToFn = null;
};

export const animateViewportTo = (worldX: number, worldY: number): void => {
  scrollToFn?.(worldX, worldY);
};
