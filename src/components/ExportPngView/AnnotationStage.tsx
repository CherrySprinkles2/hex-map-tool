import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { DrawStroke } from '../../utils/exportPng';

const Stage = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  touch-action: none;
`;

const StackedCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

interface ImageRect {
  offsetX: number;
  offsetY: number;
  drawW: number;
  drawH: number;
}

interface AnnotationStageProps {
  /** Pre-rendered base map for the currently selected export area. */
  baseCanvas: HTMLCanvasElement | null;
  /** Controlled stroke list. Re-syncs + repaints when the reference changes. */
  strokes: DrawStroke[];
  /** Active brush colour for new strokes. */
  color: string;
  /** Active brush width (fraction of canvas width) for new strokes. */
  width: number;
  /** Fired on pointer-up with the full stroke list (a fresh array). */
  onChange: (strokes: DrawStroke[]) => void;
}

/**
 * Embeddable freehand drawing surface. Shows the base export render letterboxed
 * in its container and captures pointer strokes on a transparent layer above
 * it. Coordinates are normalised (0–1) relative to the rendered base so strokes
 * composite identically onto the full-resolution download.
 */
export const AnnotationStage = ({
  baseCanvas,
  strokes,
  color,
  width,
  onChange,
}: AnnotationStageProps): React.ReactElement => {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const strokeRef = useRef<HTMLCanvasElement | null>(null);
  const rectRef = useRef<ImageRect>({ offsetX: 0, offsetY: 0, drawW: 0, drawH: 0 });
  const currentRef = useRef<DrawStroke | null>(null);

  // Working copy used for rendering. Kept in sync with the controlled prop, but
  // mutated in place during an active stroke for smoothness.
  const strokesRef = useRef<DrawStroke[]>(
    strokes.map((s) => {
      return { ...s, points: [...s.points] };
    })
  );
  // The last array we emitted, so a prop update we caused doesn't trigger a
  // redundant re-sync.
  const lastEmittedRef = useRef<DrawStroke[]>(strokes);

  const colorRef = useRef(color);
  const widthRef = useRef(width);
  colorRef.current = color;
  widthRef.current = width;

  // Map a normalised point to CSS pixels in the displayed image rect.
  const toScreen = useCallback((nx: number, ny: number): { x: number; y: number } => {
    const { offsetX, offsetY, drawW, drawH } = rectRef.current;
    return { x: offsetX + nx * drawW, y: offsetY + ny * drawH };
  }, []);

  // Repaint all committed strokes onto the stroke canvas.
  const repaintStrokes = useCallback(() => {
    const canvas = strokeRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const drawW = rectRef.current.drawW;
    strokesRef.current.forEach((stroke) => {
      if (stroke.points.length === 0) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(1, stroke.width * drawW);
      ctx.beginPath();
      stroke.points.forEach((p, i) => {
        const { x, y } = toScreen(p.x, p.y);
        if (i === 0) {
          ctx.moveTo(x, y);
          if (stroke.points.length === 1) ctx.lineTo(x + 0.01, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });
  }, [toScreen]);

  // Lay out both canvases for the current container size, fitting the base
  // map (letterboxed, centred) and repainting the strokes on top.
  const layout = useCallback(() => {
    const area = areaRef.current;
    const base = baseRef.current;
    const stroke = strokeRef.current;
    if (!area || !base || !stroke) return;
    const dpr = window.devicePixelRatio || 1;
    const boxW = area.clientWidth;
    const boxH = area.clientHeight;
    [base, stroke].forEach((c) => {
      c.width = Math.round(boxW * dpr);
      c.height = Math.round(boxH * dpr);
    });

    const bctx = base.getContext('2d');
    if (!bctx) return;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, boxW, boxH);

    if (baseCanvas && baseCanvas.width > 0 && baseCanvas.height > 0) {
      const fit = Math.min(boxW / baseCanvas.width, boxH / baseCanvas.height);
      const drawW = baseCanvas.width * fit;
      const drawH = baseCanvas.height * fit;
      const offsetX = (boxW - drawW) / 2;
      const offsetY = (boxH - drawH) / 2;
      rectRef.current = { offsetX, offsetY, drawW, drawH };
      bctx.drawImage(baseCanvas, offsetX, offsetY, drawW, drawH);
    } else {
      rectRef.current = { offsetX: 0, offsetY: 0, drawW: boxW, drawH: boxH };
    }
    repaintStrokes();
  }, [baseCanvas, repaintStrokes]);

  useEffect(() => {
    layout();
    window.addEventListener('resize', layout);
    return () => {
      window.removeEventListener('resize', layout);
    };
  }, [layout]);

  // Sync the working copy when the controlled prop changes from outside (undo /
  // redo / clear / area switch) — but not for updates we just emitted ourselves.
  useEffect(() => {
    if (strokes === lastEmittedRef.current) return;
    strokesRef.current = strokes.map((s) => {
      return { ...s, points: [...s.points] };
    });
    currentRef.current = null;
    repaintStrokes();
  }, [strokes, repaintStrokes]);

  // Convert a pointer event to a normalised point clamped within the image rect.
  const toNormalised = (e: React.PointerEvent): { x: number; y: number } | null => {
    const canvas = strokeRef.current;
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    const { offsetX, offsetY, drawW, drawH } = rectRef.current;
    if (drawW <= 0 || drawH <= 0) return null;
    const px = e.clientX - r.left - offsetX;
    const py = e.clientY - r.top - offsetY;
    return {
      x: Math.min(1, Math.max(0, px / drawW)),
      y: Math.min(1, Math.max(0, py / drawH)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const pt = toNormalised(e);
    if (!pt) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    currentRef.current = { color: colorRef.current, width: widthRef.current, points: [pt] };
    strokesRef.current.push(currentRef.current);
    repaintStrokes();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const stroke = currentRef.current;
    if (!stroke) return;
    const pt = toNormalised(e);
    if (!pt) return;
    const prev = stroke.points[stroke.points.length - 1];
    stroke.points.push(pt);
    // Incrementally draw just the new segment for smoothness.
    const ctx = strokeRef.current?.getContext('2d');
    if (!ctx) return;
    const a = toScreen(prev.x, prev.y);
    const b = toScreen(pt.x, pt.y);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = Math.max(1, stroke.width * rectRef.current.drawW);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!currentRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    currentRef.current = null;
    // Emit a fresh array (deep copy) so later drawing can't mutate parent state.
    const next = strokesRef.current.map((s) => {
      return { ...s, points: [...s.points] };
    });
    lastEmittedRef.current = next;
    onChange(next);
  };

  return (
    <Stage ref={areaRef} data-testid="annotation-stage">
      <StackedCanvas ref={baseRef} />
      <StackedCanvas
        ref={strokeRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </Stage>
  );
};
