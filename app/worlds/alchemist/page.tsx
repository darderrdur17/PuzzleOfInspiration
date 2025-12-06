"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Flame, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Phase = 1 | 2 | 3 | 4;

const phases = [
  {
    id: 1,
    title: "Preparation",
    subtitle: "Elemental Alignment",
    description: "Gather and arrange the four elements to begin your alchemical transformation",
    mechanic: "Crystal Placement Puzzle",
    icon: "🔮",
    color: "alchemist-purple"
  },
  {
    id: 2,
    title: "Incubation",
    subtitle: "Celestial Ring Rotation",
    description: "Align the cosmic rings to channel the energies of the universe",
    mechanic: "Ring Rotation Puzzle",
    icon: "💫",
    color: "alchemist-blue"
  },
  {
    id: 3,
    title: "Illumination",
    subtitle: "Philosopher's Stone Revelation",
    description: "Witness the miraculous transformation as your creation comes to life",
    mechanic: "Illumination Animation",
    icon: "✨",
    color: "alchemist-gold"
  },
  {
    id: 4,
    title: "Verification",
    subtitle: "Shadow Puppet Mastery",
    description: "Test your creation by casting the perfect shadow silhouette",
    mechanic: "Shadow Arrangement Puzzle",
    icon: "🌑",
    color: "alchemist-green"
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
              ? `bg-${phase.color} text-white shadow-lg scale-110`
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
          }`}
        >
          {currentPhase > phase.id ? <CheckCircle className="w-6 h-6" /> : phase.id}
        </button>
      ))}
    </div>
  );
}

function ElementalAlignment() {
  const [placedCrystals, setPlacedCrystals] = useState<Record<string, string>>({});
  const crystals = ['Fire', 'Water', 'Earth', 'Air'];
  const slots = ['North', 'South', 'East', 'West'];

  const handleDrop = (slot: string, crystal: string) => {
    setPlacedCrystals(prev => ({
      ...prev,
      [slot]: crystal
    }));
  };

  const isComplete = Object.keys(placedCrystals).length === 4;

  return (
    <div className="text-center space-y-6">
      <div className="bg-alchemist-purple/20 border-2 border-alchemist-purple rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Elemental Alignment</h3>
        <p className="text-alchemist-blue mb-4">Place the four elemental crystals in their correct positions</p>

        {/* Central Astrolabe */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-alchemist-purple to-alchemist-blue rounded-full opacity-20"></div>
          <div className="absolute inset-4 bg-alchemist-purple/30 rounded-full flex items-center justify-center">
            <div className="text-6xl">🔮</div>
          </div>

          {/* Crystal slots */}
          {slots.map((slot, index) => {
            const angle = (index * 90) * (Math.PI / 180);
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={slot}
                className="absolute w-12 h-12 bg-alchemist-gold/30 rounded-full border-2 border-alchemist-gold flex items-center justify-center text-xs font-bold transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`
                }}
              >
                {placedCrystals[slot] ? placedCrystals[slot][0] : '?'}
              </div>
            );
          })}
        </div>

        {/* Available crystals */}
        <div className="flex justify-center gap-4">
          {crystals.map((crystal) => {
            const isPlaced = Object.values(placedCrystals).includes(crystal);
            return (
              <button
                key={crystal}
                onClick={() => {
                  const availableSlot = slots.find(slot => !placedCrystals[slot]);
                  if (availableSlot && !isPlaced) {
                    handleDrop(availableSlot, crystal);
                  }
                }}
                disabled={isPlaced}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  isPlaced
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-alchemist-gold hover:bg-alchemist-gold/80 text-black hover:scale-105'
                }`}
              >
                {crystal}
              </button>
            );
          })}
        </div>

        {isComplete && (
          <div className="mt-6 text-center">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-alchemist-gold font-bold">Elements aligned! Proceed to Incubation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CelestialRings() {
  const [ringRotations, setRingRotations] = useState([0, 0, 0]);
  const symbols = ['☾', '☽', '☯', '⚡', '🔥', '💧'];

  const rotateRing = (ringIndex: number) => {
    setRingRotations(prev => prev.map((rot, i) =>
      i === ringIndex ? (rot + 45) % 360 : rot
    ));
  };

  const isAligned = ringRotations.every(rot => rot % 90 === 0);

  return (
    <div className="text-center space-y-6">
      <div className="bg-alchemist-blue/20 border-2 border-alchemist-blue rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Celestial Ring Rotation</h3>
        <p className="text-alchemist-purple mb-4">Align all symbols to unlock the cosmic energies</p>

        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-alchemist-blue/50"
            style={{ transform: `rotate(${ringRotations[0]}deg)` }}
          >
            {symbols.slice(0, 4).map((symbol, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 flex items-center justify-center text-2xl font-bold"
                style={{
                  left: '50%',
                  top: '0',
                  transform: `translateX(-50%) translateY(-50%) rotate(${-ringRotations[0]}deg)`,
                  transformOrigin: '0 32px'
                }}
              >
                {symbol}
              </div>
            ))}
          </div>

          {/* Middle ring */}
          <div
            className="absolute inset-8 rounded-full border-4 border-alchemist-purple/50"
            style={{ transform: `rotate(${ringRotations[1]}deg)` }}
          >
            {symbols.slice(2, 6).map((symbol, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 flex items-center justify-center text-2xl font-bold"
                style={{
                  left: '50%',
                  top: '0',
                  transform: `translateX(-50%) translateY(-50%) rotate(${-ringRotations[1]}deg)`,
                  transformOrigin: '0 32px'
                }}
              >
                {symbol}
              </div>
            ))}
          </div>

          {/* Inner ring */}
          <div
            className="absolute inset-16 rounded-full border-4 border-alchemist-gold/50"
            style={{ transform: `rotate(${ringRotations[2]}deg)` }}
          >
            {symbols.slice(1, 5).map((symbol, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 flex items-center justify-center text-2xl font-bold"
                style={{
                  left: '50%',
                  top: '0',
                  transform: `translateX(-50%) translateY(-50%) rotate(${-ringRotations[2]}deg)`,
                  transformOrigin: '0 32px'
                }}
              >
                {symbol}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {[0, 1, 2].map((ringIndex) => (
            <button
              key={ringIndex}
              onClick={() => rotateRing(ringIndex)}
              className="px-4 py-2 bg-alchemist-blue hover:bg-alchemist-blue/80 text-white rounded-lg font-bold transition-all hover:scale-105"
            >
              Rotate Ring {ringIndex + 1}
            </button>
          ))}
        </div>

        {isAligned && (
          <div className="mt-6 text-center">
            <div className="text-4xl mb-4">💫</div>
            <p className="text-alchemist-gold font-bold">Cosmic energies aligned! Proceed to Illumination.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function IlluminationReveal() {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    setTimeout(() => {
      // Auto-advance after animation
    }, 3000);
  };

  return (
    <div className="text-center space-y-6">
      <div className="bg-alchemist-gold/20 border-2 border-alchemist-gold rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Philosopher's Stone Revelation</h3>
        <p className="text-alchemist-purple mb-4">Witness the birth of the legendary Philosopher's Stone</p>

        <div className="relative w-64 h-64 mx-auto mb-6">
          <div className={`w-full h-full rounded-full bg-gradient-to-br from-alchemist-purple via-alchemist-blue to-alchemist-gold flex items-center justify-center text-6xl transition-all duration-1000 ${
            isRevealed ? 'scale-110 shadow-2xl shadow-alchemist-gold/50' : 'scale-90'
          }`}>
            {isRevealed ? '💎' : '🔮'}
          </div>

          {isRevealed && (
            <div className="absolute inset-0 animate-ping">
              <div className="w-full h-full rounded-full bg-alchemist-gold/30"></div>
            </div>
          )}
        </div>

        {!isRevealed ? (
          <button
            onClick={handleReveal}
            className="px-6 py-3 bg-alchemist-gold hover:bg-alchemist-gold/80 text-black rounded-lg font-bold text-lg transition-all hover:scale-105"
          >
            Begin Transmutation ✨
          </button>
        ) : (
          <div className="text-alchemist-gold font-bold text-lg">
            The Philosopher's Stone is born! Proceed to Verification.
          </div>
        )}
      </div>
    </div>
  );
}

function ShadowPuzzle() {
  const [pieces, setPieces] = useState([
    { id: 1, x: 50, y: 50, shape: 'circle' },
    { id: 2, x: 150, y: 50, shape: 'triangle' },
    { id: 3, x: 100, y: 150, shape: 'square' }
  ]);

  const targetShape = 'star';

  const isComplete = pieces.every(piece =>
    Math.abs(piece.x - 100) < 20 && Math.abs(piece.y - 100) < 20
  );

  return (
    <div className="text-center space-y-6">
      <div className="bg-alchemist-green/20 border-2 border-alchemist-green rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Shadow Puppet Mastery</h3>
        <p className="text-alchemist-purple mb-4">Arrange the objects to cast the perfect shadow</p>

        <div className="relative w-64 h-64 mx-auto mb-6 bg-black/50 rounded-lg overflow-hidden">
          {/* Light source */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-alchemist-gold rounded-full shadow-lg shadow-alchemist-gold/50"></div>

          {/* Target shadow silhouette */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-alchemist-gold/50 text-4xl">
            ⭐
          </div>

          {/* Draggable pieces */}
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-8 h-8 bg-alchemist-purple rounded cursor-move hover:scale-110 transition-transform"
              style={{ left: piece.x, top: piece.y }}
              onMouseDown={(e) => {
                const startX = e.clientX - piece.x;
                const startY = e.clientY - piece.y;

                const handleMouseMove = (e: MouseEvent) => {
                  const newX = e.clientX - startX;
                  const newY = e.clientY - startY;
                  setPieces(prev => prev.map(p =>
                    p.id === piece.id ? { ...p, x: Math.max(0, Math.min(240, newX)), y: Math.max(0, Math.min(240, newY)) } : p
                  ));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              {piece.shape === 'circle' && '●'}
              {piece.shape === 'triangle' && '▲'}
              {piece.shape === 'square' && '■'}
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="text-center">
            <div className="text-4xl mb-4">🌟</div>
            <p className="text-alchemist-gold font-bold">Perfect shadow achieved! Alchemist's Workshop complete!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlchemistWorkshop() {
  const [currentPhase, setCurrentPhase] = useState<Phase>(1);

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 1: return <ElementalAlignment />;
      case 2: return <CelestialRings />;
      case 3: return <IlluminationReveal />;
      case 4: return <ShadowPuzzle />;
      default: return <ElementalAlignment />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-alchemist-purple via-gray-900 to-black">
        <Image
          src="/images/alchemist/02_alchemist_workshop.png"
          alt="Alchemist's Workshop"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Alchemist's Workshop</h1>
            <p className="text-alchemist-gold">Transform ideas through magical alchemy</p>
          </div>
          <Link href="/hub">
            <Button variant="outline" className="bg-black/20 border-alchemist-gold/50 text-white hover:bg-alchemist-gold/20">
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
                className="bg-black/20 border-alchemist-blue/50 text-white hover:bg-alchemist-blue/20"
              >
                Previous Phase
              </Button>
            )}

            {currentPhase < 4 && (
              <Button
                onClick={() => setCurrentPhase((currentPhase + 1) as Phase)}
                className="bg-alchemist-gold hover:bg-alchemist-gold/80 text-black"
              >
                Next Phase
              </Button>
            )}

            {currentPhase === 4 && (
              <Button
                onClick={() => {/* Handle completion */}}
                className="bg-alchemist-green hover:bg-alchemist-green/80 text-white"
              >
                Complete Workshop
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
