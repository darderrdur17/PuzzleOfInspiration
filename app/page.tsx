"use client";

import { Button } from "@/components/ui/button";
import { Settings, Play, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
            Creativity is...
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            A Puzzle Game About Creative Thinking
          </p>
        </header>

        <nav aria-label="Main navigation" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <a 
            href="/game-master"
            className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 rounded-xl"
            aria-label="Game Master - Control game settings"
          >
            <Button
              size="lg"
              className="w-full h-28 sm:h-32 bg-purple-600 hover:bg-purple-700 text-white text-base sm:text-lg flex flex-col items-center justify-center gap-2 sm:gap-3 touch-target"
              tabIndex={-1}
            >
              <Settings className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
              <div>
                <div className="font-bold">Game Master</div>
                <div className="text-xs sm:text-sm font-normal opacity-90">
                  Control game settings
                </div>
              </div>
            </Button>
          </a>

          <a 
            href="/play"
            className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 rounded-xl"
            aria-label="Play Game - Join as a player"
          >
            <Button
              size="lg"
              className="w-full h-28 sm:h-32 bg-orange-500 hover:bg-orange-600 text-white text-base sm:text-lg flex flex-col items-center justify-center gap-2 sm:gap-3 touch-target"
              tabIndex={-1}
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
              <div>
                <div className="font-bold">Play Game</div>
                <div className="text-xs sm:text-sm font-normal opacity-90">
                  Join as a player
                </div>
              </div>
            </Button>
          </a>

          <a 
            href="/rules"
            className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-300 rounded-xl"
            aria-label="Rules and Guide - Learn how to play"
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full h-28 sm:h-32 border-2 text-base sm:text-lg flex flex-col items-center justify-center gap-2 sm:gap-3 touch-target"
              tabIndex={-1}
            >
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
              <div>
                <div className="font-bold">Rules & Guide</div>
                <div className="text-xs sm:text-sm font-normal opacity-90">
                  Learn how to play
                </div>
              </div>
            </Button>
          </a>
        </nav>

        <footer className="text-sm text-muted-foreground">
          <p>Choose your role to begin</p>
        </footer>
      </div>
    </div>
  );
}
