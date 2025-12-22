import { useState, useEffect } from 'react';
import { themes, PuzzleTheme } from '@/lib/themes';
import { PuzzleBoard } from '@/lib/../components/PuzzleBoard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Info, Sparkles, RefreshCw, Maximize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GameMasterPanel } from '@/components/GameMasterPanel';

export default function Home() {
  const [activeTheme, setActiveTheme] = useState<PuzzleTheme>(themes[0]);
  const [difficulty, setDifficulty] = useState<{rows: number, cols: number}>({ rows: 3, cols: 4 });
  const [key, setKey] = useState(0); // To force reset puzzle
  const [isPlayerMode, setIsPlayerMode] = useState(false);

  // Update body data-theme attribute when theme changes
  useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme.id);
  }, [activeTheme]);

  const handleThemeChange = (theme: PuzzleTheme) => {
    setActiveTheme(theme);
    setKey(prev => prev + 1);
  };

  const handleQuotesChange = (newQuotes: string[]) => {
    setActiveTheme(prev => ({ ...prev, quotes: newQuotes }));
    setKey(prev => prev + 1);
  };

  const handleDifficultyChange = (rows: number, cols: number) => {
    setDifficulty({ rows, cols });
    setKey(prev => prev + 1);
  };

  const resetPuzzle = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Game Master Panel */}
      {!isPlayerMode && (
        <GameMasterPanel 
          activeTheme={activeTheme}
          onThemeChange={handleThemeChange}
          onQuotesChange={handleQuotesChange}
          onLaunch={() => setIsPlayerMode(true)}
        />
      )}
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-black/60" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--magical-glow)] opacity-10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--primary)] opacity-10 blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center glass-panel border-b-0 rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Sparkles className="w-6 h-6 text-[var(--magical-glow)]" />
          </div>
          <div>
            <h1 className="text-3xl font-fantasy text-white glow-text tracking-wider">Puzzle Quest</h1>
            <p className="text-xs text-white/60 font-body tracking-widest uppercase">The Ethereal Codex</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2 bg-black/30 p-1 rounded-lg border border-white/10">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("text-xs hover:bg-white/10", difficulty.rows === 3 && "bg-white/10 text-[var(--magical-glow)]")}
              onClick={() => handleDifficultyChange(3, 4)}
            >
              Novice (12)
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("text-xs hover:bg-white/10", difficulty.rows === 4 && "bg-white/10 text-[var(--magical-glow)]")}
              onClick={() => handleDifficultyChange(4, 6)}
            >
              Adept (24)
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("text-xs hover:bg-white/10", difficulty.rows === 6 && "bg-white/10 text-[var(--magical-glow)]")}
              onClick={() => handleDifficultyChange(6, 8)}
            >
              Master (48)
            </Button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="glass-button rounded-full">
                <Info className="w-4 h-4 text-white" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel text-white border-white/20">
              <DialogHeader>
                <DialogTitle className="font-fantasy text-2xl text-[var(--magical-glow)]">About the Codex</DialogTitle>
                <DialogDescription className="text-white/70">
                  Welcome to Puzzle Quest. Select a realm from the Ethereal Codex to begin your journey. 
                  Reassemble the fractured memories to reveal the ancient wisdom hidden within.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <h3 className="font-bold text-[var(--magical-accent)]">How to Play</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-white/80">
                  <li>Drag pieces to move them around the board.</li>
                  <li>Pieces will magically snap into place when near their correct position.</li>
                  <li>Complete the image to reveal the full prophecy.</li>
                  <li>Each piece holds a fragment of wisdom—read them as you play.</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar / Theme Selector - Hidden in Player Mode */}
        {!isPlayerMode && (
          <aside className="w-full lg:w-80 glass-panel border-l-0 border-t-0 border-b-0 flex flex-col z-20">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-fantasy text-[var(--magical-accent)] flex items-center gap-2">
                <Maximize2 className="w-4 h-4" /> Realms
              </h2>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme)}
                    className={cn(
                      "w-full group relative overflow-hidden rounded-xl border transition-all duration-300 text-left",
                      activeTheme.id === theme.id 
                        ? "border-[var(--magical-glow)] shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-[1.02]" 
                        : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                    )}
                  >
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors z-10" />
                    <img 
                      src={theme.image} 
                      alt={theme.name} 
                      className="w-full h-24 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 z-20 p-3 flex flex-col justify-end">
                      <h3 className={cn(
                        "font-fantasy text-lg transition-colors",
                        activeTheme.id === theme.id ? "text-[var(--magical-glow)] glow-text" : "text-white"
                      )}>
                        {theme.name}
                      </h3>
                      {activeTheme.id === theme.id && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="h-0.5 w-full bg-[var(--magical-glow)] mt-1 shadow-[0_0_5px_var(--magical-glow)]"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Main Puzzle Area */}
        <section className="flex-1 relative flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-5xl flex flex-col items-center gap-6">
            
            {/* Theme Description */}
            <div className="text-center space-y-2 mb-2">
              <h2 className="text-4xl font-fantasy text-white glow-text drop-shadow-lg">
                {activeTheme.name}
              </h2>
              <p className="text-white/80 font-body max-w-2xl mx-auto italic border-l-2 border-[var(--magical-accent)] pl-4">
                "{activeTheme.description}"
              </p>
            </div>

            {/* Puzzle Board */}
            <div className="w-full flex justify-center perspective-1000">
              <PuzzleBoard 
                key={key}
                theme={activeTheme} 
                rows={difficulty.rows} 
                cols={difficulty.cols} 
              />
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-4">
              <Button 
                onClick={resetPuzzle}
                variant="outline" 
                className="glass-button text-white border-white/20 hover:bg-white/10 gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reset Realm
              </Button>
              {isPlayerMode && (
                <Button 
                  onClick={() => setIsPlayerMode(false)}
                  variant="ghost" 
                  className="text-white/40 hover:text-white/80 text-xs"
                >
                  Exit Player Mode
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
