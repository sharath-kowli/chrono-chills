import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

const About = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="About Chrono Chills — Short, Serialized Fiction"
      description="Chrono Chills makes short, atmospheric video episodes you can watch in minutes. Learn how the serialized horror sci-fi platform works."
      path="/about"
    />
    <Header />
    <main className="container max-w-2xl px-4 pt-24 pb-20">
      <h1 className="font-display text-4xl tracking-wide text-foreground mb-8">About ChronoChills</h1>
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>ChronoChills is a place for short, serialized fiction you can watch in minutes.</p>
        <p>Most streaming platforms are built for long movies or hour-long shows. ChronoChills is different. Every story is broken into small episodes designed to fit into the small gaps of your day.</p>
        <p className="italic text-foreground/60">
          Waiting for a train.<br />
          Sitting with coffee.<br />
          Late-night scrolling.
        </p>
        <p>Instead of random content, you follow a story.</p>
        <p>Each series unfolds one episode at a time. Episodes are short, atmospheric, and designed to pull you forward. Think of it as a modern version of serialized storytelling—like the old magazine cliffhangers, but built for the internet.</p>

        <section>
          <h2 className="font-display text-xl text-foreground mb-2">What you'll find here</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Short narrative video episodes</li>
            <li>Stories that unfold over many parts</li>
            <li>Mystery, sci-fi, and strange fiction</li>
            <li>A format designed for quick viewing</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground mb-2">Why ChronoChills exists</h2>
          <p>Great stories don't always need two hours.</p>
          <p className="mt-2">Sometimes all you need is a few quiet minutes and the next chapter.</p>
          <p className="mt-2">ChronoChills was created to experiment with a new kind of storytelling: small episodes, continuous narrative, and a world that slowly reveals itself as you watch.</p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground mb-2">The format</h2>
          <p>Each story runs as a sequence of episodes.<br />Watch one or binge several.<br />The story continues either way.</p>
          <p className="mt-2">New chapters appear regularly as the series grows.</p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground mb-2">The goal</h2>
          <p>To build a library of strange, thoughtful, atmospheric fiction that rewards curiosity and patience.</p>
          <p className="mt-2 italic text-foreground/60">One episode at a time.</p>
        </section>
      </div>
      <div className="mt-12 pt-6 border-t border-border/50 text-xs text-muted-foreground">
        <Link to="/" className="underline hover:text-foreground transition-colors">← Back to home</Link>
      </div>
    </main>
  </div>
);

export default About;
