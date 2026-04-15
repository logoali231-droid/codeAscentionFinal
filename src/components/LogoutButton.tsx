"use client";

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleLogout}
      className="flex gap-2 font-bold uppercase text-xs"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
}
