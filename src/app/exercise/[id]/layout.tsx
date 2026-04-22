import { COURSES } from "@/app/lib/courses-data";
import Navbar from "@/components/Navbar";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark"> {/* 🔥 Adicionei 'dark' aqui */}
      <body className="antialiased selection:bg-primary/30">
        <main className="android-container overflow-y-auto">
          {children}
        </main>
        <Navbar />
      </body>
    </html>
  );
}