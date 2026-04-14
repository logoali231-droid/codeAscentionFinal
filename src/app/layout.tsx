import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from "@/components/servicewconfigregister";
import { UserProvider } from "@/firebase/provider";

export const metadata: Metadata = {
  title: "Code Ascent | Master Programming",
  description: "AI-driven programming education platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
    <link rel="manifest" href="/manifest.json" />
      <body>
        <UserProvider>
          <ServiceWorkerRegister />
          <div className="android-container shadow-2xl">
            {children}
          </div>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}