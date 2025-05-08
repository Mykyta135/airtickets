// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { AuthProvider } from "@/provider/AuthProvider";
import { Navbar } from "@/src/app/components/navbar";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import { routing } from "@/src/i18n/routing";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkyJet - Book Your Next Flight",
  description: "Find and book flights easily with SkyJet",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
  <html lang={locale} className="scheme-dark dark" style={{ colorScheme: 'dark' }}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
          <NextIntlClientProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              {/* <Footer /> */}
            </div>
            </NextIntlClientProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}