import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { NavigationWarningProvider } from "@/lib/contexts/NavigationWarningContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IVEHITMYHEAD",
  description: "The best place to discover, share, and create dullest memes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavigationWarningProvider>
          <Header showSearch={true} />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NavigationWarningProvider>
      </body>
    </html>
  );
}
