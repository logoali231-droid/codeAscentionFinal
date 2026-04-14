import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from "@/components/servicewconfigregister";

export const metadata: Metadata = {
  title: "Code Ascent | Master Programming",
  description: "AI-driven programming education platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>...</head>

      <body>
        <div className="android-container shadow-2xl">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}