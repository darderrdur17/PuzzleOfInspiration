# 🎮 Game Master & Player Interaction Guide

## Overview
With the new jigsaw layout system, Game Masters can choose from 5 distinct board templates that players see in real-time. Layouts can be changed even during active games, and all connected players will see the update instantly.

---

## 🎯 Game Master Workflow

### **Before Starting a Game**

1. **Navigate to Game Master Console** (`/game-master`)

2. **Select Game Mode**
   - Choose between **"Classic Card Sorting"** or **"Jigsaw Puzzle Mode"**
   - Classic mode uses traditional rectangular cards
   - Jigsaw mode uses irregular puzzle pieces on themed backgrounds

3. **If Jigsaw Mode is Selected:**
   - A new section appears: **"Jigsaw Layout Templates"**
   - You'll see a gallery of 5 layout options:
     - 🌌 **Aurora Grove** – Bioluminescent forest spirals (default for Classic theme)
     - ⏳ **Chrono Forge** – Mechanical rings and copper sparks (default for Science theme)
     - 🌊 **Tidal Circuit** – Waveforms braided with circuitry (default for Entrepreneurship theme)
     - 🪔 **Lumen Bazaar** – Floating lantern markets (default for Art theme)
     - 🏛️ **Mythic Atrium** – Marble atrium with holographic constellations

4. **Choose Your Layout:**
   - Each layout card shows:
     - Preview thumbnail of the background
     - Layout name and description
     - Color palette swatches
     - Badge icon
   - Click any layout to select it
   - Selected layout shows "Active Template" indicator

5. **Select Theme** (optional, affects default layout):
   - Classic → Aurora Grove
   - Science → Chrono Forge
   - Art → Lumen Bazaar
   - Entrepreneurship → Tidal Circuit

6. **Configure Other Settings:**
   - Time limit
   - Number of quotes
   - Quote packs
   - Session name

7. **Click "Start Game"**
   - All settings (including jigsaw layout) are saved and broadcast to players

### **During an Active Game**

1. **Change Layout Mid-Game** (NEW FEATURE!):
   - Scroll to the "Jigsaw Layout Templates" section
   - Click any different layout card
   - **All connected players' boards update instantly** ✨
   - No need to restart the game!

2. **Monitor Players:**
   - See active players in real-time
   - View leaderboard updates
   - Control challenge rounds (Double Points, Rapid Fire)

3. **End Game:**
   - Click "End Game" when finished
   - All players see the completion screen

---

## 🎮 Player Workflow

### **Joining a Game**

1. **Navigate to Play Page** (`/play`)
   - Enter your name
   - Share a creative moment
   - Click "Start"

2. **Game Board Appears:**
   - If Game Master selected **Jigsaw Mode**, you'll see:
     - A themed background image (based on selected layout)
     - 4 drop zones with unique styling:
       - Each zone has a custom icon, title, and hint
       - Zones may be rotated or positioned uniquely
     - Animated effects:
       - Floating orbs drifting across the background
       - Grid patterns (if the layout includes them)
       - Gradient overlays
   - If Game Master selected **Classic Mode**, you'll see traditional card-based layout

3. **Gameplay:**
   - Drag puzzle pieces (or cards in classic mode) to the correct phase zones
   - Each layout has unique visual cues:
     - **Aurora Grove**: Canopy surveys, moss chambers, aurora bursts, root checks
     - **Chrono Forge**: Blueprint benches, pendulum pauses, spark chambers, impact anvils
     - **Tidal Circuit**: Current scans, subsurface drifts, pulse breakers, harbor tests
     - **Lumen Bazaar**: Pattern hunts, lantern drifts, mirror sparks, showcase alley
     - **Mythic Atrium**: Archive walks, echo halls, constellation beams, council plinths

### **Real-Time Updates**

1. **Layout Changes:**
   - If Game Master changes the layout during the game:
     - Your board **automatically updates** within seconds
     - Background image changes
     - Drop zones reposition and restyle
     - Color scheme updates
     - **Your placed pieces remain in their correct positions!**

2. **Hint System:**
   - When a hint is activated (by any player):
     - The relevant phase zone glows with amber light
     - Hint message appears at the top
     - All players can see it

3. **Challenge Rounds:**
   - Double Points: All scores multiply
   - Rapid Fire: Quiz questions appear for bonus points

---

## 🔄 Synchronization Flow

### **How It Works:**

```
Game Master selects layout
    ↓
GameSync.updateConfig({ jigsawLayout: "chronoForge" })
    ↓
Supabase realtime channel broadcasts change
    ↓
All connected players receive update
    ↓
Player boards re-render with new layout
    ↓
Visual update complete (1-2 seconds)
```

### **Key Features:**

- ✅ **Real-time sync**: Changes propagate instantly via Supabase
- ✅ **Fallback support**: Works with localStorage if Supabase unavailable
- ✅ **Mid-game switching**: Layouts can change without restarting
- ✅ **Theme defaults**: Each theme has a recommended default layout
- ✅ **Visual consistency**: All players see the same layout simultaneously

---

## 📋 Layout Details

### **Aurora Grove** 🌌
- **Best for**: Classic creativity, nature-inspired brainstorming
- **Visual style**: Bioluminescent forest canopies and glowing moss paths
- **Colors**: Emerald, teal, golden light
- **Phase zones**: Spiral clearings beneath drifting auroras

### **Chrono Forge** ⏳
- **Best for**: Science, engineering, fabrication sprints
- **Visual style**: Interlocking brass rings, sparks, metronome arcs
- **Colors**: Copper, amber, fuchsia
- **Phase zones**: Rotating plates and kinetic anvils

### **Tidal Circuit** 🌊
- **Best for**: Entrepreneurship, product strategy, systems thinking
- **Visual style**: Ocean gradients laced with luminous circuitry
- **Colors**: Cyan, electric blue, sunrise orange
- **Phase zones**: Wave-shaped bays and harbor docks

### **Lumen Bazaar** 🪔
- **Best for**: Art, storytelling, culture-focused workshops
- **Visual style**: Night market fabrics, lantern strings, mirrored stalls
- **Colors**: Magenta, tangerine, saffron
- **Phase zones**: Market tables and drifting lantern platforms

### **Mythic Atrium** 🏛️
- **Best for**: Reflective sessions, retros, lore building
- **Visual style**: Marble plinths, holographic constellations, archival halls
- **Colors**: Periwinkle, icy blue, soft gold
- **Phase zones**: Elevated plinths arranged like a ceremonial council

---

## 💡 Tips for Game Masters

1. **Experiment During Setup**: Try different layouts before starting to see which fits your session
2. **Match Theme to Content**: Use Science theme → Chrono Forge for STEM classes
3. **Surprise Players**: Change layouts mid-game to keep things fresh
4. **Use Hints Strategically**: The glowing zones help guide players
5. **Monitor Engagement**: Watch active players count to see if layout changes affect participation

---

## 🎨 Visual Differences

### **Classic Mode:**
- Rectangular cards
- Simple drop zones
- Traditional board layout
- Faster gameplay

### **Jigsaw Mode:**
- Irregular puzzle pieces
- Themed background images
- Animated overlays
- Immersive experience
- Unique phase legends per layout

---

## 🔧 Technical Notes

- Layout selection is stored in `GameConfig.jigsawLayout`
- Changes sync via Supabase realtime subscriptions
- Fallback to localStorage for offline play
- Layout configs are in `/lib/jigsawThemes.ts`
- Each layout has its own phase zone coordinates and styling

---

**Enjoy creating engaging puzzle experiences! 🧩✨**

