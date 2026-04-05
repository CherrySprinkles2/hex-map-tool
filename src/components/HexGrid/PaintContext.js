import { createContext } from 'react';

// Shared ref for tracking an active paint stroke across HexGrid and its tile children.
// The ref holds { current: boolean } — true while the pointer is held down in a paint mode.
// Using a ref (not state) avoids re-renders on every pointer move.
export const PaintContext = createContext({ current: false });
