import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/ThemeSelector";
import { GameTheme, getRandomTheme } from "@/lib/gameThemes";
import { getThemeConfig } from "@/lib/themeConfig";
import { Palette, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { GameSync } from "@/lib/gameSync";

interface StartScreenProps {
  onStart: (name: string, answer: string, theme: GameTheme) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<GameTheme>(getRandomTheme());
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [gameMasterTheme, setGameMasterTheme] = useState<GameTheme | null>(null);
  const [gameConfigThemeId, setGameConfigThemeId] = useState<string | null>(null);

  // Subscribe to game config changes
  useEffect(() => {
    const unsubscribe = GameSync.subscribe((config) => {
      if (config && config.isGameActive) {
        // Additional validation: check if timer hasn't expired
        const remaining = config.gameEndTime ? Math.max(0, Math.floor((config.gameEndTime - Date.now()) / 1000)) : 0;
        if (remaining > 0) {
          setIsGameActive(true);
          setGameConfigThemeId(config.themeId);
          setRemainingTime(remaining);
          // Get the actual theme that will be used (from Game Master settings)
          if (config.themeId) {
            // Map themeId to GameTheme
            const themeMapping: Record<string, GameTheme> = {
              classic: 'ui',
              science: 'alchemist',
              art: 'gardener',
              entrepreneurship: 'explorer'
            };
            const resolvedTheme = themeMapping[config.themeId] || 'ui';
            setGameMasterTheme(resolvedTheme);
          }
        } else {
          // Timer has expired, game is effectively ended
          setIsGameActive(false);
          setRemainingTime(null);
          setGameMasterTheme(null);
          setGameConfigThemeId(null);
        }
      } else {
        setIsGameActive(false);
        setRemainingTime(null);
        setGameMasterTheme(null);
        setGameConfigThemeId(null);
      }
    });
    return unsubscribe;
  }, []);

  // Update remaining time every second when game is active
  useEffect(() => {
    if (!isGameActive) return;
    
    const interval = setInterval(() => {
      const remaining = GameSync.getRemainingTime();
      setRemainingTime(remaining);
      if (remaining <= 0) {
        setIsGameActive(false);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isGameActive]);

  // Real-time name validation
  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (value.length > 50) {
      setNameError("Name must be 50 characters or less");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setError("");
    if (value.trim()) {
      validateName(value);
    } else {
      setNameError("");
    }
  };

  // Determine the effective theme (Game Master's choice overrides player's)
  const effectiveTheme = gameMasterTheme || selectedTheme;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    if (!validateName(name)) {
      return;
    }

    // Check if game master has started the game
    if (!isGameActive) {
      setError("Please wait for the Game Master to start the game before joining.");
      return;
    }

    // Creative moment is optional, use default if empty
    const finalAnswer = answer.trim() || "A moment of creative thinking";
    setError("");
    onStart(name.trim(), finalAnswer, effectiveTheme);
  };

  return (
    <>
      <ThemeSelector
        selectedTheme={selectedTheme}
        onThemeSelect={setSelectedTheme}
        isVisible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden quest-body">
      <div className="quest-ambient" />
      <div className="quest-orb animate-pulse" style={{ top: "12%", left: "8%" }} />
      <div className="quest-orb animate-pulse" style={{ bottom: "8%", right: "10%" }} />

      {/* Form */}
      <div className="max-w-md w-full space-y-4 sm:space-y-8 animate-slide-in relative z-10 mt-16 sm:mt-32 px-2">
        <div className="quest-surface border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-gray-900">
          {/* Game Status Banner */}
          <div 
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border flex items-center gap-3 transition-all ${
              isGameActive 
                ? "bg-white/70 border-purple-200 text-purple-800 shadow-lg"
                : "bg-white/60 border-amber-200 text-amber-800 shadow-lg"
            }`}
            role="status"
            aria-live="polite"
          >
            {isGameActive ? (
              <>
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-purple-600" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Game is Active!</p>
                  <p className="text-xs sm:text-sm opacity-80">
                    Enter your name and join now
                    {remainingTime !== null && remainingTime > 0 && (
                      <span className="ml-2 font-mono">
                        ({Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")} remaining)
                      </span>
                    )}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Waiting for Game Master</p>
                  <p className="text-xs sm:text-sm opacity-80">
                    The game hasn&apos;t started yet. Fill in your details while you wait!
                  </p>
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-800 block">
                Enter Your Name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={() => name.trim() && validateName(name)}
                placeholder="Your name..."
                maxLength={50}
                required
                aria-required="true"
                aria-invalid={nameError ? "true" : "false"}
                aria-describedby={nameError ? "name-error" : undefined}
                className={`w-full px-4 py-3 rounded-lg border bg-white/70 text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                  nameError 
                    ? "border-red-400 focus:ring-red-300 focus:border-red-400" 
                    : "border-purple-200 focus:ring-purple-400 focus:border-purple-300"
                }`}
                autoFocus
              />
              {nameError && (
                <p id="name-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {nameError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-semibold text-gray-800 block">
                Share a Creative Moment (Optional)
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Think of a time when you had a creative idea or solved a problem creatively.
              </p>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setError("");
                }}
                placeholder="E.g., I came up with a new way to organize my study notes..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-white/40 bg-white/70 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-200 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">
                Choose Your Creative World
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 quest-surface border border-white/25 rounded-lg text-sm">
                  <div className="font-medium text-gray-800">
                    {gameConfigThemeId ? getThemeConfig(gameConfigThemeId).gameMasterName : (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))} Theme
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {gameConfigThemeId ? getThemeConfig(gameConfigThemeId).description : (
                      <>
                        {selectedTheme === 'observatory' && 'A cosmic journey through creativity'}
                        {selectedTheme === 'alchemist' && 'Transform ideas through magical alchemy'}
                        {selectedTheme === 'gardener' && 'Grow ideas through organic cultivation'}
                        {selectedTheme === 'explorer' && 'Discover ideas through adventurous exploration'}
                        {selectedTheme === 'ui' && 'Assemble responsive layouts with the modern UI lab palette'}
                      </>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowThemeSelector(true)}
                  variant="outline"
                  className="px-4 py-3 border border-white/40 bg-white/40 hover:bg-white/70"
                  disabled={!!gameConfigThemeId}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {gameConfigThemeId ? "Locked" : "Change"}
                </Button>
              </div>

              {/* Theme Override Notification */}
              {gameConfigThemeId && (
                <div className="quest-surface border border-amber-200 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Theme Override</p>
                      <p className="text-amber-700 mt-1">
                        The Game Master has selected the <strong>{getThemeConfig(gameConfigThemeId).gameMasterName}</strong> theme for this session.
                        Your experience will be synced to ensure consistency.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div 
                className="text-sm text-red-700 quest-surface border border-red-200 rounded-lg p-3 flex items-center gap-2"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isGameActive || !!nameError}
              aria-disabled={!isGameActive || !!nameError}
              className={`w-full font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                isGameActive && !nameError
                  ? "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-xl focus:ring-orange-300"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isGameActive
                ? `Start ${effectiveTheme.charAt(0).toUpperCase() + effectiveTheme.slice(1)} Journey`
                : "Waiting for Game Master..."}
            </button>
            
            {!isGameActive && (
              <p className="text-xs text-center text-gray-500 mt-2">
                The Game Master needs to start the session before you can join.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
