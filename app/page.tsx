"use client";

import { Button } from "@/components/ui/button";
import { Settings, Play, BookOpen, Telescope } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Creativity is...
          </h1>
          <p className="text-xl text-muted-foreground">
            A Journey Through Worlds of Creative Thinking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a href="/hub">
            <Button
              size="lg"
              className="w-full h-32 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white text-lg flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Telescope className="w-10 h-10" />
              <div>
                <div className="font-bold">Observatory Hub</div>
                <div className="text-sm font-normal opacity-90">
                  Explore creative worlds
                </div>
              </div>
            </Button>
          </a>

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
                <div className="font-bold">Classic Mode</div>
                <div className="text-sm font-normal opacity-90">
                  Traditional puzzle play
                </div>
              </div>
            </Button>
          </a>

          <a href="/rules">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-32 border-2 text-lg flex flex-col items-center justify-center gap-3"
            >
              <BookOpen className="w-10 h-10" />
              <div>
                <div className="font-bold">Rules & Guide</div>
                <div className="text-sm font-normal opacity-90">
                  Learn how to play
                </div>
              </div>
            </Button>
          </a>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Choose your experience to begin your creative journey</p>
          <p className="text-xs opacity-75">
            🆕 New: Explore three unique worlds in the Observatory Hub
          </p>
        </div>
      </div>
    </div>
  );
}
