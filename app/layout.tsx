import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Space_Grotesk } from "next/font/google";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BMW Lager EHF Faktura! :O",
  description: "Bjørns eneste og beste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className={`${displayFont.className} antialiased`}>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
