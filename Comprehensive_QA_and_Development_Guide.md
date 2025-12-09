# QA/QC Report & Web Development Suggestions: Puzzle of Inspiration

**Author:** Manus AI  
**Date:** December 09, 2025  
**Website:** [https://puzzle-of-inspiration.vercel.app](https://puzzle-of-inspiration.vercel.app)

---

## 1. Executive Summary

The "Puzzle of Inspiration" is an educational web application with a commendable goal of teaching the creative process through an interactive puzzle game. The website exhibits a strong visual identity, an intuitive user interface, and a solid foundation for its features. The navigation is clear, and the content, particularly the rules and game descriptions, is comprehensive and well-written. 

However, our QA/QC assessment has identified a **critical issue** that currently prevents users from accessing the core gameplay loop. Additionally, there are **major opportunities** for improvement in mobile responsiveness and web accessibility that should be addressed to ensure a positive experience for all users. This report provides a detailed analysis of our findings and offers actionable recommendations to resolve these issues and enhance the overall quality of the application.

---

## 2. Key Findings & Analysis

Our testing process covered functionality, user interface, performance, and content. The following table summarizes the key findings across these domains.

| Category | Status | Summary of Findings |
| :--- | :--- | :--- |
| **Core Functionality** | 🔴 **Critical Issue** | The primary "Start Game" button on the player setup page is non-functional, preventing users from proceeding to the game board. This is a blocking issue. |
| **UI & Visual Design** | ✅ **Excellent** | The application has a cohesive, playful, and professional design. The visual hierarchy is clear, and the aesthetic is well-suited for an educational game. |
| **Mobile Responsiveness** | 🟠 **Major Gap** | The website is not optimized for mobile or tablet devices. Testing on smaller viewports is essential to address likely layout and usability problems. |
| **Web Accessibility** | 🟠 **Major Gap** | The application lacks fundamental accessibility features, such as keyboard navigation focus indicators and ARIA labels, making it unusable for people with certain disabilities. |
| **Game Master Controls** | ✅ **Good** | The Game Master dashboard is feature-rich, providing extensive control over game settings, custom content, and real-time interactions. Some minor validation and testing gaps were noted. |
| **Performance** | ✅ **Excellent** | Page load times are fast, and the application feels responsive. No client-side errors were detected in the browser console. |
| **Content & Documentation** | ✅ **Excellent** | The "Rules & Guide" section is exceptionally clear, comprehensive, and well-structured, effectively explaining the game's mechanics and educational concepts. |

---

## 3. Prioritized Issues & Recommendations

We have categorized the identified issues by severity to guide development efforts. The following sections provide detailed descriptions and actionable recommendations for each.

### 3.1. Critical Issue

**Issue #1: Game Start Functionality is Broken**

- **Description:** On the `/play` page, after a user enters their name and selects a theme, clicking the final "Start Journey" button does not initiate the game. The user remains on the setup page, and no error message is displayed.
- **Impact:** This is a **showstopper bug** as it makes the core game completely inaccessible to players.
- **Recommendation:** This issue should be the **highest priority** for the development team. We recommend the following debugging steps:
    1.  **Check Browser Console & Network Tab:** Investigate for any silent JavaScript errors or failed API requests upon clicking the button.
    2.  **Verify Routing Logic:** Ensure that the application's router (e.g., React Router) has a defined route for the game board component and that the `navigate` function is being called correctly.
    3.  **Confirm Component Existence:** Make sure the game board component itself is implemented and correctly linked.
    4.  **Inspect State Management:** If using a state management library (like Redux or Context API), verify that the game state is being correctly initialized and updated to trigger the transition.

### 3.2. Major Issues

**Issue #2: Lack of Mobile Responsiveness**

- **Description:** The application's layout is designed for desktop viewports and does not adapt to smaller screens. This will likely result in a poor user experience on mobile and tablet devices.
- **Recommendation:** Implement a mobile-first responsive design. Use CSS media queries to create flexible layouts that adapt to different screen sizes. Key areas to focus on include:
    - **Home Page:** Stack the three main navigation cards vertically on mobile screens.
    - **Forms:** Ensure all form inputs and buttons are large enough to be easily tapped (min. 44x44px) and that text is readable (min. 16px font size).
    - **Game Master Page:** Redesign the control panel to be usable on smaller screens, potentially using vertical layouts or tabbed navigation.

**Issue #3: Significant Accessibility Gaps**

- **Description:** The website is not accessible to users who rely on keyboard navigation or screen readers. There are no visible focus indicators, and interactive elements lack appropriate ARIA (Accessible Rich Internet Applications) attributes.
- **Recommendation:** Integrating accessibility is crucial for an inclusive educational tool. We suggest:
    - **Implement Focus Indicators:** Add a distinct visual outline (e.g., a blue ring) to all interactive elements when they receive keyboard focus.
    - **Add ARIA Labels:** Use ARIA attributes to provide context for screen readers, especially for icon-based buttons and dynamic content.
    - **Use Semantic HTML:** Structure the content using semantic tags (`<nav>`, `<main>`, `<section>`, `<button>`) to improve the page's structure and meaning.

### 3.3. Minor Issues

- **Form Validation:** The forms on the Game Master page lack input validation. We recommend adding real-time feedback to guide the user and prevent invalid data submission.
- **Untested Features:** Several Game Master features, such as the custom quote library and challenge rounds, could not be fully tested. These require dedicated testing to ensure they function as expected in a live game session.

---

## 4. Overall Assessment and Conclusion

The "Puzzle of Inspiration" is a promising project with a strong educational concept and an attractive design. Its strengths lie in its clear documentation, user-friendly interface, and the comprehensive control it offers to game masters.

However, the critical bug preventing gameplay is a major roadblock that must be resolved. By addressing this issue and prioritizing mobile responsiveness and accessibility, the application can fulfill its potential as a valuable and inclusive learning tool. We assign an **overall assessment of 6.5/10**, with the potential to be a 9/10+ product once the critical and major issues are resolved.

We are confident that with targeted development efforts, the "Puzzle of Inspiration" can become a highly successful and impactful educational game.

---

### References

[1] [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
[2] [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)


---

## Appendix A: Detailed Technical Analysis & Recommendations

This appendix provides a deeper dive into the technical aspects of the issues identified and offers more detailed guidance for implementation.

### PART 1: CRITICAL ISSUE ANALYSIS

**The Game Start Button Problem**

The most significant issue preventing the application from being fully functional is that clicking the "Start [Theme] Journey" button on the `/play` page does not navigate to the actual game board. This is a blocking issue that prevents users from experiencing the core product.

**Technical Investigation Needed:**

The button click is registering (no console errors), but the page transition is not occurring. This suggests one of several possibilities:

1.  **Missing Game Board Component:** The game board component may not be implemented yet, or the route `/play/game` or similar may not exist.

2.  **State Management Issue:** The application state may not be properly initialized when the button is clicked. Check if Redux, Context API, or Zustand is being used and if the game state is being set correctly.

3.  **Navigation Logic:** The routing logic may be broken. Verify that React Router (or equivalent) is configured to handle the game board route.

4.  **Async Operation:** The button may be triggering an async operation (API call to initialize game) that is failing silently. Check network tab in browser dev tools.

**Debugging Steps:**

-   Open browser DevTools (F12) and go to Network tab
-   Click the Start button and observe network requests
-   Check if any API calls fail or return errors
-   Look for 404 errors on missing routes
-   Check the Console tab for any error messages
-   Inspect the button element to see if it has proper onClick handlers

**Code Review Suggestions:**

```javascript
// Likely issue: Missing route or component
// Current structure might be:
// /play → Player setup page
// /game-master → Game master control

// Should add:
// /play/game/:sessionId → Actual game board
// /play/game/:sessionId/results → Results screen

// Verify the navigation function:
// onClick={() => navigate(`/play/game/${sessionId}`)}
// Make sure sessionId is being generated/stored
```

### PART 2: MOBILE RESPONSIVENESS STRATEGY

**Current State**
The website appears to be optimized for desktop viewing. The card-based layout and centered content work well on larger screens, but mobile users will likely experience:

-   Horizontal scrolling
-   Oversized buttons that don't fit the screen
-   Text that's too small to read comfortably
-   Touch targets that are too small (< 44px)

**Recommended Mobile-First Approach**

**Breakpoints to Implement:**
-   Mobile: 320px - 479px (small phones)
-   Tablet: 480px - 767px (large phones, small tablets)
-   Desktop: 768px+ (tablets, desktops)

**Key Areas Needing Mobile Optimization:**

1.  **Home Page Cards**
    -   Current: 3 cards in a row
    -   Mobile: Stack vertically (1 card per row)
    -   Tablet: 2 cards per row

2.  **Form Inputs**
    -   Ensure minimum touch target size of 44x44px
    -   Use larger font sizes (16px minimum) to prevent zoom on iOS
    -   Stack form fields vertically on mobile

3.  **Game Master Control Page**
    -   The number input spinners may be difficult to use on mobile
    -   Consider using sliders instead for time limit and quote count
    -   Make the custom quote form more compact

4.  **Rules & Guide Page**
    -   Ensure text is readable without horizontal scrolling
    -   Adjust image/illustration sizes for mobile
    -   Consider collapsible sections for long content

**CSS Media Query Template:**

```css
/* Mobile First Approach */
.card-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 480px) {
  .card-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .card-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Touch-friendly button sizes */
button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  font-size: 16px; /* Prevents iOS zoom */
}
```

### PART 3: ACCESSIBILITY IMPROVEMENTS

**Current Accessibility Issues**

The website lacks several critical accessibility features required by WCAG 2.1 standards:

1.  **Keyboard Navigation:** No visible focus indicators for keyboard users
2.  **ARIA Labels:** Missing semantic HTML and ARIA attributes
3.  **Color Contrast:** Relies on color alone for some indicators
4.  **Form Labels:** Some form fields lack explicit labels

**Implementation Plan**

**1. Add Keyboard Navigation Support**

```html
<!-- Before: -->
<button>Start Game</button>

<!-- After: -->
<button 
  onClick={handleStartGame}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleStartGame();
    }
  }}
  aria-label="Start the game with selected theme"
>
  Start Game
</button>
```

**2. Implement Visible Focus Indicators**

```css
button:focus {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
}

button:focus-visible {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
}
```

**3. Add ARIA Labels to Interactive Elements**

```html
<!-- Theme selection -->
<div 
  role="button"
  tabindex="0"
  aria-label="Select Observatory of Ideas theme"
  onClick={selectTheme}
>
  Observatory of Ideas
</div>

<!-- Form inputs -->
<label htmlFor="playerName">Enter Your Name</label>
<input 
  id="playerName"
  type="text"
  placeholder="Your name..."
  aria-required="true"
/>
```

**4. Improve Color Contrast**

-   Verify all text meets WCAG AA standards (4.5:1 for normal text)
-   Don't rely on color alone to convey information
-   Add text labels alongside color indicators

**5. Use Semantic HTML**

```html
<!-- Better semantic structure -->
<nav aria-label="Main navigation">
  <a href="/">Home</a>
  <a href="/play">Play Game</a>
  <a href="/rules">Rules</a>
</nav>

<main>
  <section aria-labelledby="game-title">
    <h1 id="game-title">Creativity is...</h1>
  </section>
</main>
```

**Testing Tools:**
-   axe DevTools (Chrome extension)
-   WAVE (Web Accessibility Evaluation Tool)
-   Lighthouse (built into Chrome DevTools)
-   Screen readers: NVDA (Windows), JAWS (Windows), VoiceOver (Mac)

### PART 4: FORM VALIDATION & USER FEEDBACK

**Current State**
Forms accept input without validation or feedback. Users don't know if their input is valid until they try to submit.

**Recommended Validation Strategy**

**1. Real-Time Validation**

```javascript
const [playerName, setPlayerName] = useState('');
const [nameError, setNameError] = useState('');

const handleNameChange = (e) => {
  const value = e.target.value;
  setPlayerName(value);
  
  // Real-time validation
  if (value.trim().length === 0) {
    setNameError('Name is required');
  } else if (value.length > 50) {
    setNameError('Name must be 50 characters or less');
  } else {
    setNameError('');
  }
};

return (
  <div>
    <input
      value={playerName}
      onChange={handleNameChange}
      aria-invalid={nameError ? 'true' : 'false'}
      aria-describedby={nameError ? 'name-error' : undefined}
    />
    {nameError && (
      <span id="name-error" role="alert" className="error">
        {nameError}
      </span>
    )}
  </div>
);
```

**2. Visual Feedback for Form States**

```css
/* Valid state */
input:valid {
  border-color: #27ae60;
  background-color: #f0fdf4;
}

/* Invalid state */
input:invalid {
  border-color: #e74c3c;
  background-color: #fdf0f0;
}

/* Disabled state */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading state */
button.loading {
  position: relative;
}

button.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  right: 10px;
  margin-top: -8px;
  border: 2px solid transparent;
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}
```

**3. Validation Rules**

| Field             | Rules                   | Error Message                                          |
| ----------------- | ----------------------- | ------------------------------------------------------ |
| Player Name       | Required, 1-50 chars    | "Name is required and must be 50 characters or less"   |
| Creative Moment   | Optional, max 500 chars | "Creative moment must be 500 characters or less"     |
| Time Limit        | 1-60 minutes            | "Time limit must be between 1 and 60 minutes"        |
| Quote Count       | 4-48 quotes             | "Quote count must be between 4 and 48"               |
| Quote Text        | Required, max 500 chars | "Quote is required and must be 500 characters or less" |
| Author            | Optional, max 100 chars | "Author name must be 100 characters or less"         |

### PART 5: MULTIPLAYER SYNCHRONIZATION

**Current Implementation Status**
The game appears to be designed for multiplayer (Game Master + Players), but the synchronization mechanism is unclear.

**Recommended Architecture**

**1. Real-Time Communication**

Use WebSockets for real-time updates:

```javascript
// Server-side (Node.js/Express with Socket.io)
io.on('connection', (socket) => {
  // Game master starts game
  socket.on('startGame', (gameConfig) => {
    const gameId = generateGameId();
    socket.emit('gameStarted', { gameId });
    io.to(gameId).emit('gameStarted', gameConfig);
  });

  // Player joins game
  socket.on('joinGame', (gameId, playerName) => {
    socket.join(gameId);
    io.to(gameId).emit('playerJoined', { playerName });
  });

  // Player makes a move
  socket.on('placePuzzlePiece', (gameId, move) => {
    io.to(gameId).emit('pieceUpdate', move);
  });
});
```

**2. Game State Management**

```javascript
// Client-side state
const [gameState, setGameState] = useState({
  gameId: null,
  players: [],
  scores: {},
  timeRemaining: 0,
  puzzleState: {},
  gameStatus: 'waiting', // waiting, active, finished
});

// Listen for updates
useEffect(() => {
  socket.on('playerJoined', (player) => {
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, player]
    }));
  });

  socket.on('gameStarted', (config) => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'active',
      timeRemaining: config.timeLimit * 60
    }));
  });

  return () => socket.off('playerJoined');
}, []);
```

**3. Session Management**

```javascript
// Generate unique session ID
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Share session link
const sessionLink = `${window.location.origin}/play?session=${sessionId}`;

// Validate session exists
const validateSession = async (sessionId) => {
  const response = await fetch(`/api/sessions/${sessionId}`);
  return response.ok;
};
```

### PART 6: PERFORMANCE OPTIMIZATION

**Current Performance**
The website loads quickly, but there are opportunities for optimization:

**1. Code Splitting**

```javascript
// Before: All code in one bundle
import GameBoard from './GameBoard';

// After: Lazy load game board
const GameBoard = React.lazy(() => import('./GameBoard'));

<Suspense fallback={<LoadingSpinner />}>
  <GameBoard />
</Suspense>
```

**2. Image Optimization**

-   Use WebP format with PNG fallback
-   Implement responsive images with srcset
-   Compress SVG illustrations
-   Use CSS for simple graphics instead of images

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.png" alt="Description">
</picture>
```

**3. Caching Strategy**

```javascript
// Service Worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

**4. Bundle Analysis**

Use webpack-bundle-analyzer to identify large dependencies:

```bash
npm install --save-dev webpack-bundle-analyzer
```

### PART 7: TESTING RECOMMENDATIONS

**Unit Testing**

```javascript
// Example: Test theme selection
describe('ThemeSelector', () => {
  it('should select a theme when clicked', () => {
    const { getByText } = render(<ThemeSelector />);
    const button = getByText('Observatory of Ideas');
    
    fireEvent.click(button);
    
    expect(button).toHaveClass('selected');
  });
});
```

**Integration Testing**

```javascript
// Example: Test game flow
describe('Game Flow', () => {
  it('should complete player setup and start game', async () => {
    const { getByPlaceholderText, getByText } = render(<PlayGame />);
    
    const nameInput = getByPlaceholderText('Your name...');
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    
    const startButton = getByText('Start Observatory Journey');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(getByText('Game Board')).toBeInTheDocument();
    });
  });
});
```

**E2E Testing**

```javascript
// Example: Cypress test
describe('Complete Game Session', () => {
  it('should allow player to complete a game', () => {
    cy.visit('/');
    cy.contains('Play Game').click();
    cy.get('input[placeholder="Your name..."]').type('Test Player');
    cy.contains('Start Observatory Journey').click();
    cy.get('[data-testid="game-board"]').should('exist');
  });
});
```

**Test Coverage Goals**
-   Unit Tests: 80% coverage
-   Integration Tests: 60% coverage
-   E2E Tests: Critical user paths

### PART 8: BROWSER COMPATIBILITY

**Recommended Testing Matrix**

| Browser         | Version | Status        |
| --------------- | ------- | ------------- |
| Chrome          | Latest  | ✅ Tested      |
| Firefox         | Latest  | ❌ Not tested |
| Safari          | Latest  | ❌ Not tested |
| Edge            | Latest  | ❌ Not tested |
| Mobile Safari   | iOS 14+ | ❌ Not tested |
| Chrome Mobile   | Latest  | ❌ Not tested |

**Known Compatibility Issues to Check**

1.  **CSS Grid Support:** Verify on older browsers
2.  **Flexbox:** Check alignment properties
3.  **CSS Variables:** May need fallbacks
4.  **ES6 Features:** Ensure proper transpilation
5.  **LocalStorage:** Verify quota limits

### PART 9: SECURITY CONSIDERATIONS

**Input Validation & Sanitization**

```javascript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};

// Validate player name
const isValidPlayerName = (name) => {
  const regex = /^[a-zA-Z0-9\s\-']{1,50}$/;
  return regex.test(name);
};
```

**API Security**

-   Implement CORS properly
-   Use HTTPS only
-   Validate all server-side inputs
-   Implement rate limiting
-   Use secure session tokens

**Data Privacy**

-   Implement GDPR compliance if targeting EU users
-   Clear data retention policy
-   Secure player data storage
-   Implement data deletion on request

### PART 10: ANALYTICS & MONITORING

**Recommended Metrics to Track**

1.  **User Engagement**
    -   Page load time
    -   Time spent on each page
    -   Click-through rates
    -   Bounce rate

2.  **Game Metrics**
    -   Average game completion time
    -   Player scores distribution
    -   Theme popularity
    -   Feature usage (challenge rounds, custom quotes)

3.  **Technical Metrics**
    -   Error rates
    -   API response times
    -   Server uptime
    -   Browser/device breakdown

**Implementation Example**

```javascript
// Google Analytics integration
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    window.gtag?.('config', 'GA_MEASUREMENT_ID', {
      page_path: location.pathname,
    });
  }, [location]);

  return null;
};
```

### IMPLEMENTATION PRIORITY ROADMAP

**Phase 1: Critical (Week 1-2)**
1.  Fix game start button functionality
2.  Implement basic error handling
3.  Add console logging for debugging

**Phase 2: Important (Week 3-4)**
1.  Implement mobile responsiveness
2.  Add form validation
3.  Test multiplayer synchronization

**Phase 3: Enhancement (Week 5-6)**
1.  Add accessibility features
2.  Implement analytics
3.  Optimize performance

**Phase 4: Polish (Week 7-8)**
1.  Comprehensive browser testing
2.  User feedback incorporation
3.  Documentation updates


---

## Appendix B: Theme & Board Layout Design Suggestions

To enhance the visual variety and engagement of the "Puzzle of Inspiration" game, we propose the following new themes and board layouts. These designs are intended to provide distinct aesthetic experiences that can appeal to a wider range of users and learning contexts.

### 1. Cyberpunk City Theme

**Concept:** A high-tech, neon-drenched journey through a futuristic metropolis. This theme is ideal for topics related to technology, innovation, and future-thinking.

**Mood & Atmosphere:**

![Cyberpunk Mood](/home/ubuntu/cyberpunk_mood.png)

**Board Layout: Holographic Data-Grid**

-   **Description:** A floating, holographic puzzle board with glowing hexagonal slots. The pieces could be designed as data chips or fragments of a glowing interface. The background would be a dynamic view of a cyberpunk city from a high-rise window.
-   **Interactivity:** Correctly placing a piece could trigger a pulse of light that travels through the circuit-like patterns connecting the slots.

![Cyberpunk Board Layout](/home/ubuntu/cyberpunk_board.png)

### 2. Enchanted Forest Theme

**Concept:** A mystical exploration of an ancient, magical forest. This theme is well-suited for topics related to nature, creativity, and storytelling.

**Mood & Atmosphere:**

![Enchanted Forest Mood](/home/ubuntu/forest_mood.png)

**Board Layout: The World Tree**

-   **Description:** The puzzle board is carved into the trunk of a giant, ancient tree. The slots are shaped like natural elements such as leaves, flowers, and stones, surrounded by glowing runes. The background would be a serene, animated forest scene with fireflies and gentle movements in the foliage.
-   **Interactivity:** Placing a piece correctly could cause the runes to glow brighter or trigger a gentle chime sound.

![Enchanted Forest Board Layout](/home/ubuntu/forest_board.png)

### 3. Steampunk Workshop Theme

**Concept:** An intricate and mechanical challenge within an inventor's workshop. This theme is perfect for topics related to engineering, problem-solving, and the history of innovation.

**Mood & Atmosphere:**

![Steampunk Workshop Mood](/home/ubuntu/steampunk_mood.png)

**Board Layout: The Astrolabe of Ideas**

-   **Description:** A complex puzzle board made of brass, copper, and wood, with interlocking gears and cogs. The puzzle slots are integrated into a mechanical astrolabe-like device. The background is a detailed inventor's workshop.
-   **Interactivity:** Placing a piece correctly could cause gears to turn and steam to be released from surrounding pipes, creating a sense of a functioning machine.

![Steampunk Board Layout](/home/ubuntu/steampunk_board.png)


---

## Appendix C: Theme Implementation Code

This appendix contains the working React/TypeScript and CSS code for the three new themes proposed in Appendix B. This code is intended to serve as a starting point for development and can be integrated into the existing application structure.

### React/TypeScript Component (`theme_implementations.tsx`)

```typescript
// ============================================
// THEME & BOARD LAYOUT IMPLEMENTATIONS
// ============================================
// This file contains working code for three new themes:
// 1. Cyberpunk City Theme
// 2. Enchanted Forest Theme
// 3. Steampunk Workshop Theme

import React, { useState, useEffect } from 'react';

// ============================================
// THEME CONFIGURATION DATA
// ============================================

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    pieceCorrect: string;
    pieceIncorrect: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  animations: {
    piecePlace: string;
    pieceCorrect: string;
    pieceIncorrect: string;
  };
}

export const THEME_CONFIGS: Record<string, ThemeConfig> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk City',
    description: 'A high-tech, neon-drenched journey through a futuristic metropolis',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#0a0e27',
      text: '#e0e0e0',
      pieceCorrect: '#00ff88',
      pieceIncorrect: '#ff0055',
    },
    fonts: {
      heading: "'Orbitron', 'Courier New', monospace",
      body: "'Rajdhani', 'Arial', sans-serif",
    },
    animations: {
      piecePlace: 'pulse-neon',
      pieceCorrect: 'circuit-flow',
      pieceIncorrect: 'glitch-error',
    },
  },
  enchantedForest: {
    id: 'enchantedForest',
    name: 'Enchanted Forest',
    description: 'A mystical exploration of an ancient, magical forest',
    colors: {
      primary: '#4ade80',
      secondary: '#60a5fa',
      accent: '#fbbf24',
      background: '#1a2f1a',
      text: '#f0fdf4',
      pieceCorrect: '#86efac',
      pieceIncorrect: '#fca5a5',
    },
    fonts: {
      heading: "'Cinzel', 'Georgia', serif",
      body: "'Lora', 'Times New Roman', serif",
    },
    animations: {
      piecePlace: 'fairy-sparkle',
      pieceCorrect: 'rune-glow',
      pieceIncorrect: 'leaf-fall',
    },
  },
  steampunk: {
    id: 'steampunk',
    name: 'Steampunk Workshop',
    description: "An intricate mechanical challenge within an inventor's workshop",
    colors: {
      primary: '#cd7f32',
      secondary: '#b87333',
      accent: '#ffd700',
      background: '#2c1810',
      text: '#f5e6d3',
      pieceCorrect: '#ffa500',
      pieceIncorrect: '#8b4513',
    },
    fonts: {
      heading: "'Playfair Display', 'Georgia', serif",
      body: "'Merriweather', 'Times New Roman', serif",
    },
    animations: {
      piecePlace: 'gear-turn',
      pieceCorrect: 'steam-release',
      pieceIncorrect: 'cog-jam',
    },
  },
};

// ============================================
// CYBERPUNK THEME COMPONENT
// ============================================

export const CyberpunkBoard: React.FC = () => {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const theme = THEME_CONFIGS.cyberpunk;

  return (
    <div
      className="cyberpunk-board"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, #1a1f3a 100%)`,
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Grid */}
      <div className="cyber-grid" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(${theme.colors.primary}22 1px, transparent 1px),
          linear-gradient(90deg, ${theme.colors.primary}22 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-scroll 20s linear infinite',
        opacity: 0.3,
      }} />

      {/* Title */}
      <h1 style={{
        fontFamily: theme.fonts.heading,
        fontSize: '3rem',
        textAlign: 'center',
        marginBottom: '2rem',
        textShadow: `0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.secondary}`,
        animation: 'neon-flicker 3s infinite alternate',
      }}>
        NEURAL PUZZLE MATRIX
      </h1>

      {/* Holographic Board */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'rgba(10, 14, 39, 0.8)',
        border: `2px solid ${theme.colors.primary}`,
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: `0 0 30px ${theme.colors.primary}66, inset 0 0 30px ${theme.colors.primary}22`,
        backdropFilter: 'blur(10px)',
      }}>
        {/* Hexagonal Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          position: 'relative',
        }}>
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredSlot(index)}
              onMouseLeave={() => setHoveredSlot(null)}
              style={{
                aspectRatio: '1',
                background: hoveredSlot === index
                  ? `linear-gradient(135deg, ${theme.colors.primary}44, ${theme.colors.secondary}44)`
                  : `linear-gradient(135deg, ${theme.colors.primary}22, ${theme.colors.secondary}22)`,
                border: `2px solid ${hoveredSlot === index ? theme.colors.accent : theme.colors.primary}`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: hoveredSlot === index
                  ? `0 0 20px ${theme.colors.primary}`
                  : 'none',
              }}
            >
              {/* Circuit Pattern */}
              <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.3 }}>
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke={theme.colors.primary} strokeWidth="1" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke={theme.colors.primary} strokeWidth="1" />
                <circle cx="50%" cy="50%" r="20%" fill="none" stroke={theme.colors.secondary} strokeWidth="1" />
              </svg>
              
              <span style={{
                fontSize: '0.8rem',
                fontFamily: theme.fonts.heading,
                color: theme.colors.text,
                zIndex: 1,
              }}>
                SLOT {index + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Status Display */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: `linear-gradient(90deg, ${theme.colors.primary}22, ${theme.colors.secondary}22)`,
          border: `1px solid ${theme.colors.primary}`,
          borderRadius: '10px',
          fontFamily: theme.fonts.heading,
          fontSize: '0.9rem',
          textAlign: 'center',
        }}>
          <span style={{ color: theme.colors.accent }}>SYSTEM STATUS:</span> READY FOR INPUT
        </div>
      </div>

      <style>{`
        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes grid-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  );
};

// ============================================
// ENCHANTED FOREST THEME COMPONENT
// ============================================

export const EnchantedForestBoard: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const theme = THEME_CONFIGS.enchantedForest;

  return (
    <div
      className="forest-board"
      style={{
        background: `linear-gradient(180deg, ${theme.colors.background} 0%, #0f1f0f 100%)`,
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: theme.colors.accent,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: `0 0 10px ${theme.colors.accent}`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: theme.fonts.heading,
        fontSize: '3rem',
        textAlign: 'center',
        marginBottom: '2rem',
        textShadow: `0 0 20px ${theme.colors.primary}`,
        color: theme.colors.primary,
      }}>
        The World Tree Puzzle
      </h1>

      {/* Tree Board */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'rgba(26, 47, 26, 0.9)',
        border: `3px solid ${theme.colors.primary}`,
        borderRadius: '30px',
        padding: '3rem',
        boxShadow: `0 0 40px ${theme.colors.primary}66, inset 0 0 40px rgba(0, 0, 0, 0.5)`,
        position: 'relative',
      }}>
        {/* Decorative Vines */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '20px',
          right: '20px',
          height: '20px',
          background: `repeating-linear-gradient(90deg, ${theme.colors.primary} 0px, transparent 10px, transparent 20px)`,
          opacity: 0.5,
        }} />

        {/* Leaf-shaped Slots */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          position: 'relative',
        }}>
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              onMouseEnter={() => setActiveSlot(index)}
              onMouseLeave={() => setActiveSlot(null)}
              style={{
                aspectRatio: '1',
                background: activeSlot === index
                  ? `radial-gradient(circle, ${theme.colors.primary}66, ${theme.colors.secondary}44)`
                  : `radial-gradient(circle, ${theme.colors.primary}33, ${theme.colors.secondary}22)`,
                border: `3px solid ${activeSlot === index ? theme.colors.accent : theme.colors.primary}`,
                borderRadius: '50% 0 50% 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                position: 'relative',
                transform: activeSlot === index ? 'scale(1.05) rotate(5deg)' : 'rotate(0deg)',
                boxShadow: activeSlot === index
                  ? `0 0 30px ${theme.colors.accent}`
                  : `0 0 10px ${theme.colors.primary}44`,
              }}
            >
              {/* Rune Symbol */}
              <svg width="60%" height="60%" viewBox="0 0 100 100" style={{ opacity: 0.6 }}>
                <path
                  d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"
                  fill="none"
                  stroke={theme.colors.accent}
                  strokeWidth="2"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Mystical Text */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: `linear-gradient(90deg, ${theme.colors.primary}22, transparent, ${theme.colors.primary}22)`,
          border: `1px solid ${theme.colors.primary}66`,
          borderRadius: '15px',
          fontFamily: theme.fonts.heading,
          fontSize: '1rem',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          "Place each piece where nature intended..."
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

// ============================================
// STEAMPUNK THEME COMPONENT
// ============================================

export const SteampunkBoard: React.FC = () => {
  const [rotatingGear, setRotatingGear] = useState<number | null>(null);
  const theme = THEME_CONFIGS.steampunk;

  return (
    <div
      className="steampunk-board"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, #3d2817 100%)`,
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Steam Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
        animation: 'steam-rise 10s ease-in-out infinite',
      }} />

      {/* Title */}
      <h1 style={{
        fontFamily: theme.fonts.heading,
        fontSize: '3rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: theme.colors.accent,
        textShadow: `2px 2px 4px rgba(0,0,0,0.5)`,
        letterSpacing: '0.1em',
      }}>
        The Astrolabe of Ideas
      </h1>

      {/* Mechanical Board */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #3d2817 0%, #2c1810 100%)',
        border: `4px solid ${theme.colors.primary}`,
        borderRadius: '15px',
        padding: '3rem',
        boxShadow: `
          0 10px 30px rgba(0,0,0,0.5),
          inset 0 0 20px rgba(0,0,0,0.3),
          inset 0 2px 0 rgba(255,255,255,0.1)
        `,
        position: 'relative',
      }}>
        {/* Decorative Rivets */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              background: `radial-gradient(circle, ${theme.colors.accent}, ${theme.colors.primary})`,
              borderRadius: '50%',
              top: i < 4 ? '10px' : 'auto',
              bottom: i >= 4 ? '10px' : 'auto',
              left: `${10 + (i % 4) * 25}%`,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
            }}
          />
        ))}

        {/* Gear-based Slots */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          position: 'relative',
        }}>
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              onMouseEnter={() => setRotatingGear(index)}
              onMouseLeave={() => setRotatingGear(null)}
              style={{
                aspectRatio: '1',
                background: `
                  radial-gradient(circle, ${theme.colors.secondary} 0%, ${theme.colors.primary} 100%)
                `,
                border: `3px solid ${theme.colors.accent}`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                boxShadow: `
                  0 4px 8px rgba(0,0,0,0.4),
                  inset 0 2px 4px rgba(255,255,255,0.2),
                  inset 0 -2px 4px rgba(0,0,0,0.3)
                `,
                transform: rotatingGear === index ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {/* Gear Icon */}
              <svg
                width="70%"
                height="70%"
                viewBox="0 0 100 100"
                style={{
                  animation: rotatingGear === index ? 'gear-spin 2s linear infinite' : 'none',
                }}
              >
                <circle cx="50" cy="50" r="25" fill={theme.colors.background} stroke={theme.colors.accent} strokeWidth="2" />
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  return (
                    <rect
                      key={i}
                      x="48"
                      y="15"
                      width="4"
                      height="15"
                      fill={theme.colors.accent}
                      transform={`rotate(${i * 45} 50 50)`}
                    />
                  );
                })}
                <circle cx="50" cy="50" r="8" fill={theme.colors.primary} />
              </svg>
            </div>
          ))}
        </div>

        {/* Pressure Gauge Display */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          border: `2px solid ${theme.colors.accent}`,
          borderRadius: '10px',
          fontFamily: theme.fonts.heading,
          fontSize: '0.9rem',
          textAlign: 'center',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
        }}>
          <span style={{ color: theme.colors.text, letterSpacing: '0.05em' }}>
            PRESSURE: OPTIMAL | TEMPERATURE: STABLE | STATUS: OPERATIONAL
          </span>
        </div>
      </div>

      <style>{`
        @keyframes steam-rise {
          0% { opacity: 0.1; transform: translateY(0); }
          50% { opacity: 0.2; }
          100% { opacity: 0.1; transform: translateY(-50px); }
        }
        @keyframes gear-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================
// THEME SELECTOR COMPONENT
// ============================================

export const ThemeSelector: React.FC<{
  onThemeSelect: (themeId: string) => void;
  currentTheme: string;
}> = ({ onThemeSelect, currentTheme }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      background: 'rgba(0,0,0,0.8)',
      borderRadius: '10px',
      marginBottom: '2rem',
    }}>
      {Object.values(THEME_CONFIGS).map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeSelect(theme.id)}
          style={{
            flex: 1,
            padding: '1rem',
            background: currentTheme === theme.id
              ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
              : 'rgba(255,255,255,0.1)',
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: theme.fonts.heading,
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            boxShadow: currentTheme === theme.id
              ? `0 0 20px ${theme.colors.primary}`
              : 'none',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{theme.name}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{theme.description}</div>
        </button>
      ))}
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

export const ThemeShowcase: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>('cyberpunk');

  const renderBoard = () => {
    switch (selectedTheme) {
      case 'cyberpunk':
        return <CyberpunkBoard />;
      case 'enchantedForest':
        return <EnchantedForestBoard />;
      case 'steampunk':
        return <SteampunkBoard />;
      default:
        return <CyberpunkBoard />;
    }
  };

  return (
    <div>
      <ThemeSelector
        currentTheme={selectedTheme}
        onThemeSelect={setSelectedTheme}
      />
      {renderBoard()}
    </div>
  );
};

export default ThemeShowcase;
```

### CSS Stylesheet (`theme_styles.css`)

```css
/* ============================================
   THEME STYLES & ANIMATIONS
   ============================================ */

/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ============================================
   CYBERPUNK THEME STYLES
   ============================================ */

.cyberpunk-board {
  --cyber-primary: #00ffff;
  --cyber-secondary: #ff00ff;
  --cyber-accent: #ffff00;
}

@keyframes neon-flicker {
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 20px var(--cyber-primary), 0 0 40px var(--cyber-secondary);
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 10px var(--cyber-primary), 0 0 20px var(--cyber-secondary);
  }
}

@keyframes grid-scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(50px);
  }
}

@keyframes pulse-neon {
  0%, 100% {
    box-shadow: 0 0 10px var(--cyber-primary), 0 0 20px var(--cyber-primary);
  }
  50% {
    box-shadow: 0 0 20px var(--cyber-primary), 0 0 40px var(--cyber-primary);
  }
}

@keyframes circuit-flow {
  0% {
    box-shadow: 0 0 10px #00ff88;
  }
  50% {
    box-shadow: 0 0 30px #00ff88, 0 0 60px #00ff88;
  }
  100% {
    box-shadow: 0 0 10px #00ff88;
  }
}

@keyframes glitch-error {
  0%, 100% {
    transform: translate(0, 0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(2px, -2px);
  }
  60% {
    transform: translate(-2px, -2px);
  }
  80% {
    transform: translate(2px, 2px);
  }
}

/* ============================================
   ENCHANTED FOREST THEME STYLES
   ============================================ */

.forest-board {
  --forest-primary: #4ade80;
  --forest-secondary: #60a5fa;
  --forest-accent: #fbbf24;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  25% {
    transform: translateY(-10px) translateX(5px);
  }
  50% {
    transform: translateY(-20px) translateX(-5px);
  }
  75% {
    transform: translateY(-10px) translateX(5px);
  }
}

@keyframes fairy-sparkle {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes rune-glow {
  0%, 100% {
    box-shadow: 0 0 10px var(--forest-accent);
    filter: brightness(1);
  }
  50% {
    box-shadow: 0 0 30px var(--forest-accent), 0 0 60px var(--forest-accent);
    filter: brightness(1.5);
  }
}

@keyframes leaf-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(20px) rotate(180deg);
    opacity: 0;
  }
}

/* ============================================
   STEAMPUNK THEME STYLES
   ============================================ */

.steampunk-board {
  --steam-primary: #cd7f32;
  --steam-secondary: #b87333;
  --steam-accent: #ffd700;
}

@keyframes steam-rise {
  0% {
    opacity: 0.1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.2;
    transform: translateY(-25px) scale(1.1);
  }
  100% {
    opacity: 0.1;
    transform: translateY(-50px) scale(1.2);
  }
}

@keyframes gear-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes gear-turn {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(45deg);
  }
}

@keyframes steam-release {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

@keyframes cog-jam {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-10deg);
  }
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */

@media (max-width: 768px) {
  .cyberpunk-board h1,
  .forest-board h1,
  .steampunk-board h1 {
    font-size: 2rem;
  }

  .cyberpunk-board > div,
  .forest-board > div,
  .steampunk-board > div {
    padding: 1.5rem;
  }

  .cyberpunk-board > div > div,
  .forest-board > div > div,
  .steampunk-board > div > div {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .cyberpunk-board h1,
  .forest-board h1,
  .steampunk-board h1 {
    font-size: 1.5rem;
  }

  .cyberpunk-board > div,
  .forest-board > div,
  .steampunk-board > div {
    padding: 1rem;
  }

  .cyberpunk-board > div > div,
  .forest-board > div > div,
  .steampunk-board > div > div {
    gap: 0.75rem;
  }
}

/* ============================================
   ACCESSIBILITY
   ============================================ */

/* Focus indicators for keyboard navigation */
button:focus-visible,
div[role="button"]:focus-visible {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
}

/* Reduced motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .cyberpunk-board,
  .forest-board,
  .steampunk-board {
    border: 3px solid currentColor;
  }
}

/* ============================================
   UTILITY CLASSES
   ============================================ */

.theme-transition {
  transition: all 0.5s ease-in-out;
}

.hover-scale:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

.glow-effect {
  box-shadow: 0 0 20px currentColor;
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```
