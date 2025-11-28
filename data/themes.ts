import { ThemeDefinition, ThemeId } from "@/types/game";
import { quotes as classicQuotes } from "./quotes";

const scienceQuotes = [
  // Preparation
  {
    id: "science-prep-1",
    text: "Great experiments start with great questions.",
    author: "Ada Lovelace",
    phase: "preparation",
  },
  {
    id: "science-prep-2",
    text: "Collect your data before you chase your hunch.",
    author: "Katherine Johnson",
    phase: "preparation",
  },
  {
    id: "science-prep-3",
    text: "Hypotheses are ladders. Build them carefully.",
    author: "Barbara McClintock",
    phase: "preparation",
  },
  // Incubation
  {
    id: "science-inc-1",
    text: "Let ideas simmer like a beaker on low heat.",
    author: "Chien-Shiung Wu",
    phase: "incubation",
  },
  {
    id: "science-inc-2",
    text: "Sometimes the lab notebook needs a walk outside.",
    author: "Carl Sagan",
    phase: "incubation",
  },
  {
    id: "science-inc-3",
    text: "Pause long enough for intuition to catch up with logic.",
    author: "Jane Goodall",
    phase: "incubation",
  },
  // Illumination
  {
    id: "science-ill-1",
    text: "Insight often strikes at 2 a.m. next to the microscope.",
    author: "Rosalind Franklin",
    phase: "illumination",
  },
  {
    id: "science-ill-2",
    text: "Discovery is seeing what everyone sees and thinking what no one thinks.",
    author: "Albert Szent-Györgyi",
    phase: "illumination",
  },
  {
    id: "science-ill-3",
    text: "When the data sing, listen closely.",
    author: "Mae Jemison",
    phase: "illumination",
  },
  // Verification
  {
    id: "science-ver-1",
    text: "Replicate, refine, repeat.",
    author: "Marie Curie",
    phase: "verification",
  },
  {
    id: "science-ver-2",
    text: "Peer review is a creativity checkpoint.",
    author: "Neil deGrasse Tyson",
    phase: "verification",
  },
  {
    id: "science-ver-3",
    text: "Proof is the bridge between idea and impact.",
    author: "Sally Ride",
    phase: "verification",
  },
] as const;

const artQuotes = [
  {
    id: "art-prep-1",
    text: "Fill your sketchbook before you touch the canvas.",
    author: "Georgia O'Keeffe",
    phase: "preparation",
  },
  {
    id: "art-prep-2",
    text: "Research the masters to remix the future.",
    author: "Jacob Lawrence",
    phase: "preparation",
  },
  {
    id: "art-prep-3",
    text: "Collect textures, stories, and palettes everywhere you go.",
    author: "Frida Kahlo",
    phase: "preparation",
  },
  {
    id: "art-inc-1",
    text: "Let unfinished work breathe overnight.",
    author: "Keith Haring",
    phase: "incubation",
  },
  {
    id: "art-inc-2",
    text: "Great ideas arrive when the music is loud and the brush is still.",
    author: "Yayoi Kusama",
    phase: "incubation",
  },
  {
    id: "art-inc-3",
    text: "Trust the messy middle; the piece is speaking back.",
    author: "Jean-Michel Basquiat",
    phase: "incubation",
  },
  {
    id: "art-ill-1",
    text: "Color is a promise kept in a flash.",
    author: "Claude Monet",
    phase: "illumination",
  },
  {
    id: "art-ill-2",
    text: "The aha moment is a brushstroke you almost skipped.",
    author: "Faith Ringgold",
    phase: "illumination",
  },
  {
    id: "art-ill-3",
    text: "When the concept clicks, every line shimmers.",
    author: "Banksy",
    phase: "illumination",
  },
  {
    id: "art-ver-1",
    text: "Refine the edges until the story is clear.",
    author: "Alma Thomas",
    phase: "verification",
  },
  {
    id: "art-ver-2",
    text: "Critique is collaboration disguised as courage.",
    author: "Ai Weiwei",
    phase: "verification",
  },
  {
    id: "art-ver-3",
    text: "Ship the piece, then learn from the gallery wall.",
    author: "Kara Walker",
    phase: "verification",
  },
] as const;

const entrepreneurshipQuotes = [
  {
    id: "biz-prep-1",
    text: "Interview 10 customers before you write one line of code.",
    author: "Melanie Perkins",
    phase: "preparation",
  },
  {
    id: "biz-prep-2",
    text: "Prep your pitch deck like it's a prototype.",
    author: "Daymond John",
    phase: "preparation",
  },
  {
    id: "biz-prep-3",
    text: "Know the problem better than the users feel it.",
    author: "Whitney Wolfe Herd",
    phase: "preparation",
  },
  {
    id: "biz-inc-1",
    text: "Let the business model simmer on a whiteboard overnight.",
    author: "Reid Hoffman",
    phase: "incubation",
  },
  {
    id: "biz-inc-2",
    text: "Step away from the spreadsheet to hear the strategy.",
    author: "Jessica O. Matthews",
    phase: "incubation",
  },
  {
    id: "biz-inc-3",
    text: "Slow thinking keeps the runway long.",
    author: "Robert Smith",
    phase: "incubation",
  },
  {
    id: "biz-ill-1",
    text: "Product-market fit often arrives mid-conversation.",
    author: "Brian Chesky",
    phase: "illumination",
  },
  {
    id: "biz-ill-2",
    text: "Innovation is noticing the obvious before it trends.",
    author: "Sara Blakely",
    phase: "illumination",
  },
  {
    id: "biz-ill-3",
    text: "When the deck rearranges itself, follow it.",
    author: "Marc Randolph",
    phase: "illumination",
  },
  {
    id: "biz-ver-1",
    text: "Launch, learn, loop.",
    author: "Eric Ries",
    phase: "verification",
  },
  {
    id: "biz-ver-2",
    text: "Metrics are creativity translated for investors.",
    author: "Arlan Hamilton",
    phase: "verification",
  },
  {
    id: "biz-ver-3",
    text: "Iterate until value sticks to the user.",
    author: "Ben Horowitz",
    phase: "verification",
  },
] as const;

const sharedPhaseHints = {
  preparation: "Look for quotes that talk about research, planning, or gathering knowledge.",
  incubation: "Anything about resting, stepping away, or subconscious thinking fits here.",
  illumination: "Watch for sudden insight, eureka moments, or surprising clarity.",
  verification: "Implementation, testing, and executing belong to verification.",
} as const;

const themeBackgrounds: Record<Exclude<ThemeId, "classic">, string> = {
  science: "linear-gradient(135deg, #e0f2fe 0%, #d1fae5 100%)",
  art: "linear-gradient(135deg, #fce7f3 0%, #fde68a 100%)",
  entrepreneurship: "linear-gradient(135deg, #ede9fe 0%, #fee2e2 100%)",
};

const boardBackgrounds: Record<Exclude<ThemeId, "classic">, string> = {
  science: "linear-gradient(160deg, rgba(14,165,233,0.2), rgba(16,185,129,0.15))",
  art: "linear-gradient(160deg, rgba(244,114,182,0.25), rgba(251,191,36,0.2))",
  entrepreneurship: "linear-gradient(160deg, rgba(99,102,241,0.18), rgba(248,113,113,0.18))",
};

const scienceRapidFire = [
  {
    id: "science-quiz-1",
    theme: "science",
    question: "Which phase are you in when you're forming a hypothesis?",
    options: ["Preparation", "Incubation", "Illumination", "Verification"],
    answerIndex: 0,
    phase: "preparation",
  },
  {
    id: "science-quiz-2",
    theme: "science",
    question: "Repeating an experiment to confirm results belongs to which phase?",
    options: ["Preparation", "Illumination", "Verification", "Incubation"],
    answerIndex: 2,
    phase: "verification",
  },
  {
    id: "science-quiz-3",
    theme: "science",
    question: "When does the 'eureka' moment typically arrive?",
    options: ["Preparation", "Incubation", "Illumination", "Verification"],
    answerIndex: 2,
    phase: "illumination",
  },
] as const;

const artRapidFire = [
  {
    id: "art-quiz-1",
    theme: "art",
    question: "Sketching thumbnails before painting lives in which phase?",
    options: ["Illumination", "Verification", "Preparation", "Incubation"],
    answerIndex: 2,
    phase: "preparation",
  },
  {
    id: "art-quiz-2",
    theme: "art",
    question: "Sharing work-in-progress for critique belongs to which phase?",
    options: ["Verification", "Incubation", "Illumination", "Preparation"],
    answerIndex: 0,
    phase: "verification",
  },
  {
    id: "art-quiz-3",
    theme: "art",
    question: "The instant you see the finished piece in your mind is which phase?",
    options: ["Preparation", "Incubation", "Illumination", "Verification"],
    answerIndex: 2,
    phase: "illumination",
  },
] as const;

const bizRapidFire = [
  {
    id: "biz-quiz-1",
    theme: "entrepreneurship",
    question: "Customer interviews map to which phase?",
    options: ["Incubation", "Preparation", "Verification", "Illumination"],
    answerIndex: 1,
    phase: "preparation",
  },
  {
    id: "biz-quiz-2",
    theme: "entrepreneurship",
    question: "Soft-launching an MVP to gather metrics fits which phase?",
    options: ["Verification", "Illumination", "Preparation", "Incubation"],
    answerIndex: 0,
    phase: "verification",
  },
  {
    id: "biz-quiz-3",
    theme: "entrepreneurship",
    question: "Letting a business model 'marinate' over the weekend is which phase?",
    options: ["Verification", "Incubation", "Preparation", "Illumination"],
    answerIndex: 1,
    phase: "incubation",
  },
] as const;

const defaultRapidFire = [
  {
    id: "classic-quiz-1",
    theme: "classic",
    question: "Which phase is about gathering information?",
    options: ["Verification", "Preparation", "Illumination", "Incubation"],
    answerIndex: 1,
    phase: "preparation",
  },
  {
    id: "classic-quiz-2",
    theme: "classic",
    question: "The 'aha!' moment belongs to which phase?",
    options: ["Illumination", "Verification", "Incubation", "Preparation"],
    answerIndex: 0,
    phase: "illumination",
  },
  {
    id: "classic-quiz-3",
    theme: "classic",
    question: "Testing an idea with real people is which phase?",
    options: ["Illumination", "Preparation", "Verification", "Incubation"],
    answerIndex: 2,
    phase: "verification",
  },
] as const;

export const themeLibrary: Record<ThemeId, ThemeDefinition> = {
  classic: {
    id: "classic",
    name: "Classic Creativity",
    description: "Original classroom set with the watercolor elephant board.",
    background: "linear-gradient(135deg, #fdf2f2 0%, #ede9fe 100%)",
    boardBackground: "url(/6.png)",
    badgeColor: "#f97316",
    phaseHints: { ...sharedPhaseHints },
    quotes: classicQuotes,
    rapidFireQuestions: [...defaultRapidFire],
  },
  science: {
    id: "science",
    name: "Science Lab",
    description: "STEM-focused quotes with cool blue-green gradients.",
    background: themeBackgrounds.science,
    boardBackground: boardBackgrounds.science,
    badgeColor: "#0ea5e9",
    phaseHints: {
      ...sharedPhaseHints,
      preparation: "Think about hypotheses, data collection, and lab prep.",
      verification: "Validation, replication, or peer review screams verification.",
    },
    quotes: scienceQuotes as ThemeDefinition["quotes"],
    rapidFireQuestions: [...scienceRapidFire],
  },
  art: {
    id: "art",
    name: "Art Studio",
    description: "Color-forward set perfect for design or art history lessons.",
    background: themeBackgrounds.art,
    boardBackground: boardBackgrounds.art,
    badgeColor: "#ec4899",
    phaseHints: {
      ...sharedPhaseHints,
      illumination: "Look for quotes describing flashes of inspiration or vivid imagery.",
    },
    quotes: artQuotes as ThemeDefinition["quotes"],
    rapidFireQuestions: [...artRapidFire],
  },
  entrepreneurship: {
    id: "entrepreneurship",
    name: "Startup Sprint",
    description: "Business and innovation quotes with bold gradients.",
    background: themeBackgrounds.entrepreneurship,
    boardBackground: boardBackgrounds.entrepreneurship,
    badgeColor: "#6366f1",
    phaseHints: {
      ...sharedPhaseHints,
      preparation: "Market research, interviews, and pitch prep go here.",
    },
    quotes: entrepreneurshipQuotes as ThemeDefinition["quotes"],
    rapidFireQuestions: [...bizRapidFire],
  },
};

export const themeList = Object.values(themeLibrary);

export const getRandomRapidFireQuestion = (theme: ThemeId) => {
  const list = themeLibrary[theme]?.rapidFireQuestions ?? defaultRapidFire;
  return list[Math.floor(Math.random() * list.length)];
};

