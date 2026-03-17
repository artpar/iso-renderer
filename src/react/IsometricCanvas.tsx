import { useEffect, useRef, useCallback } from 'react';
import { IsoEngine } from '../engine/iso-engine';
import type { IsoMap, IsoCallbacks } from '../types';

export interface IsometricCanvasProps {
  map: IsoMap | null;
  selectedId?: string | null;
  hoveredId?: string | null;
  highlightedIds?: Set<string>;
  callbacks?: IsoCallbacks;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function IsometricCanvas({
  map,
  selectedId = null,
  hoveredId = null,
  highlightedIds,
  callbacks,
  animate = false,
  className,
  style,
}: IsometricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<IsoEngine | null>(null);

  // Create engine on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new IsoEngine({ canvas });
    engineRef.current = engine;

    // Handle resize
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          engine.resize(canvas.width, canvas.height);
          engine.render();
        }
      }
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Feed map
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (map) {
      engine.setMap(map);
      engine.fitBounds(map.bounds);
      engine.render();
    }
  }, [map]);

  // Interaction state
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setSelectedId(selectedId ?? null);
    engine.render();
  }, [selectedId]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setHoveredId(hoveredId ?? null);
    engine.render();
  }, [hoveredId]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setHighlightedIds(highlightedIds ?? new Set());
    engine.render();
  }, [highlightedIds]);

  // Callbacks
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setCallbacks(callbacks ?? {});
  }, [callbacks]);

  // Animation loop
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (animate) {
      engine.startAnimationLoop();
    } else {
      engine.stopAnimationLoop();
    }
    return () => engine.stopAnimationLoop();
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
    />
  );
}
