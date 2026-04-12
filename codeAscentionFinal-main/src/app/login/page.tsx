"use client";

import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase/provider";
import { signInWithEmail, signUpWithEmail } from "@/firebase/auth";
import { Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!username) throw new Error("Username is required for registration.");
        await signUpWithEmail(auth, firestore, email, password, username);
      } else {
        await signInWithEmail(auth, email, password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center glow-blue text-primary animate-pulse"><Rocket className="w-12 h-12" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card border border-border p-8 rounded-2xl glow-blue shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center glow-blue mb-4">
            <Rocket className="text-white w-8 h-8" />
          </div>
          <h1 className="font-headline font-bold text-2xl tracking-tight uppercase">
            Code Ascent
          </h1>
          <div className="flex items-center gap-1 mt-1 opacity-80">
            <Zap className="w-4 h-4 text-accent fill-accent" />
            <span className="text-xs text-accent font-bold uppercase tracking-widest">
              Master the Code
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-muted-foreground mb-1 ml-1 tracking-wider">Username</label>
              <input
                type="text"
                required
                className="bg-secondary/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="codemaster99"
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-muted-foreground mb-1 ml-1 tracking-wider">Email</label>
            <input
              type="email"
              required
              className="bg-secondary/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-muted-foreground mb-1 ml-1 tracking-wider">Password</label>
            <input
              type="password"
              required
              className="bg-secondary/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 font-bold uppercase tracking-widest h-12 bg-primary hover:bg-primary/90 text-white rounded-xl glow-blue transition-all"
          >
            {loading ? "Authenticating..." : isRegistering ? "Start Learning" : "Log In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {isRegistering ? "Already training? " : "New recruit? "}
          </span>
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-primary font-bold hover:underline tracking-tight"
          >
            {isRegistering ? "Log In here" : "Register now"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
