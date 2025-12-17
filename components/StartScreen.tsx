import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/ThemeSelector";
import { GameTheme, getRandomTheme } from "@/lib/gameThemes";
import { Palette, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

  // Subscribe to game config changes
  useEffect(() => {
    const unsubscribe = GameSync.subscribe((config) => {
      if (config && config.isGameActive) {
        setIsGameActive(true);
        if (config.gameEndTime) {
          const remaining = Math.max(0, Math.floor((config.gameEndTime - Date.now()) / 1000));
          setRemainingTime(remaining);
        }
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
        setIsGameActive(false);
        setRemainingTime(null);
        setGameMasterTheme(null);
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
      <div
        className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden"
        style={{
          background: "radial-gradient(circle at 20% 20%, #fef3c7 0%, #bfdbfe 45%, #ecfccb 85%)",
        }}
      >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>

      {/* Form */}
      <div className="max-w-md w-full space-y-4 sm:space-y-8 animate-slide-in relative z-10 mt-16 sm:mt-32 px-2">
        <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
          {/* Game Status Banner */}
          <div 
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
              isGameActive 
                ? "bg-green-50 border-green-400 text-green-800" 
                : "bg-amber-50 border-amber-400 text-amber-800"
            }`}
            role="status"
            aria-live="polite"
          >
            {isGameActive ? (
              <>
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" aria-hidden="true" />
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
                className={`w-full px-4 py-3 rounded-lg border-2 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 transition-all ${
                  nameError 
                    ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
                    : "border-blue-200 focus:ring-blue-400 focus:border-blue-400"
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
                className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">
                Choose Your Creative World
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm">
                  <div className="font-medium text-gray-800">{selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)} Theme</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {selectedTheme === 'observatory' && 'A cosmic journey through creativity'}
                    {selectedTheme === 'alchemist' && 'Transform ideas through magical alchemy'}
                    {selectedTheme === 'gardener' && 'Grow ideas through organic cultivation'}
                    {selectedTheme === 'explorer' && 'Discover ideas through adventurous exploration'}
                    {selectedTheme === 'ui' && 'Assemble responsive layouts with the modern UI lab palette'}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowThemeSelector(true)}
                  variant="outline"
                  className="px-4 py-3 border-2 border-blue-300 hover:bg-blue-50"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Change
                </Button>
              </div>

              {/* Theme Override Notification */}
              {gameMasterTheme && gameMasterTheme !== selectedTheme && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Theme Override</p>
                      <p className="text-amber-700 mt-1">
                        The Game Master has selected the <strong>{gameMasterTheme.charAt(0).toUpperCase() + gameMasterTheme.slice(1)}</strong> theme for this session.
                        Your selection will be overridden to ensure consistency.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div 
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
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
