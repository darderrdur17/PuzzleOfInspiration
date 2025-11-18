import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div 
      className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden"
      style={{ 
        backgroundImage: 'url(/6.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Form */}
      <div className="max-w-md w-full space-y-4 sm:space-y-8 animate-slide-in relative z-10 mt-16 sm:mt-32 px-2">
        <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
