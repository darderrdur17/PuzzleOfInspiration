"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Target, Trophy, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GameGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card border-2 border-border rounded-xl shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Game Guide</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4 border-t border-border">
          {/* How to Play */}
          <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              How to Play
            </h3>
            <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
              <li>Drag phase titles to the correct geese above the elephant</li>
              <li>Drag quotes to the correct drop zones on the elephant body</li>
              <li>Place your creative moment in the <strong>Incubation</strong> phase</li>
              <li>Wrong placements return to the box - try again!</li>
            </ol>
          </div>

          {/* Scoring */}
          <div>
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Scoring
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Correct Quote: <strong>+10 points</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Correct Title: <strong>+20 points</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                <span>Wrong Placement: <strong>-5 points</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚡</span>
                <span>Speed Bonus: Faster = More points!</span>
              </div>
            </div>
          </div>

          {/* The Four Phases */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">The Four Phases</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <div>
                <strong className="text-primary">📚 Preparation:</strong> Gathering information and research
              </div>
              <div>
                <strong className="text-accent">💭 Incubation:</strong> Letting ideas develop subconsciously
              </div>
              <div>
                <strong className="text-yellow-600">💡 Illumination:</strong> The &quot;aha!&quot; moment of insight
              </div>
              <div>
                <strong className="text-muted-foreground">✅ Verification:</strong> Testing and implementing ideas
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> Wrong placements return to the box automatically. Take your time to think about each quote&apos;s meaning!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

