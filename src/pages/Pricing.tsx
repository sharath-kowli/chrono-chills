import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing — Chrono Chills Premium & Free Episodes"
        description="Watch episodes 1–12 of STILL HERE free. Unlock everything for $1.99/week or $19.99 lifetime. Cancel anytime."
        path="/pricing"
      />
      <Header />
      <main className="container max-w-5xl px-4 pt-28 pb-20">
        <h1 className="font-display text-4xl tracking-wide text-foreground mb-4">Pricing</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Watch the first episodes free. Unlock everything when you're ready.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* Free Tier */}
          <div className="rounded-lg border border-border/50 bg-card p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-foreground">Free</h2>
            <p className="text-3xl font-bold text-foreground">$0</p>
            <p className="text-sm text-muted-foreground">No account required to browse</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Episodes 1–12 completely free</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Full quality streaming</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> No ads, no interruptions</li>
            </ul>
          </div>

          {/* Weekly Premium Tier */}
          <div className="rounded-lg border border-border/50 bg-card p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-foreground">Weekly</h2>
            <p className="text-3xl font-bold text-foreground">$1.99<span className="text-base font-normal text-muted-foreground">/week</span></p>
            <p className="text-sm text-muted-foreground">Cancel anytime</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> All episodes, including premium</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> New episodes as they release</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Watch history & bookmarks</li>
            </ul>
          </div>

          {/* Lifetime Tier */}
          <div className="rounded-lg border border-primary/50 bg-card p-6 space-y-4 ring-1 ring-primary/20">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide text-foreground">Lifetime</h2>
              <span className="rounded bg-primary px-1.5 py-0.5 font-display text-[10px] tracking-widest text-primary-foreground">BEST VALUE</span>
            </div>
            <p className="text-3xl font-bold text-foreground">$19.99<span className="text-base font-normal text-muted-foreground"> once</span></p>
            <p className="text-sm text-muted-foreground">Pay once, watch forever</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> All episodes, including premium</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Every future episode included</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Watch history & bookmarks</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Support independent storytelling</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-border/50 bg-muted/30 p-6 space-y-3">
          <h3 className="font-display text-lg tracking-wide text-foreground">How it works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Episodes 1 through 12 are free to watch — no strings attached.</li>
            <li>From episode 13 onward, you'll need a premium subscription or lifetime access.</li>
            <li>Subscribe weekly at $1.99, or pay $19.99 once for permanent access to everything.</li>
            <li>Cancel anytime. No lock-in, no hidden fees.</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">
            ← Back to episodes
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
