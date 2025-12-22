"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Target, Trophy, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GameGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="quest-surface rounded-xl shadow-xl border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all duration-200 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-purple-300" />
          <span className="font-semibold text-white text-lg">Game Guide</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-purple-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-purple-300" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-5 border-t border-white/10">
          {/* How to Play */}
          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-3 text-base">
              <Target className="w-5 h-5 text-purple-300" />
              How to Play
            </h3>
            <ol className="text-sm text-gray-300 space-y-2 ml-6 list-decimal">
              <li>Drag phase titles to the correct sections on the jigsaw board</li>
              <li>Drag quotes to the correct drop zones matching their creative phase</li>
              <li>Place your creative moment in the <strong className="text-purple-300">Incubation</strong> phase</li>
              <li className="text-orange-300">Wrong placements return automatically - keep trying!</li>
            </ol>
          </div>

          {/* Scoring */}
          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-3 text-base">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Scoring
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex items-center gap-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-green-400 text-lg">✓</span>
                <span>Correct Quote: <strong className="text-green-300">+10 points</strong></span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-green-400 text-lg">✓</span>
                <span>Correct Title: <strong className="text-green-300">+20 points</strong></span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <span className="text-red-400 text-lg">✗</span>
                <span>Wrong Placement: <strong className="text-red-300">-5 points</strong></span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <span className="text-yellow-400 text-lg">⚡</span>
                <span className="text-yellow-200">Speed Bonus: <strong>Faster = More points!</strong></span>
              </div>
            </div>
          </div>

          {/* Hint System */}
          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-3 text-base">
              <AlertCircle className="w-5 h-5 text-orange-300" />
              Hints & Team Boosts
            </h3>
            <ul className="text-sm text-gray-300 space-y-2 ml-5 list-disc">
              <li>Spend <strong className="text-orange-300">50 points</strong> to unlock a collaborative hint for everyone.</li>
              <li className="text-purple-200">The highlighted phase will glow on every screen until cleared.</li>
              <li>Use hints strategically—points are deducted immediately when triggered.</li>
              <li className="text-yellow-200">Rapid-fire and Double Points rounds stack with hints for epic comebacks!</li>
            </ul>
          </div>

          {/* The Four Phases */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-base">The Four Phases</h3>
            <div className="text-sm text-gray-300 space-y-3">
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <strong className="text-purple-300 text-base">📚 Preparation:</strong>
                <div className="text-gray-400 mt-1">Gathering information and research</div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <strong className="text-blue-300 text-base">💭 Incubation:</strong>
                <div className="text-gray-400 mt-1">Letting ideas develop subconsciously</div>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <strong className="text-yellow-300 text-base">💡 Illumination:</strong>
                <div className="text-gray-400 mt-1">The &ldquo;aha!&rdquo; moment of insight</div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <strong className="text-green-300 text-base">✅ Verification:</strong>
                <div className="text-gray-400 mt-1">Testing and implementing ideas</div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-200">
                <strong className="text-purple-100">Pro Tip:</strong> Wrong placements return automatically. Think deeply about each quote&apos;s creative meaning for the best results!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

