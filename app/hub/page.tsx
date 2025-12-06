"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Trophy, BookOpen, User, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface World {
  id: 'alchemist' | 'gardener' | 'explorer';
  name: string;
  description: string;
  theme: string;
  progress: number;
  color: string;
  icon: string;
  route: string;
}

const worlds: World[] = [
  {
    id: 'alchemist',
    name: "Alchemist's Workshop",
    description: "Transform ideas through magical alchemy",
    theme: "Transformation",
    progress: 0,
    color: 'alchemist-purple',
    icon: '⚗️',
    route: '/worlds/alchemist'
  },
  {
    id: 'gardener',
    name: "Gardener's Journey",
    description: "Grow ideas through organic cultivation",
    theme: "Growth",
    progress: 0,
    color: 'gardener-green',
    icon: '🌱',
    route: '/worlds/gardener'
  },
  {
    id: 'explorer',
    name: "Explorer's Map",
    description: "Discover ideas through adventurous exploration",
    theme: "Discovery",
    progress: 0,
    color: 'explorer-ocean',
    icon: '🗺️',
    route: '/worlds/explorer'
  }
];

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const achievements: Achievement[] = [
  { id: 'first-discovery', title: 'First Discovery', description: 'Complete your first puzzle', icon: '⭐', unlocked: false },
  { id: 'alchemist-master', title: 'Alchemist Master', description: 'Complete all Alchemist puzzles', icon: '⚗️', unlocked: false },
  { id: 'gardener-master', title: 'Gardener Master', description: 'Complete all Gardener puzzles', icon: '🌱', unlocked: false },
  { id: 'explorer-master', title: 'Explorer Master', description: 'Complete all Explorer puzzles', icon: '🗺️', unlocked: false },
  { id: 'creative-genius', title: 'Creative Genius', description: 'Complete all worlds', icon: '🎨', unlocked: false }
];

interface Quote {
  id: string;
  text: string;
  author: string;
  collected: boolean;
}

const sampleQuotes: Quote[] = [
  { id: '1', text: "Creativity is intelligence having fun.", author: "Albert Einstein", collected: true },
  { id: '2', text: "The best way to predict the future is to create it.", author: "Peter Drucker", collected: true },
  { id: '3', text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", collected: false },
  { id: '4', text: "Creativity takes courage.", author: "Henri Matisse", collected: false },
];

function StarfieldBackground() {
  const [stars, setStars] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number}>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-hub-space via-hub-space to-black">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PlayerProfile({ playerName, level, experience }: { playerName: string; level: number; experience: number }) {
  return (
    <Card className="bg-black/20 backdrop-blur-sm border-hub-gold/30 p-6 text-white">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-hub-gold to-hub-cosmic rounded-full flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{playerName || "Creative Explorer"}</h2>
          <p className="text-hub-gold">Level {level} • {experience} XP</p>
          <div className="w-full bg-black/50 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-hub-gold to-hub-cosmic h-2 rounded-full transition-all duration-300"
              style={{ width: `${(experience % 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function WorldPortal({ world }: { world: World }) {
  return (
    <Link href={world.route}>
      <Card className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 bg-gradient-to-br from-${world.color}/20 to-${world.color}/10 backdrop-blur-sm animate-portal-enter`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-${world.color} to-${world.color}/80 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300`} />
        <div className="relative p-6 text-center text-white">
          <div className="text-6xl mb-4 animate-float">{world.icon}</div>
          <h3 className="text-2xl font-bold mb-2">{world.name}</h3>
          <p className="text-sm opacity-90 mb-4">{world.description}</p>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">{world.theme}</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 mb-2">
            <div
              className={`bg-gradient-to-r from-${world.color} to-${world.color}/80 h-2 rounded-full transition-all duration-500`}
              style={{ width: `${world.progress}%` }}
            />
          </div>
          <p className="text-xs opacity-75">{world.progress}% Complete</p>
        </div>
      </Card>
    </Link>
  );
}

function AchievementsSidebar() {
  return (
    <Card className="bg-black/20 backdrop-blur-sm border-hub-gold/30 p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-hub-gold" />
        <h3 className="text-xl font-bold">Achievements</h3>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              achievement.unlocked
                ? 'bg-hub-gold/20 border border-hub-gold/30'
                : 'bg-black/20 border border-white/10 opacity-60'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              achievement.unlocked ? 'bg-hub-gold text-black' : 'bg-white/10 text-white/50'
            }`}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{achievement.title}</p>
              <p className="text-xs opacity-75">{achievement.description}</p>
            </div>
            {achievement.unlocked && <Star className="w-5 h-5 text-hub-gold" />}
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuotesLibrary() {
  return (
    <Card className="bg-black/20 backdrop-blur-sm border-hub-gold/30 p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-6 h-6 text-hub-gold" />
        <h3 className="text-xl font-bold">Collected Quotes</h3>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {sampleQuotes.map((quote) => (
          <div
            key={quote.id}
            className={`p-3 rounded-lg border transition-all ${
              quote.collected
                ? 'bg-white/10 border-hub-gold/30'
                : 'bg-black/20 border-white/10 opacity-50'
            }`}
          >
            <p className="text-sm italic mb-1">&ldquo;{quote.text}&rdquo;</p>
            <p className="text-xs opacity-75">— {quote.author}</p>
            {quote.collected && <div className="text-hub-gold text-xs mt-1">✓ Collected</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ObservatoryHub() {
  const [playerName, setPlayerName] = useState("Creative Explorer");
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);

  useEffect(() => {
    // Load player data from localStorage
    const savedName = localStorage.getItem("creativity-player-name");
    const savedLevel = parseInt(localStorage.getItem("creativity-player-level") || "1");
    const savedXP = parseInt(localStorage.getItem("creativity-player-xp") || "0");

    if (savedName) setPlayerName(savedName);
    setPlayerLevel(savedLevel);
    setPlayerXP(savedXP);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarfieldBackground />

      {/* Header */}
      <div className="relative z-10 p-6 animate-fade-in-up">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-glow">
              Observatory of Ideas
            </h1>
            <p className="text-hub-gold text-lg">
              Your journey through the worlds of creativity awaits
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-black/20 border-hub-gold/50 text-white hover:bg-hub-gold/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <PlayerProfile
              playerName={playerName}
              level={playerLevel}
              experience={playerXP}
            />
            <AchievementsSidebar />
          </div>

          {/* Center - World Portals */}
          <div className="lg:col-span-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your World</h2>
              <p className="text-hub-gold">Each world teaches the four phases of creativity through unique puzzles</p>
            </div>

            {/* Triangle layout for portals */}
            <div className="relative h-96 flex items-center justify-center">
              {/* Top portal - Alchemist */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <WorldPortal world={worlds[0]} />
              </div>

              {/* Bottom left portal - Gardener */}
              <div className="absolute bottom-0 left-8">
                <WorldPortal world={worlds[1]} />
              </div>

              {/* Bottom right portal - Explorer */}
              <div className="absolute bottom-0 right-8">
                <WorldPortal world={worlds[2]} />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <QuotesLibrary />
          </div>
        </div>
      </div>

      {/* Observatory Background Image */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image
          src="/images/hub/01_observatory_hub.png"
          alt="Observatory of Ideas"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
