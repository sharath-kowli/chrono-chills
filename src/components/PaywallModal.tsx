import { Lock, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeTitle: string;
}

export function PaywallModal({ open, onOpenChange, episodeTitle }: PaywallModalProps) {
  const handleSubscribe = () => {
    // Dummy action - would integrate with Stripe
    console.log('Subscribe clicked - would trigger Stripe checkout');
    alert('This is a demo paywall. In production, this would open Stripe checkout.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl tracking-wide text-foreground">
            Unlock Full Access
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-center text-muted-foreground">
            <span className="font-semibold text-foreground">"{episodeTitle}"</span> and all future episodes are available with STATIC Premium.
          </p>
          
          {/* Pricing card */}
          <div className="rounded-lg border border-primary/50 bg-primary/10 p-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-foreground">$1.99</span>
              <span className="text-muted-foreground">/week</span>
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Cancel anytime
            </p>
          </div>
          
          {/* Benefits */}
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Unlimited access to all episodes
            </li>
            <li className="flex items-center gap-3 text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Early access to new releases
            </li>
            <li className="flex items-center gap-3 text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Ad-free viewing experience
            </li>
          </ul>
          
          {/* CTA */}
          <Button 
            onClick={handleSubscribe}
            className="w-full bg-primary py-6 text-lg font-semibold hover:bg-primary/90"
          >
            Start Watching Now
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            By subscribing, you agree to our Terms of Service
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
