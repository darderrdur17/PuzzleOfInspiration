import { useState } from 'react';
import { PuzzleTheme, themes as defaultThemes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Play, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameMasterPanelProps {
  activeTheme: PuzzleTheme;
  onThemeChange: (theme: PuzzleTheme) => void;
  onQuotesChange: (quotes: string[]) => void;
  onLaunch: () => void;
}

export function GameMasterPanel({ 
  activeTheme, 
  onThemeChange, 
  onQuotesChange,
  onLaunch 
}: GameMasterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedQuotes, setEditedQuotes] = useState(activeTheme.quotes.join('\n'));

  const handleSaveQuotes = () => {
    const newQuotes = editedQuotes.split('\n').filter(q => q.trim().length > 0);
    onQuotesChange(newQuotes);
  };

  const handleResetQuotes = () => {
    const originalTheme = defaultThemes.find(t => t.id === activeTheme.id);
    if (originalTheme) {
      setEditedQuotes(originalTheme.quotes.join('\n'));
      onQuotesChange(originalTheme.quotes);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="glass-button bg-black/50 text-[var(--magical-glow)] border-[var(--magical-glow)] hover:bg-black/70 gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
            Game Master
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-panel text-white border-white/20 max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-fantasy text-2xl text-[var(--magical-glow)] flex items-center gap-2">
              <Settings className="w-6 h-6" /> Game Master Control
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex gap-6 overflow-hidden mt-4">
            {/* Theme Selection */}
            <div className="w-1/3 flex flex-col gap-4">
              <h3 className="font-bold text-[var(--magical-accent)]">Select Realm</h3>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {defaultThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        onThemeChange(theme);
                        setEditedQuotes(theme.quotes.join('\n'));
                      }}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3",
                        activeTheme.id === theme.id 
                          ? "border-[var(--magical-glow)] bg-white/10 shadow-[0_0_10px_var(--magical-glow)]" 
                          : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      <img 
                        src={theme.image} 
                        alt={theme.name} 
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <div className={cn(
                          "font-fantasy text-sm",
                          activeTheme.id === theme.id ? "text-[var(--magical-glow)]" : "text-white"
                        )}>
                          {theme.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Quote Editor */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[var(--magical-accent)]">Edit Wisdom Fragments</h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleResetQuotes}
                    className="text-white/60 hover:text-white"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Reset
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveQuotes}
                    className="bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white"
                  >
                    <Save className="w-3 h-3 mr-1" /> Apply Changes
                  </Button>
                </div>
              </div>
              <p className="text-xs text-white/60">Enter one quote per line. These will be distributed across the puzzle pieces.</p>
              <Textarea 
                value={editedQuotes}
                onChange={(e) => setEditedQuotes(e.target.value)}
                className="flex-1 bg-black/30 border-white/10 text-white font-mono text-sm resize-none focus:ring-[var(--magical-glow)]"
                placeholder="Enter quotes here..."
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
            <Button 
              size="lg" 
              onClick={() => {
                setIsOpen(false);
                onLaunch();
              }}
              className="bg-[var(--magical-glow)] text-black hover:bg-[var(--magical-glow)]/90 font-bold shadow-[0_0_20px_var(--magical-glow)]"
            >
              <Play className="w-5 h-5 mr-2" /> Launch Player Mode
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
