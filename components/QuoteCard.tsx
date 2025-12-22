import { Quote } from "@/types/game";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: Quote;
  isDragging?: boolean;
  isPlaced?: boolean;
}

export function QuoteCard({ quote, isDragging = false, isPlaced = false }: QuoteCardProps) {
  return (
    <div
      className={cn(
        "quest-surface rounded-xl p-3 sm:p-4 md:p-5 transition-all duration-200 touch-manipulation shadow-lg hover:shadow-xl",
        {
          "border-purple-400/50 shadow-purple-400/20 ring-2 ring-purple-400/30": quote.id === "user-answer",
          "border-white/20 hover:border-purple-400/40 hover:shadow-purple-400/10": quote.id !== "user-answer" && !isPlaced,
          "opacity-60 scale-95 shadow-inner": isDragging,
          "border-green-400/50 bg-green-500/10 shadow-green-400/20": isPlaced,
        }
      )}
    >
      <p className="text-sm sm:text-base text-white mb-2 sm:mb-3 leading-relaxed line-clamp-2 sm:line-clamp-none font-medium">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-xs sm:text-sm text-gray-300 font-medium">
        — {quote.author}
      </p>
      {quote.id === "user-answer" && (
        <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-purple-300 font-bold">
          Your Answer
        </div>
      )}
    </div>
  );
}

