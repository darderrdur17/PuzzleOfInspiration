import type { Quote, ThemeId } from "@/types/game";

export interface CustomQuote extends Quote {
  themeId: ThemeId;
}

const STORAGE_KEY = "creativity-custom-quotes";

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const emitUpdate = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("customQuotesUpdated"));
};

export const CustomQuotes = {
  load(): CustomQuote[] {
    if (typeof window === "undefined") return [];
    return safeParse<CustomQuote[]>(localStorage.getItem(STORAGE_KEY), []);
  },

  save(quotes: CustomQuote[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    emitUpdate();
  },

  add(quote: CustomQuote) {
    const quotes = this.load();
    quotes.push(quote);
    this.save(quotes);
  },

  remove(id: string) {
    const quotes = this.load().filter((quote) => quote.id !== id);
    this.save(quotes);
  },

  byTheme(themeId: ThemeId): CustomQuote[] {
    return this.load().filter((quote) => quote.themeId === themeId);
  },

  subscribe(callback: (quotes: CustomQuote[]) => void) {
    if (typeof window === "undefined") return () => {};
    const handler = () => callback(this.load());
    window.addEventListener("customQuotesUpdated", handler);
    window.addEventListener("storage", handler);
    handler();
    return () => {
      window.removeEventListener("customQuotesUpdated", handler);
      window.removeEventListener("storage", handler);
    };
  },
};

