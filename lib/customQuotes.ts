import type { Quote, ThemeId } from "@/types/game";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export interface CustomQuote extends Quote {
  themeId: ThemeId;
}

const STORAGE_KEY = "creativity-custom-quotes";
const DEFAULT_SESSION_ID = "default";

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

const fetchRemoteQuotes = async (): Promise<CustomQuote[] | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("custom_quotes")
    .select("*")
    .eq("session_id", DEFAULT_SESSION_ID);
  if (error) {
    console.error("Supabase custom quotes fetch failed", error);
    return null;
  }
  const mapped =
    data?.map((row) => ({
      id: row.id,
      text: row.text,
      author: row.author,
      phase: row.phase,
      themeId: row.theme_id as ThemeId,
    })) ?? [];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
  }
  return mapped;
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
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        void supabase.from("custom_quotes").upsert({
          id: quote.id,
          session_id: DEFAULT_SESSION_ID,
          theme_id: quote.themeId,
          phase: quote.phase,
          text: quote.text,
          author: quote.author,
        });
      }
    }
  },

  remove(id: string) {
    const quotes = this.load().filter((quote) => quote.id !== id);
    this.save(quotes);
    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        void supabase.from("custom_quotes").delete().eq("id", id);
      }
    }
  },

  byTheme(themeId: ThemeId): CustomQuote[] {
    return this.load().filter((quote) => quote.themeId === themeId);
  },

  subscribe(callback: (quotes: CustomQuote[]) => void) {
    if (typeof window === "undefined") return () => {};

    if (isSupabaseConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        void fetchRemoteQuotes().then((quotes) => {
          if (quotes) callback(quotes);
          else callback(this.load());
        });
        const channel = supabase
          .channel("custom-quotes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "custom_quotes", filter: `session_id=eq.${DEFAULT_SESSION_ID}` },
            () => {
              void fetchRemoteQuotes().then((quotes) => {
                if (quotes) callback(quotes);
              });
            }
          )
          .subscribe();

        const localHandler = () => callback(this.load());
        window.addEventListener("storage", localHandler);
        window.addEventListener("customQuotesUpdated", localHandler);

        return () => {
          supabase.removeChannel(channel);
          window.removeEventListener("storage", localHandler);
          window.removeEventListener("customQuotesUpdated", localHandler);
        };
      }
    }

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




