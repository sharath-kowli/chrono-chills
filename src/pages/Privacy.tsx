import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Privacy Policy — Chrono Chills"
      description="How StarRiver B.V. handles your data on Chrono Chills: account info, payments via Stripe, and viewing progress."
      path="/privacy"
    />
    <Header />
    <main className="container max-w-2xl px-4 pt-24 pb-20">
      <h1 className="font-display text-4xl tracking-wide text-foreground mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>StarRiver B.V. collects minimal user data required to operate the service.</p>
        <section>
          <p className="mb-2">Information collected may include:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Email address</li>
            <li>Account login information</li>
            <li>Payment data processed securely by Stripe</li>
          </ul>
        </section>
        <p>Payment details are handled by Stripe and are not stored by StarRiver B.V.</p>
        <p>User viewing progress may be stored to improve the user experience.</p>
        <p>We do not sell personal data.</p>
        <p>For privacy questions contact: <a href="mailto:support@chronochills.com" className="underline hover:text-foreground transition-colors">support@chronochills.com</a></p>
      </div>
      <div className="mt-12 pt-6 border-t border-border/50 text-xs text-muted-foreground">
        <Link to="/" className="underline hover:text-foreground transition-colors">← Back to home</Link>
      </div>
    </main>
  </div>
);

export default Privacy;
