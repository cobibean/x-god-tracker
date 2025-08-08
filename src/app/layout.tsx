import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "@/lib/config-context";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/lib/theme-provider";
import { DailySyncClient } from "@/lib/DailySyncClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "X God Tracker - Daily Execution Dashboard",
  description: "Your personal dashboard for tracking daily execution and building distribution relationships",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen`}>
        <ThemeProvider>
        <ConfigProvider>
          {/* Run daily reset on client after hydration */}
          <Script id="daily-reset" strategy="afterInteractive">
            {`
              try {
                (function(){
                  const getCurrentDateString = () => new Date().toISOString().split('T')[0];
                  const today = getCurrentDateString();
                  const last = localStorage.getItem('lastResetDate');
                  if (last !== today) {
                    // reset checklist and actions
                    localStorage.setItem('dailyChecklistState', JSON.stringify({}));
                    localStorage.setItem('actionLoggerState', JSON.stringify({
                      valueDmsSent: 0,
                      newLeadsAdded: 0,
                      newEngagersLogged: 0,
                      sequencesProgressed: 0,
                      peopleAdvanced: 0,
                    }));
                    localStorage.setItem('lastResetDate', today);
                    window.dispatchEvent(new Event('storageUpdated'));
                  }
                })();
              } catch {}
            `}
          </Script>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ConfigProvider>
        <DailySyncClient />
        </ThemeProvider>
      </body>
    </html>
  );
}
