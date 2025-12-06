"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Map, Compass, Lightbulb, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Phase = 1 | 2 | 3 | 4;

const phases = [
  {
    id: 1,
    title: "Preparation",
    subtitle: "Map Assembly",
    description: "Piece together the ancient map from scattered fragments",
    mechanic: "Jigsaw Puzzle",
    icon: "🗺️",
    color: "explorer-parchment"
  },
  {
    id: 2,
    title: "Incubation",
    subtitle: "Fog Navigation",
    description: "Navigate through mysterious fog to reach hidden locations",
    mechanic: "Path Finding",
    icon: "🌫️",
    color: "explorer-ocean"
  },
  {
    id: 3,
    title: "Illumination",
    subtitle: "Discovery Moment",
    description: "Experience the thrill of uncovering hidden treasures",
    mechanic: "Reveal Animation",
    icon: "💡",
    color: "explorer-gold"
  },
  {
    id: 4,
    title: "Verification",
    subtitle: "Riddle Solving",
    description: "Use your discoveries to solve the final ancient riddle",
    mechanic: "Logic Puzzle",
    icon: "🧩",
    color: "explorer-forest"
  }
];

function PhaseIndicator({ currentPhase, onPhaseSelect }: { currentPhase: Phase; onPhaseSelect: (phase: Phase) => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {phases.map((phase) => (
        <button
          key={phase.id}
          onClick={() => onPhaseSelect(phase.id as Phase)}
          className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
            currentPhase >= phase.id
              ? `bg-${phase.color} text-black shadow-lg scale-110`
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
          }`}
        >
          {currentPhase > phase.id ? <CheckCircle2 className="w-6 h-6" /> : phase.id}
        </button>
      ))}
    </div>
  );
}

function MapAssembly() {
  const [placedPieces, setPlacedPieces] = useState<Record<string, boolean>>({});
  const mapPieces = [
    { id: 'NW', label: 'Northwest Territory' },
    { id: 'NE', label: 'Northeast Coast' },
    { id: 'SW', label: 'Southwest Mountains' },
    { id: 'SE', label: 'Southeast Islands' }
  ];

  const handlePlacePiece = (pieceId: string) => {
    setPlacedPieces(prev => ({
      ...prev,
      [pieceId]: true
    }));
  };

  const isComplete = Object.keys(placedPieces).length === 4;

  return (
    <div className="text-center space-y-6">
      <div className={`bg-${'explorer-parchment'}/20 border-2 border-explorer-gold rounded-xl p-6`}>
        <h3 className="text-2xl font-bold text-black mb-2">Map Assembly</h3>
        <p className="text-explorer-forest mb-4">Reconstruct the ancient map from its fragments</p>

        {/* Map assembly area */}
        <div className="relative w-80 h-80 mx-auto mb-6 bg-explorer-parchment/50 rounded-lg border-4 border-explorer-gold/50 p-4">
          <div className="grid grid-cols-2 gap-2 h-full">
            {mapPieces.map((piece) => (
              <div
                key={piece.id}
                className={`border-2 rounded flex items-center justify-center text-xs font-bold transition-all ${
                  placedPieces[piece.id]
                    ? 'border-explorer-gold bg-explorer-gold/20 text-explorer-forest'
                    : 'border-gray-300 bg-gray-100 text-gray-500'
                }`}
              >
                {placedPieces[piece.id] ? piece.label : 'Empty'}
              </div>
            ))}
          </div>
        </div>

        {/* Available pieces */}
        <div className="flex flex-wrap justify-center gap-4">
          {mapPieces.map((piece) => (
            <button
              key={piece.id}
              onClick={() => handlePlacePiece(piece.id)}
              disabled={placedPieces[piece.id]}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                placedPieces[piece.id]
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-explorer-gold hover:bg-explorer-gold/80 text-black hover:scale-105'
              }`}
            >
              {piece.label}
            </button>
          ))}
        </div>

        {isComplete && (
          <div className="mt-6 text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-explorer-gold font-bold">Map reconstructed! Proceed to Incubation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FogNavigation() {
  const [currentPosition, setCurrentPosition] = useState({ x: 1, y: 1 });
  const [revealedAreas, setRevealedAreas] = useState<Set<string>>(new Set(['1,1']));
  const [treasureFound, setTreasureFound] = useState(false);

  const gridSize = 5;
  const treasurePosition = { x: 4, y: 4 };

  const move = (dx: number, dy: number) => {
    const newX = Math.max(0, Math.min(gridSize - 1, currentPosition.x + dx));
    const newY = Math.max(0, Math.min(gridSize - 1, currentPosition.y + dy));

    if (newX !== currentPosition.x || newY !== currentPosition.y) {
      setCurrentPosition({ x: newX, y: newY });
      setRevealedAreas(prev => new Set(prev.add(`${newX},${newY}`)));

      if (newX === treasurePosition.x && newY === treasurePosition.y) {
        setTreasureFound(true);
      }
    }
  };

  const isComplete = treasureFound;

  return (
    <div className="text-center space-y-6">
      <div className="bg-explorer-ocean/20 border-2 border-explorer-ocean rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Fog Navigation</h3>
        <p className="text-explorer-gold mb-4">Navigate through the mysterious fog to find the treasure</p>

        <div className="relative w-80 h-80 mx-auto mb-6 bg-explorer-ocean/30 rounded-lg p-4">
          {/* Fog grid */}
          <div className="grid grid-cols-5 gap-1 h-full">
            {Array.from({ length: gridSize * gridSize }, (_, i) => {
              const x = i % gridSize;
              const y = Math.floor(i / gridSize);
              const isRevealed = revealedAreas.has(`${x},${y}`);
              const isCurrent = x === currentPosition.x && y === currentPosition.y;
              const hasTreasure = x === treasurePosition.x && y === treasurePosition.y && isRevealed;

              return (
                <div
                  key={i}
                  className={`border rounded flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'border-explorer-gold bg-explorer-gold/50'
                      : isRevealed
                        ? hasTreasure
                          ? 'border-explorer-gold bg-explorer-gold/30'
                          : 'border-explorer-ocean bg-explorer-ocean/20'
                        : 'border-gray-400 bg-gray-600'
                  }`}
                >
                  {isCurrent && <Compass className="w-4 h-4 text-black" />}
                  {hasTreasure && !isCurrent && '💰'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Movement controls */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <button
              onClick={() => move(0, -1)}
              className="w-10 h-10 bg-explorer-ocean hover:bg-explorer-ocean/80 text-white rounded flex items-center justify-center"
            >
              ↑
            </button>
            <div></div>
            <button
              onClick={() => move(-1, 0)}
              className="w-10 h-10 bg-explorer-ocean hover:bg-explorer-ocean/80 text-white rounded flex items-center justify-center"
            >
              ←
            </button>
            <div></div>
            <button
              onClick={() => move(1, 0)}
              className="w-10 h-10 bg-explorer-ocean hover:bg-explorer-ocean/80 text-white rounded flex items-center justify-center"
            >
              →
            </button>
            <div></div>
            <button
              onClick={() => move(0, 1)}
              className="w-10 h-10 bg-explorer-ocean hover:bg-explorer-ocean/80 text-white rounded flex items-center justify-center"
            >
              ↓
            </button>
            <div></div>
          </div>
        </div>

        {isComplete && (
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <p className="text-explorer-gold font-bold">Treasure discovered! Proceed to Illumination.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DiscoveryMoment() {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    setTimeout(() => {
      // Auto-advance after animation
    }, 3000);
  };

  return (
    <div className="text-center space-y-6">
      <div className="bg-explorer-gold/20 border-2 border-explorer-gold rounded-xl p-6">
        <h3 className="text-2xl font-bold text-black mb-2">Discovery Moment</h3>
        <p className="text-explorer-forest mb-4">Experience the thrill of uncovering ancient secrets</p>

        <div className="relative w-80 h-80 mx-auto mb-6 bg-gradient-to-br from-explorer-gold via-explorer-ocean to-explorer-forest rounded-lg flex items-center justify-center">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-explorer-gold to-explorer-forest flex items-center justify-center text-6xl transition-all duration-1000 ${
            isRevealed ? 'scale-125 shadow-2xl shadow-explorer-gold/50' : 'scale-90'
          }`}>
            {isRevealed ? '🏆' : '❓'}
          </div>

          {isRevealed && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-explorer-gold rounded-full animate-ping"
                  style={{
                    left: `${15 + Math.random() * 70}%`,
                    top: `${15 + Math.random() * 70}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {!isRevealed ? (
          <button
            onClick={handleReveal}
            className="px-6 py-3 bg-explorer-gold hover:bg-explorer-gold/80 text-black rounded-lg font-bold text-lg transition-all hover:scale-105"
          >
            Reveal Discovery 🏆
          </button>
        ) : (
          <div className="text-explorer-forest font-bold text-lg">
            Ancient secrets revealed! Proceed to Verification.
          </div>
        )}
      </div>
    </div>
  );
}

function RiddleSolving() {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const riddle = {
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
    options: ["An echo", "A shadow", "A mirror", "The wind itself"],
    correctAnswer: "An echo"
  };

  const isComplete = selectedAnswer === riddle.correctAnswer;

  return (
    <div className="text-center space-y-6">
      <div className="bg-explorer-forest/20 border-2 border-explorer-forest rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Ancient Riddle</h3>
        <p className="text-explorer-gold mb-6 italic">&ldquo;{riddle.question}&rdquo;</p>

        <div className="space-y-3 mb-6">
          {riddle.options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedAnswer(option)}
              className={`w-full p-3 rounded-lg font-bold transition-all ${
                selectedAnswer === option
                  ? 'bg-explorer-gold text-black'
                  : 'bg-explorer-forest/30 text-white hover:bg-explorer-forest/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {isComplete && (
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-explorer-gold font-bold">Riddle solved! Explorer&apos;s Map complete!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorersMap() {
  const [currentPhase, setCurrentPhase] = useState<Phase>(1);

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 1: return <MapAssembly />;
      case 2: return <FogNavigation />;
      case 3: return <DiscoveryMoment />;
      case 4: return <RiddleSolving />;
      default: return <MapAssembly />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-explorer-parchment via-explorer-ocean to-explorer-forest">
        <Image
          src="/images/explorer/04_explorer_map.png"
          alt="Explorer's Map"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Explorer&apos;s Map</h1>
            <p className="text-explorer-forest">Discover ideas through adventurous exploration</p>
          </div>
          <Link href="/hub">
            <Button variant="outline" className="bg-black/20 border-explorer-gold/50 text-black hover:bg-explorer-gold/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="relative z-10 px-6">
        <div className="max-w-4xl mx-auto">
          <PhaseIndicator currentPhase={currentPhase} onPhaseSelect={setCurrentPhase} />

          {/* Phase Content */}
          <div className="mb-6">
            {renderCurrentPhase()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4">
            {currentPhase > 1 && (
              <Button
                onClick={() => setCurrentPhase((currentPhase - 1) as Phase)}
                variant="outline"
                className="bg-black/20 border-explorer-ocean/50 text-black hover:bg-explorer-ocean/20"
              >
                Previous Phase
              </Button>
            )}

            {currentPhase < 4 && (
              <Button
                onClick={() => setCurrentPhase((currentPhase + 1) as Phase)}
                className="bg-explorer-gold hover:bg-explorer-gold/80 text-black"
              >
                Next Phase
              </Button>
            )}

            {currentPhase === 4 && (
              <Button
                onClick={() => {/* Handle completion */}}
                className="bg-explorer-forest hover:bg-explorer-forest/80 text-white"
              >
                Complete Exploration
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
