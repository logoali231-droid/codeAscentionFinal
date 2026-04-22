import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark"> 
      <body className="antialiased">
        <main className="android-container">
          {children}
        </main>
        <Navbar />
      </body>
    </html>
  );
}