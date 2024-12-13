import { Inter } from "next/font/google";
// import { Analytics } from '@vercel/analytics/react'
import { Analytics } from '@vercel/analytics/next';
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bots4Ed - AI-Powered International Education Counseling",
  description:
    "Get personalized education guidance through AI-powered video interactions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
