import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

const Refund = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Refund Policy — Chrono Chills"
      description="How refunds are handled on Chrono Chills subscriptions. Contact support within 7 days for technical issues."
      path="/refund"
    />
    <Header />
    <main className="container max-w-2xl px-4 pt-24 pb-20">
      <h1 className="font-display text-4xl tracking-wide text-foreground mb-8">Refund Policy</h1>
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>Subscriptions grant immediate access to digital content.</p>
        <p>Because access is provided instantly, refunds are generally not offered after a billing cycle begins.</p>
        <p>If a technical issue prevents access to the service, users may contact support within 7 days for assistance or potential refund review.</p>
        <p>To request support please contact: <a href="mailto:support@chronochills.com" className="underline hover:text-foreground transition-colors">support@chronochills.com</a></p>
      </div>
      <div className="mt-12 pt-6 border-t border-border/50 text-xs text-muted-foreground">
        <Link to="/" className="underline hover:text-foreground transition-colors">← Back to home</Link>
      </div>
    </main>
  </div>
);

export default Refund;
