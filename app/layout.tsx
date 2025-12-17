import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/themeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Puzzle of Inspiration - Creativity Learning Game",
  description: "An educational jigsaw puzzle game exploring the four phases of creativity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {/* Skip link for keyboard navigation */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <main id="main-content">
            {children}
          </main>
          <footer className="sr-only">
            <p>&copy; 2025 Puzzle of Inspiration. An educational game about the creative process.</p>
          </footer>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

