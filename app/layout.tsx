import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tori Forge — Grand Arena Companion",
  description: "Lineup builder, Moki training manager & marketplace for Moku Grand Arena",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#08070b", fontFamily: "'Courier New', monospace" }}>
        {children}
      </body>
    </html>
  );
}
