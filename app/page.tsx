"use client";

import { Button } from "@/components/ui/button";
import { Settings, Play as PlayIcon, BookOpen, Sparkles, Cpu, TreePine, Cog } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/lib/themeContext";

// Generate floating particles for background
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 6,
    size: 2 + Math.random() * 4,
    color: ['#00ffff', '#ff00ff', '#4ade80', '#ffd700', '#60a5fa'][Math.floor(Math.random() * 5)],
  }));
};

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  type HomepageThemeOption = 'default' | 'cyberpunk' | 'enchanted' | 'steampunk';
  const { homepageTheme, setHomepageTheme } = useTheme();
  const themeOptions: Array<{
    id: HomepageThemeOption;
    label: string;
    icon: typeof Sparkles;
    classes: { active: string; inactive: string; text: string; icon: string };
  }> = [
    {
      id: 'cyberpunk',
      label: 'Cyberpunk',
      icon: Cpu,
      classes: {
        active: 'bg-cyan-500/40 border-2 border-cyan-500 shadow-lg shadow-cyan-500/25 focus-visible:ring-cyan-300',
        inactive: 'bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 focus-visible:ring-cyan-300',
        text: 'text-cyan-200',
        icon: 'text-cyan-300',
      },
    },
    {
      id: 'enchanted',
      label: 'Enchanted',
      icon: TreePine,
      classes: {
        active: 'bg-green-500/40 border-2 border-green-500 shadow-lg shadow-green-500/25 focus-visible:ring-green-300',
        inactive: 'bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 focus-visible:ring-green-300',
        text: 'text-green-200',
        icon: 'text-green-300',
      },
    },
    {
      id: 'steampunk',
      label: 'Steampunk',
      icon: Cog,
      classes: {
        active: 'bg-amber-500/40 border-2 border-amber-500 shadow-lg shadow-amber-500/25 focus-visible:ring-amber-300',
        inactive: 'bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 focus-visible:ring-amber-300',
        text: 'text-amber-200',
        icon: 'text-amber-300',
      },
    },
    {
      id: 'default',
      label: 'Default',
      icon: Sparkles,
      classes: {
        active: 'bg-purple-500/40 border-2 border-purple-500 shadow-lg shadow-purple-500/25 focus-visible:ring-purple-300',
        inactive: 'bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 focus-visible:ring-purple-300',
        text: 'text-purple-200',
        icon: 'text-purple-300',
      },
    },
  ];
  const particles = useMemo(() => generateParticles(30), []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic gradient background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: hoveredCard === 'master'
            ? 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #1e1b4b 100%)'
            : hoveredCard === 'play'
            ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d1f4a 100%)'
            : hoveredCard === 'rules'
            ? 'linear-gradient(135deg, #1a2f1a 0%, #0f1f0f 50%, #1a2f1a 100%)'
            : homepageTheme === 'cyberpunk'
            ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 30%, #0a0e27 60%, #1a1f3a 100%)'
            : homepageTheme === 'enchanted'
            ? 'linear-gradient(135deg, #1a2f1a 0%, #0f1f0f 30%, #1a2f1a 60%, #0f1f0f 100%)'
            : homepageTheme === 'steampunk'
            ? 'linear-gradient(135deg, #2c1810 0%, #3d2817 30%, #2c1810 60%, #3d2817 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #0a0e27 60%, #1a2f1a 100%)',
        }}
      />

      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100,100,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,100,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'grid-scroll 30s linear infinite',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl w-full space-y-10 text-center relative z-10">
        {/* Header with glow effect */}
        <header className="space-y-6">
          <div className="relative inline-block">
            <Sparkles className="absolute -top-6 -left-8 w-8 h-8 text-amber-400 animate-pulse" />
            <Sparkles className="absolute -top-4 -right-6 w-6 h-6 text-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <h1 
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #00ffff, #ff00ff, #ffd700, #4ade80)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 8s ease infinite',
                textShadow: '0 0 40px rgba(0,255,255,0.3)',
              }}
            >
              Creativity is...
            </h1>
          </div>
          <p 
            className="text-xl sm:text-2xl font-light max-w-xl mx-auto"
            style={{ 
              color: '#a5b4fc',
              textShadow: '0 0 20px rgba(165,180,252,0.3)'
            }}
          >
            A Puzzle Game About Creative Thinking
          </p>
          
          {/* Theme showcase badges */}
          <div className="flex justify-center gap-4 flex-wrap">
            {themeOptions.map(({ id, label, icon: Icon, classes }) => {
              const isActive = homepageTheme === id;
              return (
                <button
                  key={id}
                  onClick={() => setHomepageTheme(id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    isActive ? classes.active : classes.inactive
                  }`}
                  aria-label={`Switch to ${label} theme`}
                  aria-pressed={isActive}
                  data-active={isActive}
                >
                  <Icon className={`w-4 h-4 ${classes.icon}`} />
                  <span className={`text-xs font-medium ${classes.text}`}>{label}</span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/80">
                      <span className="inline-block w-2 h-2 rounded-full bg-white" />
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        <nav aria-label="Main navigation" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game Master Card */}
          <a 
            href="/game-master"
            className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 rounded-2xl"
            aria-label="Game Master - Control game settings"
            onMouseEnter={() => setHoveredCard('master')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div
              className="relative h-36 sm:h-40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-500 group overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(88,28,135,0.8), rgba(126,34,206,0.6))',
                border: '2px solid rgba(168,85,247,0.5)',
                boxShadow: hoveredCard === 'master' 
                  ? '0 0 40px rgba(168,85,247,0.5), inset 0 0 30px rgba(168,85,247,0.2)'
                  : '0 4px 20px rgba(0,0,0,0.3)',
                transform: hoveredCard === 'master' ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
              }}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(168,85,247,0.4) 0%, transparent 50%)',
                }} />
              </div>
              
              <Settings className="w-10 h-10 sm:w-12 sm:h-12 text-purple-200 group-hover:rotate-90 transition-transform duration-500" aria-hidden="true" />
              <div className="relative z-10">
                <div className="font-bold text-lg text-white">Game Master</div>
                <div className="text-sm font-normal text-purple-200/80">
                  Control game settings
                </div>
              </div>
            </div>
          </a>

          {/* Play Game Card */}
          <a 
            href="/play"
            className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 rounded-2xl"
            aria-label="Play Game - Join as a player"
            onMouseEnter={() => setHoveredCard('play')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div
              className="relative h-36 sm:h-40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-500 group overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,200,200,0.7), rgba(255,0,255,0.4))',
                border: '2px solid rgba(0,255,255,0.5)',
                boxShadow: hoveredCard === 'play' 
                  ? '0 0 40px rgba(0,255,255,0.5), 0 0 60px rgba(255,0,255,0.3), inset 0 0 30px rgba(0,255,255,0.2)'
                  : '0 4px 20px rgba(0,0,0,0.3)',
                transform: hoveredCard === 'play' ? 'scale(1.08) translateY(-6px)' : 'scale(1)',
              }}
            >
              {/* Neon glow effect */}
              <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity">
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,255,255,0.3) 0%, transparent 70%)',
                }} />
              </div>
              
              <PlayIcon className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-100 group-hover:scale-125 transition-transform duration-300" aria-hidden="true" />
              <div className="relative z-10">
                <div className="font-bold text-lg text-white" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                  Play Game
                </div>
                <div className="text-sm font-normal text-cyan-100/80">
                  Join as a player
                </div>
              </div>
              
              {/* Animated border */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.4), transparent)',
                  animation: hoveredCard === 'play' ? 'shimmer 2s infinite' : 'none',
                }}
              />
            </div>
          </a>

          {/* Rules Card */}
          <a 
            href="/rules"
            className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400 rounded-2xl"
            aria-label="Rules and Guide - Learn how to play"
            onMouseEnter={() => setHoveredCard('rules')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div
              className="relative h-36 sm:h-40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-500 group overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(74,222,128,0.6), rgba(96,165,250,0.4))',
                border: '2px solid rgba(74,222,128,0.5)',
                boxShadow: hoveredCard === 'rules' 
                  ? '0 0 40px rgba(74,222,128,0.4), inset 0 0 30px rgba(74,222,128,0.2)'
                  : '0 4px 20px rgba(0,0,0,0.3)',
                transform: hoveredCard === 'rules' ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
              }}
            >
              {/* Forest-like pattern */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{
                  background: 'linear-gradient(to top, rgba(74,222,128,0.3), transparent)',
                }} />
              </div>
              
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-green-100 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
              <div className="relative z-10">
                <div className="font-bold text-lg text-white">Rules & Guide</div>
                <div className="text-sm font-normal text-green-100/80">
                  Learn how to play
                </div>
              </div>
            </div>
          </a>
        </nav>


        <footer className="text-base text-indigo-300/70">
          <p className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Choose your role to begin the creative journey
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
