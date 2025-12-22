"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PlayerScore, type ThemeId, type Phase } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Play, Pause, RotateCcw, Users, Clock, Zap, Target, Trophy, Copy, CheckCircle, AlertCircle, Palette, Crown, Square, Sparkles, Lightbulb, Puzzle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { JigsawLayoutId } from "@/lib/jigsawThemes";
import { BoardLayoutType, BOARD_LAYOUTS } from "@/types/boardLayout";
import { DEFAULT_JIGSAW_LAYOUT, defaultJigsawLayoutByTheme, jigsawLayoutOptions } from "@/lib/jigsawThemes";
import { themeList, getRandomRapidFireQuestion } from "@/data/themes";
import { GameSync, type GameConfig } from "@/lib/gameSync";
import { CustomQuotes } from "@/lib/customQuotes";
import { cn, formatTime } from "@/lib/utils";

interface ActivePlayer {
  name: string;
  points: number;
  score: number;
  startTime: number;
  lastUpdate: number;
}

const phaseOptions: Phase[] = ["preparation", "incubation", "illumination", "verification"];
const phaseLabels: Record<Phase, string> = {
  preparation: "Preparation",
  incubation: "Incubation",
  illumination: "Illumination",
  verification: "Verification",
};

interface CustomQuote {
  id: string;
  text: string;
  author: string;
  phase: Phase;
  themeId: ThemeId;
}

interface ActivePlayer {
  id: string;
  name: string;
  joinedAt: number;
  isReady: boolean;
}

export default function GameMasterPage() {
  const [timeLimit, setTimeLimit] = useState(20);
  const [isGameActive, setIsGameActive] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("classic");
  const [selectedJigsawLayout, setSelectedJigsawLayout] = useState<JigsawLayoutId>(DEFAULT_JIGSAW_LAYOUT);
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([]);
  const [newQuote, setNewQuote] = useState<{
    text: string;
    author: string;
    phase: Phase;
    themeId: ThemeId;
  }>({
    text: "",
    author: "",
    phase: "preparation",
    themeId: "classic",
  });

  // Simple handlers
  const handleStartGame = () => {
    setIsGameActive(true);
  };

  const handleEndGame = () => {
    setIsGameActive(false);
  };

  const handleAddQuote = () => {
    if (newQuote.text.trim() && newQuote.author.trim()) {
      const quote: CustomQuote = {
        id: `custom-${Date.now()}`,
        text: newQuote.text.trim(),
        author: newQuote.author.trim(),
        phase: newQuote.phase,
        themeId: newQuote.themeId,
      };
      setCustomQuotes(prev => [...prev, quote]);
      setNewQuote({
        text: "",
        author: "",
        phase: "preparation",
        themeId: "classic"
      });
      toast.success("Custom quote added!");
    }
  };

  const handleRemoveQuote = (id: string) => {
    setCustomQuotes(prev => prev.filter(q => q.id !== id));
    toast.success("Quote removed.");
  };

  const renderWithShell = (content: React.ReactElement) => (
    <div className="relative min-h-screen quest-body overflow-hidden">
      <div className="quest-ambient" />
      <div className="quest-orb animate-pulse" style={{ top: "12%", left: "8%" }} />
      <div className="quest-orb animate-pulse" style={{ bottom: "10%", right: "6%" }} />
      <div className="relative">{content}</div>
    </div>
  );

  return renderWithShell(
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
            <Settings className="w-6 h-6 sm:w-10 sm:h-10" aria-hidden="true" />
            Game Master Control
          </h1>
          <p className="text-sm sm:text-lg text-gray-600">Manage game settings and monitor players</p>
        </header>

        {/* Game Status Banner */}
        <div
          className={`p-3 sm:p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
            isGameActive
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          }`}
        >
          {isGameActive ? (
            <Play className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Square className="w-5 h-5" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold">
              {isGameActive ? "Game Active" : "Game Inactive"}
            </p>
            <p className="text-sm opacity-75">
              {isGameActive
                ? `Started at ${new Date().toLocaleTimeString()}`
                : "Players can join when you start the game"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="players">Players ({activePlayers.length})</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="quotes">Custom Quotes</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            {/* Game Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Game Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      min="5"
                      max="120"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value) || 20)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={selectedTheme} onValueChange={(value: string) => setSelectedTheme(value as ThemeId)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themeList.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layout">Jigsaw Layout</Label>
                  <Select
                    value={selectedJigsawLayout}
                    onValueChange={(value: string) => setSelectedJigsawLayout(value as JigsawLayoutId)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(BOARD_LAYOUTS).map((layout) => (
                        <SelectItem key={layout.type} value={layout.type}>
                          {layout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleStartGame}
                    disabled={isGameActive}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                  <Button
                    onClick={handleEndGame}
                    disabled={!isGameActive}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            {/* Active Players */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activePlayers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No players connected</p>
                ) : (
                  <div className="space-y-2">
                    {activePlayers.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-gray-500">Joined {new Date(player.joinedAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <Badge variant={player.isReady ? "default" : "secondary"}>
                          {player.isReady ? "Ready" : "Waiting"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No scores yet</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 10).map((entry, index) => (
                      <div key={`${entry.name}-${entry.sessionId}`} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-sm text-gray-500">{entry.sessionId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{entry.points}</div>
                          <div className="text-sm text-gray-500">{Math.floor(entry.time / 1000)}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            {/* Custom Quotes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Custom Quotes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quote-text">Quote Text</Label>
                    <Input
                      id="quote-text"
                      value={newQuote.text}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter quote text..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quote-author">Author</Label>
                    <Input
                      id="quote-author"
                      value={newQuote.author}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Enter author name..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quote-phase">Phase</Label>
                    <Select
                      value={newQuote.phase}
                      onValueChange={(value: string) => setNewQuote(prev => ({ ...prev, phase: value as Phase }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preparation">Preparation</SelectItem>
                        <SelectItem value="incubation">Incubation</SelectItem>
                        <SelectItem value="illumination">Illumination</SelectItem>
                        <SelectItem value="verification">Verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quote-theme">Theme</Label>
                    <Select
                      value={newQuote.themeId}
                      onValueChange={(value: string) => setNewQuote(prev => ({ ...prev, themeId: value as ThemeId }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themeList.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAddQuote} className="w-full">
                  <Puzzle className="w-4 h-4 mr-2" />
                  Add Custom Quote
                </Button>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="font-medium">Existing Quotes</h4>
                  {customQuotes.length === 0 ? (
                    <p className="text-gray-500 text-sm">No custom quotes added</p>
                  ) : (
                    customQuotes.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm">&ldquo;{quote.text}&rdquo;</p>
                          <p className="text-xs text-gray-500">- {quote.author}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveQuote(quote.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
