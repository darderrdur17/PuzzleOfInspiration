"use client";

import { useEffect, useMemo, useRef } from "react";
import * as PIXI from "pixi.js";

type TabSign = -1 | 0 | 1;

type PieceTabs = {
  top: TabSign;
  right: TabSign;
  bottom: TabSign;
  left: TabSign;
};

type Piece = {
  id: string;
  r: number;
  c: number;
  w: number;
  h: number;
  pad: number;
  tabs: PieceTabs;
  correctX: number;
  correctY: number;
  sprite: PIXI.Sprite;
  cluster: PIXI.Container;
};

export type PixiJigsawTheme = {
  accentPrimary: string;
  accentSecondary: string;
  glow: string;
  overlayGradient?: string;
};

export type PixiJigsawLevel = {
  id: string;
  title: string;
  layoutId: string;
  rows: number;
  cols: number;
  text: string;
};

function hexToNumber(hex: string, fallback: number) {
  const clean = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return fallback;
  return parseInt(clean, 16);
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = (text || "").split(/\s+/).filter(Boolean);
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trimEnd(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line.trimEnd(), x, y);
}

function traceJigsawPath(g: PIXI.Graphics, w: number, h: number, tabs: PieceTabs, tabSize: number) {
  const thirdX = w / 3;
  const thirdY = h / 3;
  const tabInset = Math.min(w, h) * 0.12;

  g.moveTo(0, 0);

  // top
  g.lineTo(thirdX, 0);
  if (tabs.top !== 0) {
    const dy = -tabs.top * tabSize;
    g.bezierCurveTo(thirdX + tabInset, 0, w / 2 - tabInset, dy, w / 2, dy);
    g.bezierCurveTo(w / 2 + tabInset, dy, 2 * thirdX - tabInset, 0, 2 * thirdX, 0);
  }
  g.lineTo(w, 0);

  // right
  g.lineTo(w, thirdY);
  if (tabs.right !== 0) {
    const dx = tabs.right * tabSize;
    g.bezierCurveTo(w, thirdY + tabInset, w + dx, h / 2 - tabInset, w + dx, h / 2);
    g.bezierCurveTo(w + dx, h / 2 + tabInset, w, 2 * thirdY - tabInset, w, 2 * thirdY);
  }
  g.lineTo(w, h);

  // bottom
  g.lineTo(2 * thirdX, h);
  if (tabs.bottom !== 0) {
    const dy = tabs.bottom * tabSize;
    g.bezierCurveTo(2 * thirdX - tabInset, h, w / 2 + tabInset, h + dy, w / 2, h + dy);
    g.bezierCurveTo(w / 2 - tabInset, h + dy, thirdX + tabInset, h, thirdX, h);
  }
  g.lineTo(0, h);

  // left
  g.lineTo(0, 2 * thirdY);
  if (tabs.left !== 0) {
    const dx = -tabs.left * tabSize;
    g.bezierCurveTo(0, 2 * thirdY - tabInset, dx, h / 2 + tabInset, dx, h / 2);
    g.bezierCurveTo(dx, h / 2 - tabInset, 0, thirdY + tabInset, 0, thirdY);
  }
  g.lineTo(0, 0);
  g.closePath();
}

function drawJigsawMask(g: PIXI.Graphics, w: number, h: number, tabs: PieceTabs, tabSize: number) {
  g.clear();
  g.beginFill(0xffffff);
  traceJigsawPath(g, w, h, tabs, tabSize);
  g.endFill();
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function PixiJigsawPuzzle({
  levelId,
  rows,
  cols,
  text,
  theme,
  className,
  onComplete,
  layoutId,
}: {
  levelId: string;
  rows: number;
  cols: number;
  text: string;
  theme: PixiJigsawTheme;
  className?: string;
  onComplete?: () => void;
  layoutId?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  const seed = useMemo(() => hashStringToSeed(`${levelId}:${rows}:${cols}`), [levelId, rows, cols]);

  useEffect(() => {
    if (!hostRef.current) return;

    const host = hostRef.current;
    host.innerHTML = "";

    const cssWidth = Math.max(320, host.clientWidth || 960);
    const cssHeight = Math.max(360, Math.floor(cssWidth * 0.62));
    const resolution = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;

    const app = new PIXI.Application({
      width: cssWidth,
      height: cssHeight,
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true,
      resolution,
    });
    appRef.current = app;
    host.appendChild(app.view as unknown as Node);
    (app.view as HTMLCanvasElement).style.width = "100%";
    (app.view as HTMLCanvasElement).style.height = "100%";
    (app.view as HTMLCanvasElement).style.display = "block";

    // Make the entire stage interactive for pointermove/up.
    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;

    const accentPrimary = hexToNumber(theme.accentPrimary, 0x22d3ee);
    const accentSecondary = hexToNumber(theme.accentSecondary, 0xf97316);

    const rng = mulberry32(seed);

    // Compute board sizing.
    const margin = clamp(Math.floor(cssWidth * 0.06), 24, 70);
    const pieceW = Math.floor((cssWidth - margin * 2) / cols);
    const pieceH = Math.floor((cssHeight - margin * 2) / rows);
    const boardW = pieceW * cols;
    const boardH = pieceH * rows;
    const boardX = Math.floor((cssWidth - boardW) / 2);
    const boardY = Math.floor((cssHeight - boardH) / 2);

    // 1) Base texture (canvas) with themed gradient + text.
    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = boardW;
    baseCanvas.height = boardH;
    const ctx = baseCanvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, boardW, boardH);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(1, "#f7f7fb");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, boardW, boardH);

    // Accent wash.
    const accentGrad = ctx.createRadialGradient(boardW * 0.2, boardH * 0.2, 0, boardW * 0.2, boardH * 0.2, Math.max(boardW, boardH) * 0.9);
    accentGrad.addColorStop(0, "rgba(0,0,0,0)");
    accentGrad.addColorStop(1, "rgba(0,0,0,0.06)");
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, boardW, boardH);

    // Text
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.font = `600 ${Math.max(16, Math.floor(Math.min(pieceW, pieceH) * 0.22))}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial`;
    wrapText(ctx, text, boardW / 2, Math.max(40, Math.floor(boardH * 0.12)), boardW - 80, Math.max(24, Math.floor(Math.min(pieceW, pieceH) * 0.28)));

    const baseTexture = PIXI.Texture.from(baseCanvas);

    // 2) Visual board frame + subtle grid.
    const boardFrame = new PIXI.Graphics();
    boardFrame.lineStyle(3, accentPrimary, 0.7);
    boardFrame.beginFill(0x0b1220, 0.22);
    boardFrame.drawRoundedRect(boardX - 10, boardY - 10, boardW + 20, boardH + 20, 18);
    boardFrame.endFill();
    app.stage.addChild(boardFrame);

    const grid = new PIXI.Graphics();
    grid.alpha = 0.18;
    grid.lineStyle(1, accentSecondary, 0.5);
    for (let r = 1; r < rows; r++) {
      grid.moveTo(boardX, boardY + r * pieceH);
      grid.lineTo(boardX + boardW, boardY + r * pieceH);
    }
    for (let c = 1; c < cols; c++) {
      grid.moveTo(boardX + c * pieceW, boardY);
      grid.lineTo(boardX + c * pieceW, boardY + boardH);
    }
    app.stage.addChild(grid);

    // 3) Pieces/clusters layer.
    const clustersLayer = new PIXI.Container();
    app.stage.addChild(clustersLayer);

    // Determine matching tabs across neighbors deterministically.
    const tabRng = mulberry32(seed ^ 0xa5a5a5a5);
    const tabSigns: TabSign[] = [-1, 1];
    const horiz: TabSign[][] = Array.from({ length: rows }, () => Array.from({ length: cols - 1 }, () => tabSigns[Math.floor(tabRng() * 2)]));
    const vert: TabSign[][] = Array.from({ length: rows - 1 }, () => Array.from({ length: cols }, () => tabSigns[Math.floor(tabRng() * 2)]));

    const pieces: Piece[] = [];
    const tabSize = Math.floor(Math.min(pieceW, pieceH) * 0.22);
    const pad = Math.floor(tabSize * 1.45);

    const makePieceTexture = (srcX: number, srcY: number, tabs: PieceTabs) => {
      const w = pieceW + pad * 2;
      const h = pieceH + pad * 2;

      const container = new PIXI.Container();
      const spr = new PIXI.Sprite(baseTexture);
      spr.x = -srcX + pad;
      spr.y = -srcY + pad;
      container.addChild(spr);

      const mask = new PIXI.Graphics();
      mask.x = 0;
      mask.y = 0;
      drawJigsawMask(mask, w, h, tabs, tabSize);
      container.addChild(mask);
      spr.mask = mask;

      const outline = new PIXI.Graphics();
      outline.x = 0;
      outline.y = 0;
      outline.clear();
      outline.lineStyle(3, 0x0b1220, 0.25);
      traceJigsawPath(outline, w, h, tabs, tabSize);
      outline.lineStyle(1.5, 0xffffff, 0.45);
      traceJigsawPath(outline, w, h, tabs, tabSize);
      container.addChild(outline);

      const tex = app.renderer.generateTexture(container, {
        resolution: Math.min(2, resolution),
        region: new PIXI.Rectangle(0, 0, w, h),
      });
      container.destroy({ children: true });
      return tex;
    };

    const randomSpawn = () => {
      // Spawn around the board area, but always within the canvas.
      const edge = rng();
      const xPad = 20;
      const yPad = 20;

      // Four bands: top/bottom/left/right.
      if (edge < 0.25) {
        return { x: rng() * (cssWidth - 2 * xPad) + xPad, y: yPad + rng() * (boardY - yPad) };
      }
      if (edge < 0.5) {
        return { x: rng() * (cssWidth - 2 * xPad) + xPad, y: boardY + boardH + rng() * (cssHeight - (boardY + boardH) - yPad) };
      }
      if (edge < 0.75) {
        return { x: xPad + rng() * (boardX - xPad), y: rng() * (cssHeight - 2 * yPad) + yPad };
      }
      return { x: boardX + boardW + rng() * (cssWidth - (boardX + boardW) - xPad), y: rng() * (cssHeight - 2 * yPad) + yPad };
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tabs: PieceTabs = {
          top: r === 0 ? 0 : (-(vert[r - 1][c] as TabSign) as TabSign),
          right: c === cols - 1 ? 0 : (horiz[r][c] as TabSign),
          bottom: r === rows - 1 ? 0 : (vert[r][c] as TabSign),
          left: c === 0 ? 0 : (-(horiz[r][c - 1] as TabSign) as TabSign),
        };

        const srcX = c * pieceW;
        const srcY = r * pieceH;
        const tex = makePieceTexture(srcX, srcY, tabs);

        const sprite = new PIXI.Sprite(tex);
        sprite.eventMode = "static";
        sprite.cursor = "grab";

        // Correct local position inside the board coordinate system (pad offsets so tabs can protrude).
        const correctX = boardX + c * pieceW - pad;
        const correctY = boardY + r * pieceH - pad;

        const cluster = new PIXI.Container();
        cluster.eventMode = "static";
        const spawn = randomSpawn();
        cluster.x = spawn.x;
        cluster.y = spawn.y;

        sprite.x = correctX;
        sprite.y = correctY;

        cluster.addChild(sprite);
        clustersLayer.addChild(cluster);

        pieces.push({
          id: `p-${r}-${c}`,
          r,
          c,
          w: pieceW,
          h: pieceH,
          pad,
          tabs,
          correctX,
          correctY,
          sprite,
          cluster,
        });
      }
    }

    const clusterPieces = () => {
      const map = new Map<PIXI.Container, Piece[]>();
      for (const p of pieces) {
        const list = map.get(p.cluster) ?? [];
        list.push(p);
        map.set(p.cluster, list);
      }
      return map;
    };

    // Drag state.
    let draggingCluster: PIXI.Container | null = null;
    let draggingPointerId: number | null = null;
    let dragOffset = { x: 0, y: 0 };
    let completed = false;

    const snapThreshold = Math.max(14, Math.floor(Math.min(pieceW, pieceH) * 0.16));

    const mergeClusters = (from: PIXI.Container, into: PIXI.Container) => {
      if (from === into) return;
      const children = [...from.children];
      for (const child of children) {
        const globalPos = (child as PIXI.DisplayObject).getGlobalPosition(new PIXI.Point());
        const localPos = into.toLocal(globalPos);
        child.position.set(localPos.x, localPos.y);
        into.addChild(child);
      }
      from.removeChildren();
      from.destroy();
      // Update piece cluster refs.
      for (const p of pieces) {
        if (p.cluster === from) p.cluster = into;
      }
    };

    const trySnapAndMerge = (active: PIXI.Container) => {
      const clusters = clusterPieces();
      const activePieces = clusters.get(active) ?? [];
      if (!activePieces.length) return false;

      // Try piece-to-piece snap first.
      for (const [otherCluster, otherPieces] of clusters.entries()) {
        if (otherCluster === active) continue;

        for (const a of activePieces) {
          for (const b of otherPieces) {
            const dc = b.c - a.c;
            const dr = b.r - a.r;
            if (Math.abs(dc) + Math.abs(dr) !== 1) continue;

            const expectedDx = b.correctX - a.correctX;
            const expectedDy = b.correctY - a.correctY;

            const aPos = a.sprite.getGlobalPosition(new PIXI.Point());
            const bPos = b.sprite.getGlobalPosition(new PIXI.Point());
            const actualDx = bPos.x - aPos.x;
            const actualDy = bPos.y - aPos.y;

            const err = Math.hypot(actualDx - expectedDx, actualDy - expectedDy);
            if (err <= snapThreshold) {
              // Shift active cluster so A aligns with B.
              const shiftX = (bPos.x - expectedDx) - aPos.x;
              const shiftY = (bPos.y - expectedDy) - aPos.y;
              active.x += shiftX;
              active.y += shiftY;

              // Merge into the other cluster for stability.
              mergeClusters(active, otherCluster);
              return true;
            }
          }
        }
      }

      // Board snap: if any piece is close to its absolute target, snap whole cluster.
      for (const a of activePieces) {
        const aPos = a.sprite.getGlobalPosition(new PIXI.Point());
        const targetX = a.correctX;
        const targetY = a.correctY;
        const err = Math.hypot(aPos.x - targetX, aPos.y - targetY);
        if (err <= snapThreshold) {
          active.x += targetX - aPos.x;
          active.y += targetY - aPos.y;
          return true;
        }
      }
      return false;
    };

    const isSolved = () => {
      const clusters = clusterPieces();
      if (clusters.size !== 1) return false;
      const onlyCluster = clusters.keys().next().value as PIXI.Container | undefined;
      if (!onlyCluster) return false;

      for (const p of pieces) {
        const pos = p.sprite.getGlobalPosition(new PIXI.Point());
        const err = Math.hypot(pos.x - p.correctX, pos.y - p.correctY);
        if (err > 1.2) return false;
      }
      return true;
    };

    const celebrate = () => {
      const burst = new PIXI.Container();
      burst.eventMode = "none";
      app.stage.addChild(burst);

      // Pulse frame.
      let t = 0;
      const pulse = () => {
        t += 0.12;
        boardFrame.alpha = 0.22 + Math.sin(t) * 0.08;
        boardFrame.scale.set(1 + Math.sin(t) * 0.01);
        if (t > Math.PI * 6) {
          app.ticker.remove(pulse);
          boardFrame.alpha = 0.22;
          boardFrame.scale.set(1);
        }
      };
      app.ticker.add(pulse);

      // Confetti.
      const count = 70;
      for (let i = 0; i < count; i++) {
        const rect = new PIXI.Graphics();
        const color = i % 3 === 0 ? accentPrimary : i % 3 === 1 ? accentSecondary : 0xfacc15;
        rect.beginFill(color, 0.95);
        rect.drawRect(0, 0, 6, 10);
        rect.endFill();
        const tex = app.renderer.generateTexture(rect);
        rect.destroy();

        const spr = new PIXI.Sprite(tex);
        spr.anchor.set(0.5);
        spr.x = boardX + rng() * boardW;
        spr.y = boardY - 30 - rng() * 50;
        const vx = (rng() - 0.5) * 6;
        let vy = 1 + rng() * 3.5;
        let rot = (rng() - 0.5) * 0.2;
        burst.addChild(spr);

        const fall = () => {
          spr.x += vx;
          spr.y += vy;
          vy += 0.18;
          spr.rotation += rot;
          spr.alpha *= 0.996;
          if (spr.y > cssHeight + 60 || spr.alpha < 0.05) {
            app.ticker.remove(fall);
            spr.destroy();
          }
        };
        app.ticker.add(fall);
      }
    };

    const bringClusterToFront = (cluster: PIXI.Container) => {
      clustersLayer.setChildIndex(cluster, clustersLayer.children.length - 1);
    };

    // Bind piece handlers.
    for (const p of pieces) {
      p.sprite.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
        if (completed) return;
        draggingCluster = p.cluster;
        draggingPointerId = e.pointerId;
        bringClusterToFront(p.cluster);
        p.sprite.cursor = "grabbing";
        const global = e.global;
        dragOffset = { x: global.x - p.cluster.x, y: global.y - p.cluster.y };
      });
    }

    app.stage.on("pointermove", (e: PIXI.FederatedPointerEvent) => {
      if (!draggingCluster) return;
      if (draggingPointerId !== null && e.pointerId !== draggingPointerId) return;
      const global = e.global;
      draggingCluster.x = global.x - dragOffset.x;
      draggingCluster.y = global.y - dragOffset.y;
    });

    const endDrag = () => {
      if (!draggingCluster) return;
      for (const p of pieces) p.sprite.cursor = "grab";
      const active = draggingCluster;
      draggingCluster = null;
      draggingPointerId = null;

      // Snap chain: allow a couple of merges in one drop to feel satisfying.
      for (let i = 0; i < 3; i++) {
        const clusters = clusterPieces();
        const nextActive = clusters.get(active) ? active : pieces[0]?.cluster;
        if (!nextActive) break;
        if (!trySnapAndMerge(nextActive)) break;
      }

      if (!completed && isSolved()) {
        completed = true;
        celebrate();
        onComplete?.();
        for (const p of pieces) p.sprite.eventMode = "none";
      }
    };

    app.stage.on("pointerup", endDrag);
    app.stage.on("pointerupoutside", endDrag);

    // Cleanup.
    return () => {
      app.stage.removeAllListeners();
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      if (host.firstChild) host.removeChild(host.firstChild);
      appRef.current = null;
    };
  }, [cols, levelId, onComplete, rows, seed, text, theme.accentPrimary, theme.accentSecondary]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        width: "100%",
        maxWidth: 1200,
        aspectRatio: "16 / 10",
        borderRadius: 16,
        overflow: "hidden",
        touchAction: "none",
      }}
    />
  );
}


