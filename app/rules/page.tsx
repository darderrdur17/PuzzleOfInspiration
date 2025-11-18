"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Target, Clock, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-xl space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Game Rules & Description
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn how to play the Creativity Puzzle Game
            </p>
          </div>

          {/* Game Description */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6" />
              Game Description
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                <strong>Creativity is...</strong> is an educational puzzle game that teaches the four phases of the creative process 
                through an interactive jigsaw puzzle experience. Players learn about Preparation, Incubation, Illumination, and 
                Verification by sorting quotes and phase titles into their correct categories.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The game is designed for classroom use, where a game master controls the game settings and timing, while players 
                compete to correctly sort puzzle pieces as quickly as possible.
              </p>
            </div>
          </section>

          {/* How to Play */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              How to Play
            </h2>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">1. Game Master Setup</h3>
                <p className="text-muted-foreground text-sm">
                  The game master sets the time limit (1-60 minutes) and number of quotes (4-48) before starting the game.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">2. Player Entry</h3>
                <p className="text-muted-foreground text-sm">
                  Players enter their name and optionally share a creative moment. They wait for the game master to start the game.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">3. Sorting Phase Titles</h3>
                <p className="text-muted-foreground text-sm">
                  First, drag the four phase titles (Preparation, Incubation, Illumination, Verification) to the correct geese above the elephant.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">4. Sorting Quotes</h3>
                <p className="text-muted-foreground text-sm">
                  Then, drag quotes to the correct drop zones on the elephant body. Each quote belongs to one of the four creative phases.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">5. Your Creative Moment</h3>
                <p className="text-muted-foreground text-sm">
                  Place your own creative moment in the <strong>Incubation</strong> phase, as that&apos;s where personal creative experiences belong.
                </p>
              </div>
            </div>
          </section>

          {/* Scoring System */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Scoring System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-lg p-4">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Correct Placements</h3>
                <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                  <li>✓ Correct Quote: <strong>+10 points</strong></li>
                  <li>✓ Correct Title: <strong>+20 points</strong></li>
                  <li>✓ Your Creative Moment: <strong>+10 points</strong></li>
                </ul>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg p-4">
                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">Wrong Placements</h3>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  <li>✗ Wrong Placement: <strong>-5 points</strong></li>
                  <li>✗ Quote returns to initial box</li>
                  <li>✗ You can try again!</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-500 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Speed Bonus</h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Faster completion earns bonus points! The quicker you finish, the more bonus points you receive.
              </p>
            </div>
          </section>

          {/* The Four Phases */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">The Four Phases of Creativity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/10 border-2 border-primary rounded-lg p-4">
                <h3 className="font-bold text-primary mb-2">📚 Preparation</h3>
                <p className="text-sm text-muted-foreground">
                  Gathering information, researching, and preparing for the creative task. This phase involves learning and understanding the problem.
                </p>
              </div>
              
              <div className="bg-accent/10 border-2 border-accent rounded-lg p-4">
                <h3 className="font-bold text-accent mb-2">💭 Incubation</h3>
                <p className="text-sm text-muted-foreground">
                  Letting ideas develop subconsciously. Taking a break, sleeping on it, or allowing the mind to process information in the background.
                </p>
              </div>
              
              <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-4">
                <h3 className="font-bold text-yellow-600 mb-2">💡 Illumination</h3>
                <p className="text-sm text-muted-foreground">
                  The &quot;aha!&quot; moment when the solution suddenly appears. The flash of insight or inspiration that brings clarity.
                </p>
              </div>
              
              <div className="bg-muted/20 border-2 border-muted rounded-lg p-4">
                <h3 className="font-bold text-muted-foreground mb-2">✅ Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Testing, refining, and implementing the idea. This is where the hard work of making the idea reality happens.
                </p>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Important Notes
            </h2>
            <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-500 rounded-lg p-4 space-y-2">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Wrong Placements:</strong> If you place a quote or title in the wrong phase, it will automatically return to the initial box. 
                You can try placing it again in the correct location.
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Time Limit:</strong> The game ends when the game master&apos;s timer runs out, or when you complete all placements.
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Leaderboard:</strong> Your score is ranked by total points, then by number of correct placements, then by completion time.
              </p>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/play" className="flex-1">
              <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600">
                <Trophy className="w-5 h-5 mr-2" />
                Start Playing
              </Button>
            </Link>
            <Link href="/game-master" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                <Clock className="w-5 h-5 mr-2" />
                Game Master
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

