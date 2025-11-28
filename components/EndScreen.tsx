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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-3xl w-full space-y-8 animate-slide-in">
        <div className="text-center space-y-4">
          <Trophy className="w-20 h-20 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Puzzle Complete!
          </h1>
          <p className="text-xl text-muted-foreground">
            {getPerformanceMessage()}
          </p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary mb-1">
                {score}/{totalQuotes}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
              <div className="text-lg font-semibold text-primary mt-2">
                {percentage}%
              </div>
            </div>

            <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {points}
              </div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>

            <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-3xl font-bold text-accent mb-1">
                {formatTime(time)}
              </div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>

            <div className="bg-secondary/10 border-2 border-secondary rounded-lg p-6 text-center">
              <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-3xl font-bold text-secondary mb-1">
                #{leaderboard.length > 0 ? leaderboard.findIndex(s => s.points === points && s.time === time) + 1 : "—"}
              </div>
              <div className="text-sm text-muted-foreground">Rank</div>
            </div>
          </div>

          {showTop5 && leaderboard.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-500 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
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
                          ? "bg-yellow-500/30 border-2 border-yellow-500"
                          : index === 1
                          ? "bg-gray-300/30 border-2 border-gray-400"
                          : index === 2
                          ? "bg-orange-600/30 border-2 border-orange-600"
                          : "bg-muted/50 border border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{medal}</span>
                        <span className="font-bold text-lg text-foreground">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <span className="text-yellow-600">{entry.points} pts</span>
                        <span className="text-muted-foreground">
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
            <div className="bg-primary/5 border-2 border-primary/40 rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-bold text-foreground">
                Reflection Prompts
              </h3>
              <p className="text-sm text-muted-foreground">
                Use these to spark a quick discussion or journal entry with the class.
              </p>
              <ul className="list-decimal list-inside space-y-2 text-sm text-foreground">
                {reflectionPrompts.map((prompt, idx) => (
                  <li key={idx}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}

              <h3 className="text-lg font-semibold text-foreground mb-4">
                Leaderboard
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.points === points && entry.time === time
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-foreground">
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-yellow-600 font-semibold">
                        {entry.points} pts
                      </span>
                      <span className="text-muted-foreground">
                        {entry.score}/{totalQuotes}
                      </span>
                      <span className="text-muted-foreground">
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
            className="w-full text-lg py-6"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}

