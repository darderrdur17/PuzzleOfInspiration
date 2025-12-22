 # Puzzle of Inspiration 🧩✨

An educational web-based jigsaw puzzle game that teaches the four phases of creativity through an interactive, engaging experience. Perfect for classrooms and self-learning!

## 🎯 Features

- **Interactive Drag & Drop**: Intuitive puzzle mechanics with smooth drag-and-drop functionality
- **Mobile-Friendly**: Fully responsive design optimized for mobile devices with touch support
- **Educational Content**: Learn about the four phases of creativity:
  - **Preparation**: Gathering information and research
  - **Incubation**: Letting ideas develop subconsciously
  - **Illumination**: The "aha!" moment of insight
  - **Verification**: Testing and refining ideas
- **Progress Tracking**: Real-time progress bar and completion tracking
- **Leaderboard**: Session-based leaderboard to track top scores
- **Timer**: Track your completion time
- **Beautiful UI**: Modern, clean interface with smooth animations
- **5 Jigsaw Layout Templates**: Aurora Grove, Chrono Forge, Tidal Circuit, Lumen Bazaar, and Mythic Atrium are all selectable live from the Game Master console (syncs to both main game and Pixi jigsaw demo page)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase project (free tier is fine) with anon/public API key

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Supabase setup (for cross-device sync)

1. Create a Supabase project (free tier).
2. Run `supabase_schema.sql` in the SQL editor to create tables and RLS policies.
3. Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart `npm run dev`.

## 🎮 How to Play

1. **Start**: Enter your name and share a creative moment from your experience
2. **Sort Titles**: Drag the phase titles (Preparation, Incubation, Illumination, Verification) to the correct puzzle zones
3. **Sort Quotes**: Drag quotes to match them with their corresponding creative phases
4. **Complete**: Place all pieces correctly to complete the puzzle!
5. **Review**: See your score, time, and rank on the leaderboard

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React

## 📁 Project Structure

```
PuzzleOfInspiration/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main game page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/
│   │   └── button.tsx      # Button component
│   ├── StartScreen.tsx     # Game start screen
│   ├── EndScreen.tsx       # Game completion screen
│   ├── QuoteCard.tsx       # Quote display component
│   ├── Timer.tsx           # Timer component
│   └── PuzzleBoard.tsx     # Main puzzle board
├── data/
│   └── quotes.ts           # Quote data
├── types/
│   └── game.ts             # TypeScript type definitions
├── lib/
│   └── utils.ts            # Utility functions
└── package.json
```

## 🎨 Customization

### Adding More Quotes

Edit `data/quotes.ts` to add more quotes. Each quote needs:
- `id`: Unique identifier
- `text`: The quote text
- `author`: Author name
- `phase`: One of "preparation", "incubation", "illumination", or "verification"

### Styling

The app uses Tailwind CSS with custom color variables defined in `app/globals.css`. You can customize colors by modifying the CSS variables in the `:root` selector.

## 📱 Mobile Optimization

- Touch-friendly drag and drop
- Responsive grid layouts
- Mobile-optimized spacing and typography
- Touch manipulation CSS for better mobile performance

## 🧪 Testing

To test the application:

1. Start the development server
2. Test drag and drop functionality on desktop
3. Test on mobile devices or using browser dev tools
4. Verify leaderboard persistence (sessionStorage)
5. Test game completion and scoring

## 🚢 Building for Production

```bash
npm run build
npm start
```

## 📝 License

This project is created for educational purposes.

## 🤝 Contributing

Feel free to enhance this project! Some ideas:
- Add more quotes and educational content
- Implement difficulty levels
- Add sound effects
- Create different puzzle themes
- Add multiplayer support
- Implement persistent leaderboard (database)

## 📧 Support

For questions or issues, please open an issue in the repository.

---

**Enjoy learning about creativity! 🎨✨**

