"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PixiJigsawPuzzle, type PixiJigsawLevel } from "@/components/PixiJigsawPuzzle";
import { jigsawThemeConfigs, type JigsawLayoutId } from "@/lib/jigsawThemes";
import { GameSync } from "@/lib/gameSync";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

type LevelsResponse = PixiJigsawLevel[];

export default function PixiJigsawPage() {
  const [levels, setLevels] = useState<LevelsResponse>([]);
  const [levelId, setLevelId] = useState<string>("auroraGrove");
  const [text, setText] = useState<string>("");
  const [resetKey, setResetKey] = useState(0);
  const [gameConfig, setGameConfig] = useState<ReturnType<typeof GameSync.getConfig> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/levels/levels.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load levels: ${res.status}`);
        const data = (await res.json()) as LevelsResponse;
        if (cancelled) return;
        setLevels(data);
        const initial = data.find((l) => l.id === levelId) ?? data[0];
        if (initial) {
          setLevelId(initial.id);
          setText(initial.text ?? "");
        }
      } catch (e) {
        console.error(e);
        toast.error("Could not load Pixi jigsaw levels.");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to game config changes for jigsaw layout sync
  useEffect(() => {
    const unsubscribe = GameSync.subscribe((config) => {
      setGameConfig(config);
    });
    return unsubscribe;
  }, []);

  const level = useMemo(() => levels.find((l) => l.id === levelId) ?? null, [levels, levelId]);

  // Use game master's selected jigsaw layout if available, otherwise use level's default
  const layoutId = useMemo(() => {
    const gameMasterLayout = gameConfig?.jigsawLayout as JigsawLayoutId;
    if (gameMasterLayout && jigsawThemeConfigs[gameMasterLayout]) {
      return gameMasterLayout;
    }
    return (level?.layoutId ?? "auroraGrove") as JigsawLayoutId;
  }, [gameConfig?.jigsawLayout, level?.layoutId]);

  const layout = jigsawThemeConfigs[layoutId] ?? jigsawThemeConfigs.auroraGrove;

  useEffect(() => {
    const next = levels.find((l) => l.id === levelId) ?? null;
    if (!next) return;
    setText(next.text ?? "");
  }, [levelId, levels]);

  return (
    <div
      className="min-h-screen px-4 py-10 sm:py-12"
      style={{
        backgroundImage: layout.backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div
          className="rounded-3xl border-2 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
          style={{
            borderColor: layout.accentColors.primary,
            background: "linear-gradient(135deg, rgba(3,7,18,0.85), rgba(15,23,42,0.65))",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-5 justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.45em] text-white/70 flex items-center gap-2">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                PixiJS Jigsaw (Interlocking + Snapping)
                {gameConfig?.jigsawLayout && (
                  <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                    Game Master Synced
                  </span>
                )}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{layout.name}</h1>
              <p className="text-sm sm:text-base text-white/80 max-w-3xl">{layout.description}</p>
              <p className="text-xs text-white/70 italic">“{layout.mantra}”</p>
              {gameConfig?.jigsawLayout && (
                <p className="text-xs text-amber-300/80 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Layout synced from Game Master
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {layout.accentColors.palette.map((color) => (
                <span
                  key={color}
                  className="h-10 w-10 rounded-full shadow-lg border border-white/30"
                  style={{ background: color }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-1 bg-white/95 backdrop-blur-md border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle>Level Settings</CardTitle>
              <CardDescription>
                {gameConfig?.jigsawLayout
                  ? "Layout is controlled by the Game Master. Edit the text and drag pieces together. Pieces snap to each other and to the board."
                  : "Choose a themed layout, edit the text, then drag pieces together. Pieces snap to each other (and to the board)."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2" htmlFor="pixi-level">
                  Level
                  {gameConfig?.jigsawLayout && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      Locked by Game Master
                    </span>
                  )}
                </label>
                <select
                  id="pixi-level"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  disabled={!!gameConfig?.jigsawLayout}
                >
                  {levels.map((lv) => (
                    <option key={lv.id} value={lv.id}>
                      {lv.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="pixi-text">
                  Puzzle text (dynamic)
                </label>
                <textarea
                  id="pixi-text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[140px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setResetKey((k) => k + 1)}
                  className="w-full"
                >
                  Shuffle / Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setText(level?.text ?? "");
                    setResetKey((k) => k + 1);
                  }}
                  className="w-full"
                  disabled={!level}
                >
                  Restore text
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tip: On mobile, use one finger to drag pieces. The canvas uses <span className="font-semibold">touch-action: none</span>{" "}
                to prevent accidental scrolling while dragging.
              </p>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-3">
            <div
              className="rounded-2xl border-4 shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden bg-black/30 backdrop-blur-md"
              style={{
                borderColor: layout.accentColors.primary,
              }}
            >
              <div
                className="p-3 sm:p-4"
                style={{
                  background: layout.overlayGradient,
                }}
              >
                <PixiJigsawPuzzle
                  key={`${levelId}:${layoutId}:${resetKey}:${text.length}`}
                  levelId={levelId}
                  rows={level?.rows ?? 3}
                  cols={level?.cols ?? 4}
                  text={text}
                  theme={{
                    accentPrimary: layout.accentColors.primary,
                    accentSecondary: layout.accentColors.secondary,
                    glow: layout.accentColors.glow,
                    overlayGradient: layout.overlayGradient,
                  }}
                  layoutId={layoutId}
                  className="mx-auto"
                  onComplete={() => toast.success("Puzzle complete!")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-transparent px-4 py-3 text-white/90 backdrop-blur-md">
                <div className="text-sm font-semibold">Interlocking shapes</div>
                <p className="text-xs text-white/70 mt-1">Bezier-style tabs/slots, with consistent neighbor edges.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-transparent px-4 py-3 text-white/90 backdrop-blur-md">
                <div className="text-sm font-semibold">Piece-to-piece snapping</div>
                <p className="text-xs text-white/70 mt-1">Pieces merge into clusters as you connect neighbors.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-transparent px-4 py-3 text-white/90 backdrop-blur-md">
                <div className="text-sm font-semibold">Celebration</div>
                <p className="text-xs text-white/70 mt-1">A quick pulse + confetti when everything locks in.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-white/70 text-xs">
          This is a PixiJS-powered jigsaw demo page. Your main game mode remains under <span className="font-semibold">/play</span>.
        </div>
      </div>
    </div>
  );
}


