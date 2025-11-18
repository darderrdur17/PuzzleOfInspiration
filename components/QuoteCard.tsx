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
        "bg-card border-2 rounded-lg p-4 transition-all",
        {
          "border-primary shadow-lg": quote.id === "user-answer",
          "border-border hover:border-accent": quote.id !== "user-answer" && !isPlaced,
          "opacity-50 scale-95": isDragging,
          "border-green-500 bg-green-50 dark:bg-green-950": isPlaced,
        }
      )}
    >
      <p className="text-sm text-foreground mb-2 leading-relaxed">
        &quot;{quote.text}&quot;
      </p>
      <p className="text-xs text-muted-foreground font-medium">
        — {quote.author}
      </p>
      {quote.id === "user-answer" && (
        <div className="mt-2 text-xs text-primary font-semibold">
          Your Answer
        </div>
      )}
    </div>
  );
}

