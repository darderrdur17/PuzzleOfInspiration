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
    // Creative moment is optional, use default if empty
    const finalAnswer = answer.trim() || "A moment of creative thinking";
    setError("");
    onStart(name.trim(), finalAnswer);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)' }}>
      {/* Elephant Background */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <div className="relative w-full max-w-4xl h-full">
          {/* Elephant outline - simplified SVG representation */}
          <svg 
            viewBox="0 0 400 300" 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-auto opacity-20"
            style={{ maxHeight: '70%' }}
          >
            <path
              d="M 200 250 Q 180 200 150 180 Q 120 160 100 180 Q 80 200 70 220 Q 60 240 80 250 Q 100 260 120 250 Q 140 240 160 250 Q 180 260 200 250 Q 220 260 240 250 Q 260 240 280 250 Q 300 260 320 250 Q 340 240 330 220 Q 320 200 300 180 Q 280 160 250 180 Q 220 200 200 250 Z"
              fill="none"
              stroke="#666"
              strokeWidth="3"
            />
            {/* Elephant trunk */}
            <path
              d="M 200 250 Q 220 240 240 230 Q 250 220 245 210"
              fill="none"
              stroke="#666"
              strokeWidth="3"
            />
          </svg>
          
          {/* Decorative arrows */}
          <div className="absolute top-20 left-10 flex gap-2 opacity-30">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-0 h-0 border-l-8 border-l-amber-600 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl w-full space-y-8 animate-slide-in relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
            Creativity is...
          </h1>
          <p className="text-xl text-gray-700 max-w-lg mx-auto font-medium">
            A Puzzle Game About Creative Thinking
          </p>
        </div>

        <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-800 block">
                Enter Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Your name..."
                className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                autoFocus
              />
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

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

