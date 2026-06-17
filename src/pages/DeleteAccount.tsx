import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { clearCredentialsUnlocked } from "@/lib/unlock";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth?redirect=/delete-account", { replace: true });
        return;
      }
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) {
        navigate("/auth?redirect=/delete-account", { replace: true });
        return;
      }
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) {
        toast({ title: "Sign in required", description: "Please sign in to delete your account.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      clearCredentialsUnlocked();
      await supabase.auth.signOut();
      toast({ title: "Account deleted", description: "Your account and all data have been permanently removed." });
      window.location.href = "/";
    } catch (e: any) {
      toast({ title: "Could not delete account", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Delete Account | Chrono Chills"
        description="Permanently delete your Chrono Chills account and all associated data."
        path="/delete-account"
      />
      <Header />
      <main className="container mx-auto max-w-2xl px-4 pt-28 pb-16">
        <div className="rounded-lg border border-destructive/30 bg-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl tracking-wide text-foreground">Delete your account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p>Deleting your account will permanently remove:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your profile, email, and sign-in credentials</li>
              <li>Watch history and progress</li>
              <li>Bookmarks and saved episodes</li>
              <li>Entitlements, unlock codes, and any active access</li>
              <li>Roles and admin permissions (if any)</li>
            </ul>
            <p className="pt-2 text-xs">
              Note: Active subscriptions are not automatically cancelled. Manage billing from the{" "}
              <Link to="/pricing" className="underline hover:text-foreground">pricing page</Link> first if needed.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={loading || !session}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete my account
            </Button>
          </div>
        </div>
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your account and all associated data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
