import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reafile — Universal File Converter | by Reawon",
  description:
    "Convert any file instantly — images, videos, audio, documents. Free, fast, and private. A Reawon studio product.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground overflow-x-hidden">
        <ThemeProvider>
          <PostHogProvider>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
