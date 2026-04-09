"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Rocket, 
  BrainCircuit, 
  Shield, 
  Layout, 
  LogOut, 
  ChevronRight,
  User as UserIcon 
} from "lucide-react";
import { COURSES } from "@/app/lib/courses-data";
import { Button } from "@/components/ui/button";
import { useUser, auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 bg-[radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_transparent_15%)]">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary/40 border border-border rounded-2xl flex items-center justify-center glow-blue">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">
              {user.displayName || "Pilot"}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
              Level 1 Trainee
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSignOut}
          className="rounded-2xl bg-secondary/20 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Mastery Tree Section */}
      <main className="space-y-12 max-w-lg mx-auto">
        <div className="text-center space-y-2 mb-8">
           <h2 className="text-2xl font-black uppercase tracking-tighter italic">Mastery Tree</h2>
           <p className="text-xs text-muted-foreground">Advance through the logic circuits.</p>
        </div>

        {COURSES.map((course, courseIndex) => (
          <div key={course.id} className="relative">
            {/* Course Title Line */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black uppercase bg-primary/20 text-primary px-3 py-1 rounded-full italic">
                {course.title}
              </span >
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            <div className="space-y-6 relative">
              {course.skills.map((skill, skillIndex) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: skillIndex * 0.1 }}
                >
                  <Link href={`/exercise/${skill.id}`}>
                    <div className={`peer group relative bg-secondary/20 border-2 rounded-3xl p-5 hover:scale-[1.02] active:scale-[0.98] transition-all
                      ${skill.status === 'locked' ? 'border-border opacity-50' : 'border-primary/30 hover:border-primary shadow-lg hover:shadow-primary/10'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg leading-tight uppercase italic">{skill.title}</h3>
                          <p className="text-xs text-muted-foreground">{skill.description}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors
                          ${skill.status === 'locked' ? 'bg-muted/30 text-muted-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black'}`}>
                          {skill.status === 'locked' ? <Shield className="w-5 h-5" /> : <ChevronRight className="w-6 h-6" />}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Vertical Connector Line - Only if not the last item */}
                  {skillIndex < course.skills.length - 1 && (
                    <div className="absolute left-[30px] bottom-[-24px] w-0.5 h-6 bg-border/50 -z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Navigation Footer */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-black/80 backdrop-blur-xl border border-border/50 rounded-3xl flex items-center justify-around px-4 glow-blue">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-primary scale-125">
             <Layout className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="text-muted-foreground/40">
             <BrainCircuit className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-muted-foreground/40">
             <Shield className="w-6 h-6" />
          </Button>
        </Link>
      </nav>
    </div>
  );
}
