"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameTheme, gameThemes, ThemeConfig } from "@/lib/gameThemes";
import { Palette, Sparkles, Star, Eye } from "lucide-react";

interface ThemeSelectorProps {
  selectedTheme: GameTheme;
  onThemeSelect: (theme: GameTheme) => void;
  isVisible: boolean;
  onClose: () => void;
}

const themeIcons = {
  observatory: Star,
  alchemist: Sparkles,
  gardener: Palette,
  explorer: Eye,
};

export function ThemeSelector({ selectedTheme, onThemeSelect, isVisible, onClose }: ThemeSelectorProps) {
  if (!isVisible) return null;

  const handleThemeSelect = (themeId: GameTheme) => {
    onThemeSelect(themeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-card border-2 border-primary">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Choose Your Creative World</h2>
              <p className="text-muted-foreground mt-1">Each theme brings unique visuals and creative inspiration</p>
            </div>
            <Button variant="outline" onClick={onClose} className="shrink-0">
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(gameThemes).map(([themeId, theme]) => {
              const Icon = themeIcons[themeId as GameTheme];
              const isSelected = selectedTheme === themeId;

              return (
                <Card
                  key={themeId}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                    isSelected
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleThemeSelect(themeId as GameTheme)}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.visualElements.colorScheme.primary }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{theme.name}</h3>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-2">Creative Phases:</h4>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {Object.entries(theme.mechanics.phaseNames).map(([phase, name]) => (
                            <div key={phase} className="text-muted-foreground">
                              • {name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {theme.mechanics.specialFeatures && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2">Special Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {theme.mechanics.specialFeatures.map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {feature.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.visualElements.colorScheme.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.visualElements.colorScheme.secondary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.visualElements.colorScheme.accent }}
                        />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 flex items-center gap-2 text-primary font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Selected Theme
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Themes affect visuals, quotes, and puzzle mechanics
            </p>
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
              Start with {gameThemes[selectedTheme].name}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
