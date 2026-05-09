import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Sentinel AI · AI Cyber Threat Analyzer",
  description:
    "AI-native cybersecurity intelligence platform. Detect, analyze, and respond to threats with real-time AI co-pilots, log analysis, malware detection, and SOC automation.",
  metadataBase: new URL("https://sentinel.ai"),
  openGraph: {
    title: "Sentinel AI",
    description: "AI-native cyber defense for modern security operations.",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#03060e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-ink-950 text-slate-100 font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(7,11,24,0.92)",
              border: "1px solid rgba(34,211,238,0.25)",
              color: "#e2e8f0",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
