import { Header } from "@/components/Header";
import { Link } from "react-router-dom";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container max-w-2xl px-4 pt-24 pb-20">
      <h1 className="font-display text-4xl tracking-wide text-foreground mb-8">Terms of Service</h1>
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-foreground mb-2">Company Information</h2>
          <p>This service is operated by StarRiver B.V., a company registered in the Netherlands.</p>
          <p className="mt-2">Contact: <a href="mailto:support@chronochills.com" className="underline hover:text-foreground transition-colors">support@chronochills.com</a></p>
        </section>
        <section>
          <h2 className="font-display text-xl text-foreground mb-2">Service</h2>
          <p>StarRiver provides a digital content platform delivering serialized video content and related services.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-foreground mb-2">Payments</h2>
          <p>Subscriptions are billed through Stripe. By subscribing, you authorize recurring payments according to the pricing displayed on the website.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-foreground mb-2">Cancellation</h2>
          <p>Subscriptions may be cancelled at any time through the user account dashboard. Access continues until the end of the billing period.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-foreground mb-2">Limitation of Liability</h2>
          <p>The service is provided "as is". StarRiver B.V. is not liable for interruptions or technical issues beyond reasonable control.</p>
        </section>
        <section>
          <h2 className="font-display text-xl text-foreground mb-2">Contact</h2>
          <p>For any questions please contact <a href="mailto:support@chronochills.com" className="underline hover:text-foreground transition-colors">support@chronochills.com</a></p>
        </section>
      </div>
      <div className="mt-12 pt-6 border-t border-border/50 text-xs text-muted-foreground">
        <Link to="/" className="underline hover:text-foreground transition-colors">← Back to home</Link>
      </div>
    </main>
  </div>
);

export default Terms;
