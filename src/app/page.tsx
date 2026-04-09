import Link from "next/link";
import { Rocket, BrainCircuit, Shield, Layout } from "lucide-react";
import { COURSES } from "@/app/lib/courses-data";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      <header className="py-10 text-center space-y-4">
        <div className="inline-block p-3 bg-primary/20 rounded-2xl glow-blue mb-4">
          <Rocket className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Code Ascention</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">Master the machine. Your limitless AI tutor awaits.</p>
      </header>

      <main className="space-y-8">
        {COURSES.map((course) => (
          <section key={course.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{course.title}</h2>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {course.skills.map((skill) => (
                <Link key={skill.id} href={`/exercise/${skill.id}`}>
                  <div className="group bg-secondary/40 border border-border p-4 rounded-2xl hover:border-primary/50 transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-lg">{skill.title}</h3>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${skill.status === 'locked' ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                          {skill.status}
                       </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{skill.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-border flex justify-around">
        <Button variant="ghost" size="icon" className="text-primary"><Layout className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" className="opacity-40"><BrainCircuit className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon" className="opacity-40"><Shield className="w-5 h-5" /></Button>
      </footer>
    </div>
  );
}
