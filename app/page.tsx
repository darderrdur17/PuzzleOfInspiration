"use client";

import { Button } from "@/components/ui/button";
import { Settings, Play } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Creativity is...
          </h1>
          <p className="text-xl text-muted-foreground">
            A Puzzle Game About Creative Thinking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/game-master">
            <Button
              size="lg"
              className="w-full h-32 bg-purple-600 hover:bg-purple-700 text-white text-lg flex flex-col items-center justify-center gap-3"
            >
              <Settings className="w-10 h-10" />
              <div>
                <div className="font-bold">Game Master</div>
                <div className="text-sm font-normal opacity-90">
                  Control game settings
                </div>
              </div>
            </Button>
          </a>

          <a href="/play">
            <Button
              size="lg"
              className="w-full h-32 bg-orange-500 hover:bg-orange-600 text-white text-lg flex flex-col items-center justify-center gap-3"
            >
              <Play className="w-10 h-10" />
              <div>
                <div className="font-bold">Play Game</div>
                <div className="text-sm font-normal opacity-90">
                  Join as a player
                </div>
              </div>
            </Button>
          </a>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Choose your role to begin</p>
        </div>
      </div>
    </div>
  );
}
