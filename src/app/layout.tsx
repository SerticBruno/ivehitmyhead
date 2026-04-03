import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { NavigationWarningProvider, MemesStateProvider, CategoriesStateProvider } from "@/lib/contexts";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();
const siteDescription =
  "Discover, share, and create the dullest memes on the internet. Lower your expectations accordingly.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "IVEHITMYHEAD",
    template: "%s",
  },
  description: siteDescription,
  openGraph: {
    title: "IVEHITMYHEAD",
    description: siteDescription,
    url: siteUrl,
    siteName: "IVEHITMYHEAD",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "IVEHITMYHEAD",
    description: siteDescription,
  },
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
        <AuthProvider>
          <NavigationWarningProvider>
            <MemesStateProvider>
              <CategoriesStateProvider>
                <Header showSearch={false} />
                <main>
                  {children}
                </main>
                <Footer />
              </CategoriesStateProvider>
            </MemesStateProvider>
          </NavigationWarningProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
