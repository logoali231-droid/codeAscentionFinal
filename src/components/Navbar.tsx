
// src/components/Navbar.tsx
'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Sparkles, BookOpen, LogIn } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/profile', icon: <User />, label: 'Profile' },
    { href: '/generate', icon: <Sparkles />, label: 'Generate' },
    { href: '/', icon: <BookOpen />, label: 'Learn' },
    { href: '/login', icon: <LogIn />, label: 'Login' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 px-6 py-3 flex justify-between items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-blue-500 scale-110' : 'text-zinc-500 hover:text-white'
              }`}
          >
            <div className={isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold tracking-wide uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}