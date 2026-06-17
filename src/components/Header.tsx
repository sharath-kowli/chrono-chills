import { Radio, LogOut, User, Trash2, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { isCredentialsUnlocked, clearCredentialsUnlocked } from "@/lib/unlock";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

export function Header() {
  const [session, setSession] = useState<any>(null);
  const [credUnlocked, setCredUnlocked] = useState<boolean>(isCredentialsUnlocked());
  const [deleteOpen, setDeleteOpen] = useState(false);
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

    const sync = () => setCredUnlocked(isCredentialsUnlocked());
    window.addEventListener("cc-credentials-unlock", sync);
    window.addEventListener("storage", sync);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cc-credentials-unlock", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleSignOut = async () => {
    clearCredentialsUnlocked();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", description: "Please sign in to delete your account.", variant: "destructive" });
        return;
      }
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      clearCredentialsUnlocked();
      await supabase.auth.signOut();
      toast({ title: "Account deleted", description: "Your account and data have been permanently removed." });
      window.location.href = "/";
    } catch (e: any) {
      toast({ title: "Could not delete account", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  const isAuthed = !!session || credUnlocked;
  const user = session?.user;
  const meta = user?.user_metadata ?? {};
  const avatarUrl: string | undefined = meta.avatar_url || meta.picture;
  const displayName: string = meta.full_name || meta.name || user?.email || "Account";
  const initial = (displayName?.trim()?.[0] || "U").toUpperCase();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <Radio className="h-6 w-6 text-primary flicker" />
            <div className="absolute inset-0 animate-ping">
              <Radio className="h-6 w-6 text-primary opacity-30" />
            </div>
          </div>
          <span className="glitch font-display text-2xl tracking-widest text-foreground" data-text="CHRONOCHILLS">
            CHRONOCHILLS
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block">
            Pricing
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block"></div>

          {isAuthed ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="group flex items-center gap-1 rounded-full pr-1.5 ring-1 ring-border hover:ring-primary/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <Avatar className="h-9 w-9">
                      {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                      <AvatarFallback className="bg-muted text-foreground">
                        {user ? initial : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user && (
                    <>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{displayName}</div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                  {!!session && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteOpen(true);
                      }}
                      className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete account
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes your account and all associated data — profile, watch history, bookmarks, entitlements, and roles. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
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
