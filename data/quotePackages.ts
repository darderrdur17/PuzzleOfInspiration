import type { Quote, ThemeId } from "@/types/game";
import { quotes as classicQuotes } from "./quotes";

export type QuotePackId =
  | "classic-core"
  | "startup-legends"
  | "science-frontiers"
  | "art-muses"
  | "mindful-focus"
  | "global-storytellers"
  | "quick-sprint-10"
  | "focused-20"
  | "deep-dive-30"
  | "icebreakers-team";

export interface QuotePackage {
  id: QuotePackId;
  name: string;
  description: string;
  recommendedThemes: ThemeId[];
  badge?: string;
  quotes: Quote[];
}

const startupQuotes: Quote[] = [
  {
    id: "pack-startup-1",
    text: "Wireframe the story before you wire the screens.",
    author: "Shan-Lyn Ma",
    phase: "preparation",
  },
  {
    id: "pack-startup-2",
    text: "Great fundraising decks are research papers in disguise.",
    author: "Aileen Gemma",
    phase: "preparation",
  },
  {
    id: "pack-startup-3",
    text: "Give your subconscious a sprint retro every Friday.",
    author: "Alexis Ohanian",
    phase: "incubation",
  },
  {
    id: "pack-startup-4",
    text: "Let the team sleep on the roadmap before committing.",
    author: "Anne Wojcicki",
    phase: "incubation",
  },
  {
    id: "pack-startup-5",
    text: "The aha moment usually arrives mid-user interview.",
    author: "Brianne Kimmel",
    phase: "illumination",
  },
  {
    id: "pack-startup-6",
    text: "Innovation is a series of tiny obvious things you finally notice.",
    author: "Nir Eyal",
    phase: "illumination",
  },
  {
    id: "pack-startup-7",
    text: "Ship the experiment, measure the truth.",
    author: "Des Traynor",
    phase: "verification",
  },
  {
    id: "pack-startup-8",
    text: "Every launch needs a postmortem before the next brainstorm.",
    author: "Gwynne Shotwell",
    phase: "verification",
  },
];

const scienceQuotesPlus: Quote[] = [
  {
    id: "pack-science-1",
    text: "Draft the lab notebook entry before pouring chemicals.",
    author: "Frances Arnold",
    phase: "preparation",
  },
  {
    id: "pack-science-2",
    text: "Collect one more data point than you think you need.",
    author: "Timnit Gebru",
    phase: "preparation",
  },
  {
    id: "pack-science-3",
    text: "Take a walk before you touch the pipette again.",
    author: "Jane Lubchenco",
    phase: "incubation",
  },
  {
    id: "pack-science-4",
    text: "Dream about the variables and wake up with the equation.",
    author: "Donna Strickland",
    phase: "incubation",
  },
  {
    id: "pack-science-5",
    text: "Sometimes the microscope flashes a headline.",
    author: "Dr. Kizzmekia Corbett",
    phase: "illumination",
  },
  {
    id: "pack-science-6",
    text: "Physics loves a napkin sketch at midnight.",
    author: "Nergis Mavalvala",
    phase: "illumination",
  },
  {
    id: "pack-science-7",
    text: "Peer review is the courage to let friends break your idea.",
    author: "May-Britt Moser",
    phase: "verification",
  },
  {
    id: "pack-science-8",
    text: "If the replication fails, the story begins, not ends.",
    author: "Hadiyah-Nicole Green",
    phase: "verification",
  },
];

const artQuotesPlus: Quote[] = [
  {
    id: "pack-art-1",
    text: "Mood boards are emotional research papers.",
    author: "Titus Kaphar",
    phase: "preparation",
  },
  {
    id: "pack-art-2",
    text: "Gather pigments like rumors: slowly and curiously.",
    author: "Julie Mehretu",
    phase: "preparation",
  },
  {
    id: "pack-art-3",
    text: "Leave the canvas leaning against the wall overnight.",
    author: "Toyin Ojih Odutola",
    phase: "incubation",
  },
  {
    id: "pack-art-4",
    text: "Let silence finish the composition.",
    author: "Hildur Guðnadóttir",
    phase: "incubation",
  },
  {
    id: "pack-art-5",
    text: "Brushstrokes explain themselves when the rhythm hits.",
    author: "Amoako Boafo",
    phase: "illumination",
  },
  {
    id: "pack-art-6",
    text: "Light remembers what you meant to paint.",
    author: "Liu Wei",
    phase: "illumination",
  },
  {
    id: "pack-art-7",
    text: "Critique is a remix lab for your ego.",
    author: "Olivia Jade Cooper",
    phase: "verification",
  },
  {
    id: "pack-art-8",
    text: "Frame it, live with it, then edit again.",
    author: "Shantell Martin",
    phase: "verification",
  },
];

const mindfulQuotes: Quote[] = [
  {
    id: "pack-mindful-1",
    text: "Breathe before you brainstorm.",
    author: "Jon Kabat-Zinn",
    phase: "preparation",
  },
  {
    id: "pack-mindful-2",
    text: "Questions land softer on a calm mind.",
    author: "Pema Chödrön",
    phase: "preparation",
  },
  {
    id: "pack-mindful-3",
    text: "Let the idea steep like tea; don't rush the pour.",
    author: "Thich Nhat Hanh",
    phase: "incubation",
  },
  {
    id: "pack-mindful-4",
    text: "Stillness is the white space of insight.",
    author: "Rick Rubin",
    phase: "incubation",
  },
  {
    id: "pack-mindful-5",
    text: "Clarity arrives between heartbeats.",
    author: "Yung Pueblo",
    phase: "illumination",
  },
  {
    id: "pack-mindful-6",
    text: "Notice the idea that makes your shoulders drop.",
    author: "Rupi Kaur",
    phase: "illumination",
  },
  {
    id: "pack-mindful-7",
    text: "Test the solution with compassion for the user.",
    author: "Priya Parker",
    phase: "verification",
  },
  {
    id: "pack-mindful-8",
    text: "Sustainable ideas feel peaceful when executed.",
    author: "Ethan Nichtern",
    phase: "verification",
  },
];

const quickSprintQuotes: Quote[] = [
  {
    id: "pack-quick-1",
    text: "Set a 10-minute timer; ship one tiny improvement.",
    author: "Jake Knapp",
    phase: "preparation",
  },
  {
    id: "pack-quick-2",
    text: "Sketch first, edit later—speed unlocks ideas.",
    author: "Julie Zhuo",
    phase: "preparation",
  },
  {
    id: "pack-quick-3",
    text: "Stand up, stretch, and let the link between ideas form.",
    author: "Austin Kleon",
    phase: "incubation",
  },
  {
    id: "pack-quick-4",
    text: "The first spark often hides in the rough draft.",
    author: "Anne Lamott",
    phase: "illumination",
  },
  {
    id: "pack-quick-5",
    text: "Ship the smallest test, learn the largest lesson.",
    author: "Eric Ries",
    phase: "verification",
  },
  {
    id: "pack-quick-6",
    text: "Short sessions win when focus is sharp.",
    author: "Cal Newport",
    phase: "verification",
  },
];

const focused20Quotes: Quote[] = [
  {
    id: "pack-20-1",
    text: "In 20 minutes, align on the story, not the slides.",
    author: "Nancy Duarte",
    phase: "preparation",
  },
  {
    id: "pack-20-2",
    text: "Gather signals, not noise, before you sprint.",
    author: "Julie Gurner",
    phase: "preparation",
  },
  {
    id: "pack-20-3",
    text: "Let ideas simmer for five minutes before voting.",
    author: "Tina Roth Eisenberg",
    phase: "incubation",
  },
  {
    id: "pack-20-4",
    text: "Whiteboard the aha in three strokes.",
    author: "Khoi Vinh",
    phase: "illumination",
  },
  {
    id: "pack-20-5",
    text: "Decide the next experiment before the meeting ends.",
    author: "Marty Cagan",
    phase: "verification",
  },
  {
    id: "pack-20-6",
    text: "Aim for one crisp insight per session.",
    author: "Adam Grant",
    phase: "verification",
  },
];

const deepDive30Quotes: Quote[] = [
  {
    id: "pack-30-1",
    text: "Read twice as much as you produce in every deep session.",
    author: "James Dyson",
    phase: "preparation",
  },
  {
    id: "pack-30-2",
    text: "Map the unknowns; let your mind wander them overnight.",
    author: "Ed Catmull",
    phase: "incubation",
  },
  {
    id: "pack-30-3",
    text: "Breakthroughs hide after you say the obvious out loud.",
    author: "Margaret Atwood",
    phase: "illumination",
  },
  {
    id: "pack-30-4",
    text: "Truth emerges when prototypes collide with reality.",
    author: "Sara Blakely",
    phase: "verification",
  },
  {
    id: "pack-30-5",
    text: "Depth comes from a single question asked five ways.",
    author: "Oliver Burkeman",
    phase: "preparation",
  },
  {
    id: "pack-30-6",
    text: "Protect the silence; it lets hard ideas surface.",
    author: "Mary Oliver",
    phase: "incubation",
  },
  {
    id: "pack-30-7",
    text: "When the picture clicks, write the rule that made it.",
    author: "Richard Feynman",
    phase: "illumination",
  },
  {
    id: "pack-30-8",
    text: "A 30-minute lab needs a 3-minute debrief.",
    author: "Atul Gawande",
    phase: "verification",
  },
];

const icebreakerQuotes: Quote[] = [
  {
    id: "pack-ice-1",
    text: "Share one creative failure you’d love to repeat.",
    author: "Workshop Prompt",
    phase: "preparation",
  },
  {
    id: "pack-ice-2",
    text: "What’s the weirdest idea you’ve ever defended?",
    author: "Workshop Prompt",
    phase: "preparation",
  },
  {
    id: "pack-ice-3",
    text: "Name a song that unlocks your best ideas.",
    author: "Workshop Prompt",
    phase: "incubation",
  },
  {
    id: "pack-ice-4",
    text: "Describe the last time you said “aha” out loud.",
    author: "Workshop Prompt",
    phase: "illumination",
  },
  {
    id: "pack-ice-5",
    text: "What quick test would you run if you had one day?",
    author: "Workshop Prompt",
    phase: "verification",
  },
  {
    id: "pack-ice-6",
    text: "Pick a quote from today and remix it in 10 words.",
    author: "Workshop Prompt",
    phase: "verification",
  },
];

const globalVoicesQuotes: Quote[] = [
  {
    id: "pack-global-1",
    text: "Collect proverbs; each is a strategy from an ancestor.",
    author: "Chimamanda Ngozi Adichie",
    phase: "preparation",
  },
  {
    id: "pack-global-2",
    text: "Mapping cultures is research for the soul.",
    author: "Ocean Vuong",
    phase: "preparation",
  },
  {
    id: "pack-global-3",
    text: "Let distance grow the idea across continents.",
    author: "Ai-jen Poo",
    phase: "incubation",
  },
  {
    id: "pack-global-4",
    text: "Silence in one language is thunder in another.",
    author: "Lemn Sissay",
    phase: "incubation",
  },
  {
    id: "pack-global-5",
    text: "The aha moment may arrive with a different accent.",
    author: "Min Jin Lee",
    phase: "illumination",
  },
  {
    id: "pack-global-6",
    text: "Insights cross borders faster than passports.",
    author: "Leila Janah",
    phase: "illumination",
  },
  {
    id: "pack-global-7",
    text: "Prototype with communities, not for them.",
    author: "Haben Girma",
    phase: "verification",
  },
  {
    id: "pack-global-8",
    text: "Share the credit in every timezone.",
    author: "Nilofer Merchant",
    phase: "verification",
  },
];

export const quotePackages: QuotePackage[] = [
  {
    id: "classic-core",
    name: "Classic Core",
    description: "Original classroom quotes spanning all four phases.",
    recommendedThemes: ["classic"],
    badge: "🐘",
    quotes: classicQuotes,
  },
  {
    id: "startup-legends",
    name: "Startup Legends",
    description: "Entrepreneurship and product wisdom from modern founders.",
    recommendedThemes: ["entrepreneurship"],
    badge: "🚀",
    quotes: startupQuotes,
  },
  {
    id: "science-frontiers",
    name: "Science Frontiers",
    description: "Lab-tested inspiration from scientists and engineers.",
    recommendedThemes: ["science"],
    badge: "🧪",
    quotes: scienceQuotesPlus,
  },
  {
    id: "art-muses",
    name: "Art Muses",
    description: "Studio-ready prompts from contemporary artists.",
    recommendedThemes: ["art"],
    badge: "🎨",
    quotes: artQuotesPlus,
  },
  {
    id: "mindful-focus",
    name: "Mindful Makers",
    description: "Mindfulness-inspired quotes that slow teams down to speed them up.",
    recommendedThemes: ["classic", "art", "science", "entrepreneurship"],
    badge: "🧘",
    quotes: mindfulQuotes,
  },
  {
    id: "global-storytellers",
    name: "Global Storytellers",
    description: "Voices from around the world for multicultural classrooms.",
    recommendedThemes: ["classic", "art", "entrepreneurship"],
    badge: "🌍",
    quotes: globalVoicesQuotes,
  },
  {
    id: "quick-sprint-10",
    name: "Quick Sprint (10 min)",
    description: "6 fast quotes for a 10-minute warmup or exit ticket.",
    recommendedThemes: ["classic", "entrepreneurship", "art", "science"],
    badge: "⏱️",
    quotes: quickSprintQuotes,
  },
  {
    id: "focused-20",
    name: "Focused 20",
    description: "6 quotes tuned for 20-minute lightning sessions.",
    recommendedThemes: ["classic", "entrepreneurship", "science"],
    badge: "⚡",
    quotes: focused20Quotes,
  },
  {
    id: "deep-dive-30",
    name: "Deep Dive 30",
    description: "8 quotes for 30-minute deep practice and discussion.",
    recommendedThemes: ["science", "art", "classic"],
    badge: "🕰️",
    quotes: deepDive30Quotes,
  },
  {
    id: "icebreakers-team",
    name: "Team Icebreakers",
    description: "6 prompts to energize groups before the jigsaw.",
    recommendedThemes: ["classic", "entrepreneurship", "art"],
    badge: "🤝",
    quotes: icebreakerQuotes,
  },
];

export const quotePackagesById = Object.fromEntries(
  quotePackages.map((pack) => [pack.id, pack] as const)
) as Record<QuotePackId, QuotePackage>;

export const getDefaultQuotePackIds = (theme: ThemeId): QuotePackId[] => {
  switch (theme) {
    case "science":
      return ["science-frontiers"];
    case "art":
      return ["art-muses"];
    case "entrepreneurship":
      return ["startup-legends"];
    default:
      return ["classic-core"];
  }
};


