import { Radio, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export function Header() {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <Radio className="h-6 w-6 text-primary flicker" />
            <div className="absolute inset-0 animate-ping">
              <Radio className="h-6 w-6 text-primary opacity-30" />
            </div>
          </div>
          <span className="glitch font-display text-2xl tracking-widest text-foreground" data-text="STATIC">
            STATIC
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground hidden sm:inline-block">
            Season 1
          </span>
          <div className="h-4 w-px bg-border hidden sm:block"></div>

          {session ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline-block">Sign Out</span>
            </Button>
          ) : (
            <Button variant="default" size="sm" asChild className="gap-2 focus:ring-0">
              <Link to="/auth">
                <User className="w-4 h-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
