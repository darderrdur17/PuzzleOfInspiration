"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Droplets, Sprout, Flower2, CircleDot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Phase = 1 | 2 | 3 | 4;

const phases = [
  {
    id: 1,
    title: "Preparation",
    subtitle: "Planting Seeds",
    description: "Select and plant the perfect seeds in your garden beds",
    mechanic: "Seed Placement Puzzle",
    icon: "🌱",
    color: "gardener-brown"
  },
  {
    id: 2,
    title: "Incubation",
    subtitle: "Water Flow Puzzle",
    description: "Guide water through pipes to nourish all your plants",
    mechanic: "Pipe Connection Puzzle",
    icon: "💧",
    color: "gardener-sky"
  },
  {
    id: 3,
    title: "Illumination",
    subtitle: "Blooming Sequence",
    description: "Watch as your garden comes to life in a symphony of color",
    mechanic: "Growth Animation",
    icon: "🌸",
    color: "gardener-pink"
  },
  {
    id: 4,
    title: "Verification",
    subtitle: "Mandala Arrangement",
    description: "Arrange the bloomed flowers into a perfect circular pattern",
    mechanic: "Flower Arrangement Puzzle",
    icon: "🌺",
    color: "gardener-green"
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
          {currentPhase > phase.id ? <CircleDot className="w-6 h-6" /> : phase.id}
        </button>
      ))}
    </div>
  );
}

function PlantingSeeds() {
  const [plantedSeeds, setPlantedSeeds] = useState<Record<string, string>>({});
  const seeds = ['Rose', 'Lily', 'Tulip', 'Daisy'];
  const gardenBeds = ['North', 'South', 'East', 'West'];

  const handlePlant = (bed: string, seed: string) => {
    setPlantedSeeds(prev => ({
      ...prev,
      [bed]: seed
    }));
  };

  const isComplete = Object.keys(plantedSeeds).length === 4;

  return (
    <div className="text-center space-y-6">
      <div className="bg-gardener-brown/20 border-2 border-gardener-brown rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Planting Seeds</h3>
        <p className="text-gardener-green mb-4">Choose the perfect seeds for each garden bed</p>

        {/* Garden Layout */}
        <div className="relative w-80 h-80 mx-auto mb-6 bg-gardener-brown/30 rounded-lg p-4">
          {/* Garden beds in corners */}
          {gardenBeds.map((bed, index) => {
            const positions = [
              { top: '10%', left: '10%' },
              { top: '10%', right: '10%' },
              { bottom: '10%', left: '10%' },
              { bottom: '10%', right: '10%' }
            ];

            return (
              <div
                key={bed}
                className="absolute w-16 h-16 bg-gardener-brown/50 rounded border-2 border-gardener-green/50 flex items-center justify-center text-xs font-bold"
                style={positions[index]}
              >
                {plantedSeeds[bed] ? plantedSeeds[bed][0] : '🌱'}
              </div>
            );
          })}

          {/* Central garden path */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gardener-green/20 rounded-full flex items-center justify-center">
              <Sprout className="w-8 h-8 text-gardener-green" />
            </div>
          </div>
        </div>

        {/* Available seeds */}
        <div className="flex justify-center gap-4">
          {seeds.map((seed) => {
            const isPlanted = Object.values(plantedSeeds).includes(seed);
            return (
              <button
                key={seed}
                onClick={() => {
                  const availableBed = gardenBeds.find(bed => !plantedSeeds[bed]);
                  if (availableBed && !isPlanted) {
                    handlePlant(availableBed, seed);
                  }
                }}
                disabled={isPlanted}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  isPlanted
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-gardener-green hover:bg-gardener-green/80 text-white hover:scale-105'
                }`}
              >
                {seed}
              </button>
            );
          })}
        </div>

        {isComplete && (
          <div className="mt-6 text-center">
            <div className="text-4xl mb-4">🌱</div>
            <p className="text-gardener-pink font-bold">All seeds planted! Proceed to Incubation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WaterFlowPuzzle() {
  const [pipeConnections, setPipeConnections] = useState<Record<string, boolean>>({});
  const pipes = [
    { id: 'A', connected: false },
    { id: 'B', connected: false },
    { id: 'C', connected: false },
    { id: 'D', connected: false }
  ];

  const toggleConnection = (pipeId: string) => {
    setPipeConnections(prev => ({
      ...prev,
      [pipeId]: !prev[pipeId]
    }));
  };

  const isComplete = Object.values(pipeConnections).every(connected => connected);

  return (
    <div className="text-center space-y-6">
      <div className="bg-gardener-sky/20 border-2 border-gardener-sky rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Water Flow Puzzle</h3>
        <p className="text-gardener-blue mb-4">Connect the pipes to bring water to all plants</p>

        <div className="relative w-80 h-80 mx-auto mb-6 bg-gardener-brown/30 rounded-lg p-4">
          {/* Pipe network visualization */}
          <div className="grid grid-cols-2 gap-8 h-full">
            {pipes.map((pipe, index) => (
              <div key={pipe.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                  pipeConnections[pipe.id]
                    ? 'border-gardener-sky bg-gardener-sky/30 text-white'
                    : 'border-gray-400 bg-gray-200 text-gray-600'
                }`}>
                  {pipe.id}
                </div>
                <button
                  onClick={() => toggleConnection(pipe.id)}
                  className={`px-3 py-1 rounded font-bold transition-all ${
                    pipeConnections[pipe.id]
                      ? 'bg-gardener-sky text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {pipeConnections[pipe.id] ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>

          {/* Water flow indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Droplets className={`w-8 h-8 transition-all ${isComplete ? 'text-gardener-sky animate-bounce' : 'text-gray-400'}`} />
          </div>
        </div>

        {isComplete && (
          <div className="text-center">
            <div className="text-4xl mb-4">💧</div>
            <p className="text-gardener-pink font-bold">Water flows freely! Proceed to Illumination.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BloomingSequence() {
  const [bloomStage, setBloomStage] = useState(0);
  const flowers = ['🌸', '🌺', '🌻', '🌷'];

  const handleBloom = () => {
    if (bloomStage < flowers.length) {
      setBloomStage(prev => prev + 1);
    }
  };

  const isComplete = bloomStage === flowers.length;

  return (
    <div className="text-center space-y-6">
      <div className="bg-gardener-pink/20 border-2 border-gardener-pink rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Blooming Sequence</h3>
        <p className="text-gardener-green mb-4">Watch your garden come to life</p>

        <div className="relative w-80 h-80 mx-auto mb-6 bg-gardener-green/20 rounded-lg flex items-center justify-center">
          <div className="grid grid-cols-2 gap-8">
            {flowers.map((flower, index) => (
              <div
                key={index}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl transition-all duration-1000 ${
                  index < bloomStage
                    ? 'scale-110 animate-pulse'
                    : 'scale-75 opacity-50 grayscale'
                }`}
              >
                {flower}
              </div>
            ))}
          </div>

          {/* Blooming particles */}
          {isComplete && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gardener-pink rounded-full animate-ping"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {!isComplete ? (
          <button
            onClick={handleBloom}
            className="px-6 py-3 bg-gardener-pink hover:bg-gardener-pink/80 text-white rounded-lg font-bold text-lg transition-all hover:scale-105"
          >
            Nurture Growth 🌱
          </button>
        ) : (
          <div className="text-gardener-pink font-bold text-lg">
            Garden in full bloom! Proceed to Verification.
          </div>
        )}
      </div>
    </div>
  );
}

function MandalaArrangement() {
  const [flowerPositions, setFlowerPositions] = useState([
    { id: 1, angle: 0, distance: 80 },
    { id: 2, angle: 90, distance: 80 },
    { id: 3, angle: 180, distance: 80 },
    { id: 4, angle: 270, distance: 80 }
  ]);

  const [dragging, setDragging] = useState<number | null>(null);

  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    setDragging(id);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const distance = Math.sqrt(x * x + y * y);

    setFlowerPositions(prev => prev.map(flower =>
      flower.id === dragging
        ? { ...flower, angle: angle < 0 ? angle + 360 : angle, distance: Math.min(100, Math.max(60, distance)) }
        : flower
    ));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const isComplete = flowerPositions.every(flower =>
    Math.abs(flower.angle % 90) < 10 && Math.abs(flower.distance - 80) < 10
  );

  return (
    <div className="text-center space-y-6">
      <div className="bg-gardener-green/20 border-2 border-gardener-green rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Mandala Arrangement</h3>
        <p className="text-gardener-brown mb-4">Create a perfect circular pattern with the flowers</p>

        <div
          className="relative w-80 h-80 mx-auto mb-6 bg-gardener-brown/20 rounded-full cursor-move select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Golden ratio guide circles */}
          <div className="absolute inset-0 border border-gardener-gold/30 rounded-full"></div>
          <div className="absolute inset-4 border border-gardener-gold/20 rounded-full"></div>

          {/* Flowers */}
          {flowerPositions.map((flower, index) => {
            const radian = (flower.angle * Math.PI) / 180;
            const x = Math.cos(radian) * flower.distance;
            const y = Math.sin(radian) * flower.distance;

            return (
              <div
                key={flower.id}
                className={`absolute w-8 h-8 flex items-center justify-center text-2xl cursor-move transition-all hover:scale-110 ${
                  dragging === flower.id ? 'scale-110 z-10' : ''
                }`}
                style={{
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`
                }}
                onMouseDown={(e) => handleMouseDown(flower.id, e)}
              >
                {['🌸', '🌺', '🌻', '🌷'][index]}
              </div>
            );
          })}

          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-gardener-gold rounded-full"></div>
          </div>
        </div>

        {isComplete && (
          <div className="text-center">
            <div className="text-4xl mb-4">🌟</div>
            <p className="text-gardener-pink font-bold">Perfect mandala achieved! Gardener's Journey complete!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GardenersJourney() {
  const [currentPhase, setCurrentPhase] = useState<Phase>(1);

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 1: return <PlantingSeeds />;
      case 2: return <WaterFlowPuzzle />;
      case 3: return <BloomingSequence />;
      case 4: return <MandalaArrangement />;
      default: return <PlantingSeeds />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gardener-brown via-gardener-green to-gardener-sky">
        <Image
          src="/images/gardener/03_gardener_journey.png"
          alt="Gardener's Journey"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gardener's Journey</h1>
            <p className="text-gardener-pink">Grow ideas through organic cultivation</p>
          </div>
          <Link href="/hub">
            <Button variant="outline" className="bg-black/20 border-gardener-green/50 text-white hover:bg-gardener-green/20">
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
                className="bg-black/20 border-gardener-sky/50 text-white hover:bg-gardener-sky/20"
              >
                Previous Phase
              </Button>
            )}

            {currentPhase < 4 && (
              <Button
                onClick={() => setCurrentPhase((currentPhase + 1) as Phase)}
                className="bg-gardener-pink hover:bg-gardener-pink/80 text-white"
              >
                Next Phase
              </Button>
            )}

            {currentPhase === 4 && (
              <Button
                onClick={() => {/* Handle completion */}}
                className="bg-gardener-green hover:bg-gardener-green/80 text-white"
              >
                Complete Journey
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
