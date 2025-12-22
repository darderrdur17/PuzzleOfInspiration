import { Button } from "@/components/ui/button";
import { Trophy, Clock, Target, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { PlayerScore } from "@/types/game";

interface EndScreenProps {
  score: number;
  points: number;
  time: number;
  totalQuotes: number;
  onRestart: () => void;
  leaderboard: PlayerScore[];
  showTop5?: boolean;
  userAnswer: string;
}

export function EndScreen({
  score,
  points,
  time,
  totalQuotes,
  onRestart,
  leaderboard,
  showTop5 = false,
  userAnswer,
}: EndScreenProps) {
  const percentage = Math.round((score / totalQuotes) * 100);
  const getPerformanceMessage = () => {
    if (percentage === 100) return "Perfect! You're a creativity master!";
    if (percentage >= 80) return "Excellent work! You understand creativity well!";
    if (percentage >= 60) return "Good job! Keep learning about creativity!";
    return "Nice try! Review the phases and try again!";
  };

  const buildReflectionPrompts = (answer: string) => {
    if (!answer) return [];
    const trimmed = answer.length > 110 ? `${answer.slice(0, 107)}...` : answer;
    return [
      `Where would your creative moment "${trimmed}" fit best in the four phases?`,
      "What actions could move that idea into the Verification phase next week?",
      "Who could you collaborate with to strengthen this idea further?",
    ];
  };

  const reflectionPrompts = buildReflectionPrompts(userAnswer);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 quest-body relative overflow-hidden">
      <div className="quest-ambient" />
      <div className="quest-orb animate-pulse" style={{ top: "12%", left: "10%" }} />
      <div className="quest-orb animate-pulse" style={{ bottom: "10%", right: "8%" }} />
      <div className="max-w-3xl w-full space-y-8 animate-slide-in relative z-10">
        <div className="text-center space-y-4">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Puzzle Complete!
          </h1>
          <p className="text-xl text-gray-300">
            {getPerformanceMessage()}
          </p>
        </div>

        <div className="quest-surface border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 sm:p-6 text-center hover:bg-purple-500/15 transition-all">
              <Target className="w-8 h-8 text-purple-300 mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-purple-200 mb-2">
                {score}/{totalQuotes}
              </div>
              <div className="text-sm text-purple-300/70 mb-2">Correct</div>
              <div className="text-lg font-semibold text-purple-200">
                {percentage}%
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 sm:p-6 text-center hover:bg-yellow-500/15 transition-all">
              <Trophy className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-yellow-200 mb-2">
                {points}
              </div>
              <div className="text-sm text-yellow-300/70">Points</div>
            </div>

            <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 sm:p-6 text-center hover:bg-blue-500/15 transition-all">
              <Clock className="w-8 h-8 text-blue-300 mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-blue-200 mb-2">
                {formatTime(time)}
              </div>
              <div className="text-sm text-blue-300/70">Time</div>
            </div>

            <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4 sm:p-6 text-center hover:bg-green-500/15 transition-all">
              <Trophy className="w-8 h-8 text-green-300 mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-green-200 mb-2">
                #{leaderboard.length > 0 ? leaderboard.findIndex(s => s.points === points && s.time === time) + 1 : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Rank</div>
            </div>
          </div>

          {showTop5 && leaderboard.length > 0 && (
            <div className="mt-8 quest-surface border border-white/25 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                🏆 Top 5 Leaderboard 🏆
              </h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => {
                  const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0
                          ? "bg-amber-100/80 border border-amber-300"
                          : index === 1
                          ? "bg-gray-200/70 border border-gray-400"
                          : index === 2
                          ? "bg-orange-100/80 border border-orange-300"
                          : "bg-white/60 border border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{medal}</span>
                        <span className="font-bold text-lg text-gray-900">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <span className="text-amber-700">{entry.points} pts</span>
                        <span className="text-gray-700">
                          {entry.score}/{totalQuotes}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!showTop5 && leaderboard.length > 0 && (
            <div className="mt-8">
          {reflectionPrompts.length > 0 && (
            <div className="quest-surface border border-white/25 rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-bold text-gray-900">
                Reflection Prompts
              </h3>
              <p className="text-sm text-gray-700">
                Use these to spark a quick discussion or journal entry with the class.
              </p>
              <ul className="list-decimal list-inside space-y-2 text-sm text-gray-900">
                {reflectionPrompts.map((prompt, idx) => (
                  <li key={idx}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}

              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Leaderboard
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      entry.points === points && entry.time === time
                        ? "bg-white/80 border-purple-200"
                        : "bg-white/60 border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-500 w-6">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900">
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-amber-700 font-semibold">
                        {entry.points} pts
                      </span>
                      <span className="text-gray-700">
                        {entry.score}/{totalQuotes}
                      </span>
                      <span className="text-gray-600">
                        {formatTime(entry.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={onRestart}
            size="lg"
            className="w-full text-lg py-6 quest-glass-button bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/50 text-purple-200 hover:text-purple-100 transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}

