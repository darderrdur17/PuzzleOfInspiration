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
        "bg-card border-2 rounded-lg p-2 sm:p-3 md:p-4 transition-all touch-manipulation",
        {
          "border-primary shadow-lg": quote.id === "user-answer",
          "border-border hover:border-accent": quote.id !== "user-answer" && !isPlaced,
          "opacity-50 scale-95": isDragging,
          "border-green-500 bg-green-50 dark:bg-green-950": isPlaced,
        }
      )}
    >
      <p className="text-xs sm:text-sm text-foreground mb-1 sm:mb-2 leading-relaxed line-clamp-2 sm:line-clamp-none">
        &quot;{quote.text}&quot;
      </p>
      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
        — {quote.author}
      </p>
      {quote.id === "user-answer" && (
        <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-primary font-semibold">
          Your Answer
        </div>
      )}
    </div>
  );
}

