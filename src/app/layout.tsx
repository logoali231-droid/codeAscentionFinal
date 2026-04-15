import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

import { UserProvider } from "@/firebase/provider";

export const metadata: Metadata = {
  title: "Code Ascent | Master Programming",
  description: "AI-driven programming education platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    }).catch(function(error) {
                      console.log('SW registration failed: ', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <UserProvider>
          <div className="android-container shadow-2xl">
            {children}
          </div>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}