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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)' }}>
      {/* Sky Background */}
      <div className="absolute inset-0">
        {/* Clouds */}
        <div className="absolute top-10 left-10 w-32 h-20 bg-white/70 rounded-full opacity-80">
          <div className="absolute -left-8 top-4 w-24 h-16 bg-white/70 rounded-full"></div>
          <div className="absolute -right-8 top-4 w-24 h-16 bg-white/70 rounded-full"></div>
        </div>
        <div className="absolute top-20 right-20 w-40 h-24 bg-white/70 rounded-full opacity-80">
          <div className="absolute -left-10 top-6 w-32 h-20 bg-white/70 rounded-full"></div>
          <div className="absolute -right-10 top-6 w-32 h-20 bg-white/70 rounded-full"></div>
        </div>
        <div className="absolute top-32 left-1/3 w-36 h-22 bg-white/70 rounded-full opacity-80">
          <div className="absolute -left-9 top-5 w-28 h-18 bg-white/70 rounded-full"></div>
          <div className="absolute -right-9 top-5 w-28 h-18 bg-white/70 rounded-full"></div>
        </div>

        {/* Flying Geese */}
        <div className="absolute top-16 left-0 right-0 flex justify-around opacity-90">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative" style={{ animationDelay: `${i * 0.5}s` }}>
              <svg width="60" height="40" viewBox="0 0 60 40" className="animate-pulse">
                <path
                  d="M 10 20 Q 20 10 30 20 Q 40 10 50 20"
                  fill="white"
                  stroke="#333"
                  strokeWidth="2"
                />
                <circle cx="50" cy="20" r="4" fill="#ff4444" />
                <path
                  d="M 50 20 L 55 18 L 55 22 Z"
                  fill="#ff4444"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Ground Line */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to top, #90EE90 0%, #FFFFE0 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-2 bg-green-300/50"></div>
      </div>

      {/* Elephant Background */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-3/4 pointer-events-none">
        <svg 
          viewBox="0 0 400 300" 
          className="w-full h-full opacity-30"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* Elephant Body */}
          <ellipse cx="200" cy="200" rx="140" ry="90" fill="white" stroke="#333" strokeWidth="4" />
          
          {/* Elephant Head */}
          <ellipse cx="300" cy="170" rx="70" ry="60" fill="white" stroke="#333" strokeWidth="4" />
          
          {/* Elephant Trunk */}
          <path
            d="M 300 170 Q 320 160 340 150 Q 350 140 345 130"
            fill="none"
            stroke="#333"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Elephant Ear */}
          <ellipse cx="250" cy="150" rx="50" ry="60" fill="white" stroke="#333" strokeWidth="3" />
          
          {/* Elephant Legs */}
          <ellipse cx="130" cy="260" rx="25" ry="35" fill="white" stroke="#333" strokeWidth="3" />
          <ellipse cx="180" cy="260" rx="25" ry="35" fill="white" stroke="#333" strokeWidth="3" />
          <ellipse cx="220" cy="260" rx="25" ry="35" fill="white" stroke="#333" strokeWidth="3" />
          <ellipse cx="270" cy="260" rx="25" ry="35" fill="white" stroke="#333" strokeWidth="3" />

          {/* Small Figures */}
          {/* Figure at tail */}
          <g transform="translate(80, 220)">
            <circle cx="0" cy="0" r="8" fill="#8B5CF6" />
            <rect x="-6" y="8" width="12" height="15" fill="#8B5CF6" />
            <rect x="-8" y="0" width="16" height="4" fill="white" />
            <rect x="-2" y="4" width="4" height="4" fill="#333" />
          </g>
          
          {/* Bricks near tail */}
          <rect x="70" y="200" width="15" height="10" fill="#8B4513" />
          <rect x="75" y="195" width="15" height="10" fill="#8B4513" />
          <rect x="80" y="190" width="15" height="10" fill="#8B4513" />

          {/* Figure under belly */}
          <g transform="translate(200, 240)">
            <circle cx="0" cy="0" r="8" fill="#D2B48C" />
            <rect x="-6" y="8" width="12" height="15" fill="#D2B48C" />
            <rect x="-8" y="0" width="16" height="4" fill="#FFB6C1" />
            <rect x="-2" y="4" width="4" height="4" fill="#333" />
          </g>
          
          {/* Tree */}
          <rect x="210" y="245" width="8" height="15" fill="#8B4513" />
          <circle cx="214" cy="245" r="12" fill="#228B22" />

          {/* Figure on head */}
          <g transform="translate(320, 140)">
            <circle cx="0" cy="0" r="8" fill="#FFB6C1" />
            <rect x="-6" y="8" width="12" height="15" fill="#FFB6C1" />
            <rect x="-8" y="0" width="16" height="4" fill="white" />
            <rect x="-2" y="4" width="4" height="4" fill="#333" />
          </g>
        </svg>
      </div>

      {/* Title Cloud */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="relative">
          <div className="bg-white/90 rounded-full px-8 py-4 shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center">
              Creativity is...
            </h1>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-orange-500 rounded-full px-4 py-2 mb-2 shadow-md">
          <div className="text-xs text-white font-semibold">
            Product Concept:<br />
            Chai Kah Hin, PhD
          </div>
        </div>
        <div className="bg-white/90 rounded-full px-4 py-2 shadow-md">
          <div className="text-xs text-gray-700 font-semibold">
            Graphic Design:<br />
            Fan Jing
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md w-full space-y-8 animate-slide-in relative z-10 mt-32">
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
