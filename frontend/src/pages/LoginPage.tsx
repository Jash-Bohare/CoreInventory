import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/Spinner";
import { Anchor, ShieldCheck, Database, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Pane - Dynamic Brand Presence */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-muted/20 border-r border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background opacity-80" />
        
        {/* Floating background elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-success/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Anchor className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">CoreInventory</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-lg"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Inventory you can <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">cryptographically prove.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            The first enterprise stock management platform that anchors your physical reality directly to the Ethereum blockchain.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="h-10 w-10 rounded-lg bg-background/50 border border-border flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Mathematical Certainty</h3>
                <p className="text-sm">Every movement secured by Keccak-256 Merkle Trees.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="h-10 w-10 rounded-lg bg-background/50 border border-border flex items-center justify-center flex-shrink-0">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Zero-Trust Auditing</h3>
                <p className="text-sm">List-level anomaly detection in real-time.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 text-sm text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} CoreInventory Systems. <br className="lg:hidden" />All mathematical rights reserved.
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-8 right-8 lg:hidden flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
             <Anchor className="h-4 w-4 text-primary-foreground" />
           </div>
           <span className="font-bold tracking-tight text-foreground">CoreInventory</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] shadow-card hover:shadow-card-hover transition-all duration-500 rounded-2xl p-8 sm:p-10 space-y-8 bg-background/60 backdrop-blur-2xl border border-border/50 relative z-20"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access the ledger.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your enterprise email"
                className="transition-all focus:ring-2 focus:ring-primary/20 h-12 bg-background/50 border-border/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Password</Label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="transition-all focus:ring-2 focus:ring-primary/20 h-12 bg-background/50 border-border/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20"
              >
                {error}
              </motion.p>
            )}
            
            <Button type="submit" className="w-full h-12 text-md font-semibold font-sans tracking-wide active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Spinner className="h-5 w-5" /> : "Authenticate"}
            </Button>
          </form>

          <div className="pt-2 text-center">
             <p className="text-sm text-muted-foreground">
              Don't have an operating license?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Request Access
              </Link>
            </p>
          </div>
        </motion.div>
        
        {/* Subtle demo hint */}
        <div className="absolute bottom-8 text-center text-xs text-muted-foreground/60 w-full px-6">
          Demo Credentials: demo@coreinv.local / password
        </div>
      </div>
    </div>
  );
}
