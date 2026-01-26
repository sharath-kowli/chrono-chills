import { Radio } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="h-6 w-6 text-primary flicker" />
            <div className="absolute inset-0 animate-ping">
              <Radio className="h-6 w-6 text-primary opacity-30" />
            </div>
          </div>
          <span 
            className="glitch font-display text-2xl tracking-widest text-foreground"
            data-text="STATIC"
          >
            STATIC
          </span>
        </div>
        
        {/* Right side - could add profile/settings later */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Season 1
          </span>
        </div>
      </div>
    </header>
  );
}
