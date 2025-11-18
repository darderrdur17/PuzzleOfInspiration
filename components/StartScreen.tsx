import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb } from "lucide-react";

interface StartScreenProps {
  onStart: (name: string, answer: string) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!answer.trim()) {
      setError("Please share your creative moment");
      return;
    }
    setError("");
    onStart(name.trim(), answer.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-2xl w-full space-y-8 animate-slide-in">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-primary" />
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Puzzle of Inspiration
            </h1>
            <Lightbulb className="w-12 h-12 text-accent" />
          </div>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Explore the four phases of creativity through an interactive jigsaw puzzle experience
          </p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground block">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-semibold text-foreground block">
                Share a Creative Moment
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Think of a time when you had a creative idea or solved a problem creatively. 
                Describe it briefly - this will become your puzzle piece!
              </p>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setError("");
                }}
                placeholder="E.g., I came up with a new way to organize my study notes..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full text-lg py-6"
            >
              Start Puzzle
            </Button>
          </form>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Drag and drop quotes and titles to match the four phases of creativity:</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">Preparation</span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">Incubation</span>
            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full">Illumination</span>
            <span className="px-3 py-1 bg-muted/10 text-muted-foreground rounded-full">Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}

