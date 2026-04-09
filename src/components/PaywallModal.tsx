import { Lock, Zap, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { unlockPremium } from '@/lib/unlock';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/components/ui/use-toast';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeTitle: string;
  onUnlock?: () => void;
}

const VALID_CODES = ['MERIROSVO1'];

export function PaywallModal({ open, onOpenChange, episodeTitle, onUnlock }: PaywallModalProps) {
  const [showRedeemInput, setShowRedeemInput] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { checkSubscription } = useSubscription();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setIsCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to auth if not logged in
        window.location.href = '/auth';
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to start checkout',
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleRedeem = () => {
    const code = redeemCode.trim().toUpperCase();
    if (VALID_CODES.includes(code)) {
      unlockPremium();
      setRedeemError('');
      setRedeemCode('');
      setShowRedeemInput(false);
      onUnlock?.();
      onOpenChange(false);
      window.location.href = '/payment-success';
    } else {
      setRedeemError('Invalid code. Please try again.');
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setShowRedeemInput(false);
      setRedeemCode('');
      setRedeemError('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          
          <div className="rounded-lg border border-primary/50 bg-primary/10 p-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-foreground">$1.99</span>
              <span className="text-muted-foreground">/week</span>
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Cancel anytime
            </p>
          </div>
          
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
          
          <Button 
            onClick={handleSubscribe}
            disabled={isCheckoutLoading}
            className="w-full bg-primary py-6 text-lg font-semibold hover:bg-primary/90"
          >
            {isCheckoutLoading ? 'Loading...' : 'Start Watching Now'}
          </Button>
          
          <div className="border-t border-border pt-4">
            {!showRedeemInput ? (
              <button
                onClick={() => setShowRedeemInput(true)}
                className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Ticket className="h-4 w-4" />
                Have a code? Redeem here
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={redeemCode}
                    onChange={(e) => {
                      setRedeemCode(e.target.value);
                      setRedeemError('');
                    }}
                    className="flex-1 bg-background"
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                  />
                  <Button onClick={handleRedeem} variant="secondary">
                    Redeem
                  </Button>
                </div>
                {redeemError && (
                  <p className="text-sm text-destructive">{redeemError}</p>
                )}
              </div>
            )}
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            By subscribing, you agree to our Terms of Service
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
