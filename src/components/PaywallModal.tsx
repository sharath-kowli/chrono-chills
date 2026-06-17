import { Lock, Zap, Ticket, Crown, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/components/ui/use-toast';
import { pushEvent } from '@/lib/gtm';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeTitle: string;
  onUnlock?: () => void;
}

type PlanType = 'weekly' | 'lifetime';

export function PaywallModal({ open, onOpenChange, episodeTitle, onUnlock }: PaywallModalProps) {
  const [showRedeemInput, setShowRedeemInput] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('lifetime');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [showCredentialsInput, setShowCredentialsInput] = useState(false);
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credError, setCredError] = useState('');
  const [credLoading, setCredLoading] = useState(false);
  const { checkSubscription } = useSubscription();
  const { toast } = useToast();

  const isCheckoutLoading = loadingPlan !== null;

  const handleSubscribe = async (plan: PlanType) => {
    if (isCheckoutLoading) return; // prevent double clicks
    setLoadingPlan(plan);
    setCheckoutError(null);

    pushEvent('checkout_started', { plan, episode: episodeTitle });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth';
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to start checkout';
      setCheckoutError(msg);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: msg,
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePlanSelect = (plan: PlanType) => {
    if (isCheckoutLoading) return;
    setSelectedPlan(plan);
    setCheckoutError(null);
    pushEvent('plan_selected', { plan, episode: episodeTitle });
  };

  const handleRedeem = async () => {
    if (redeemLoading) return;
    const code = redeemCode.trim();
    if (!code) {
      setRedeemError('Please enter a code.');
      return;
    }
    setRedeemLoading(true);
    setRedeemError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth';
        return;
      }
      const { data, error } = await supabase.functions.invoke('redeem-code', {
        body: { code },
      });
      if (error || !data?.success) {
        setRedeemError(data?.error || 'Invalid code. Please try again.');
        return;
      }
      await checkSubscription();
      setRedeemCode('');
      setShowRedeemInput(false);
      onUnlock?.();
      onOpenChange(false);
      window.location.href = '/payment-success';
    } catch {
      setRedeemError('Unable to redeem code. Please try again.');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleCredentialsUnlock = async () => {
    if (credLoading) return;
    const username = credUsername.trim();
    const password = credPassword;
    if (!username || !password) {
      setCredError('Please enter both username and password.');
      return;
    }
    setCredLoading(true);
    setCredError('');
    try {
      // No sign-in required — credentials themselves are the proof of access.
      const { data, error } = await supabase.functions.invoke('unlock-with-credentials', {
        body: { username, password },
      });
      if (error || !data?.success) {
        setCredError(data?.error || 'Invalid credentials. Please try again.');
        return;
      }
      const { setCredentialsUnlocked } = await import('@/lib/unlock');
      setCredentialsUnlocked();
      await checkSubscription();
      setCredUsername('');
      setCredPassword('');
      setShowCredentialsInput(false);
      onUnlock?.();
      onOpenChange(false);
      window.location.href = '/payment-success';
    } catch {
      setCredError('Unable to unlock. Please try again.');
    } finally {
      setCredLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (isCheckoutLoading) return; // prevent closing while loading
    if (!isOpen) {
      setShowRedeemInput(false);
      setRedeemCode('');
      setRedeemError('');
      setCheckoutError(null);
      setShowCredentialsInput(false);
      setCredUsername('');
      setCredPassword('');
      setCredError('');
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
        
        <div className="space-y-5 py-4">
          <p className="text-center text-muted-foreground">
            <span className="font-semibold text-foreground">"{episodeTitle}"</span> and all future episodes are available with ChronoChills Premium.
          </p>

          {/* Plan selection */}
          <div className="space-y-3">
            {/* Lifetime option */}
            <button
              onClick={() => handlePlanSelect('lifetime')}
              disabled={isCheckoutLoading}
              className={`w-full rounded-lg border p-4 text-left transition-all ${
                selectedPlan === 'lifetime'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-background hover:border-muted-foreground/30'
              } ${isCheckoutLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Lifetime Access</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">$19.99</span>
                  <span className="text-sm text-muted-foreground"> once</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Pay once, watch forever. Best value.</p>
            </button>

            {/* Weekly option */}
            <button
              onClick={() => handlePlanSelect('weekly')}
              disabled={isCheckoutLoading}
              className={`w-full rounded-lg border p-4 text-left transition-all ${
                selectedPlan === 'weekly'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-background hover:border-muted-foreground/30'
              } ${isCheckoutLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">Weekly</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">$1.99</span>
                  <span className="text-sm text-muted-foreground">/week</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Cancel anytime</p>
            </button>
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

          {checkoutError && (
            <p className="text-center text-sm text-destructive">{checkoutError}</p>
          )}
          
          <Button 
            onClick={() => handleSubscribe(selectedPlan)}
            disabled={isCheckoutLoading}
            className="w-full bg-primary py-6 text-lg font-semibold hover:bg-primary/90"
          >
            {loadingPlan === 'lifetime'
              ? 'Opening checkout…'
              : loadingPlan === 'weekly'
                ? 'Opening checkout…'
                : selectedPlan === 'lifetime'
                  ? 'Get Lifetime Access – $19.99'
                  : 'Start Watching – $1.99/week'}
          </Button>
          
          <div className="border-t border-border pt-4">
            {!showRedeemInput ? (
              <button
                onClick={() => setShowRedeemInput(true)}
                disabled={isCheckoutLoading}
                className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Ticket className="h-4 w-4" />
                Have a code? Redeem here
              </button>
            ) : (
              <div className="space-y-3">
                <label htmlFor="redeem-code-input" className="sr-only">
                  Redeem code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="redeem-code-input"
                    aria-label="Redeem code"
                    placeholder="Enter code"
                    value={redeemCode}
                    onChange={(e) => {
                      setRedeemCode(e.target.value);
                      setRedeemError('');
                    }}
                    className="flex-1 bg-background"
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                    disabled={isCheckoutLoading}
                  />
                  <Button onClick={handleRedeem} variant="secondary" disabled={isCheckoutLoading || redeemLoading}>
                    {redeemLoading ? 'Redeeming…' : 'Redeem'}
                  </Button>
                </div>
                {redeemError && (
                  <p className="text-sm text-destructive">{redeemError}</p>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            {!showCredentialsInput ? (
              <button
                onClick={() => setShowCredentialsInput(true)}
                disabled={isCheckoutLoading}
                className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4" />
                Have login credentials? Sign in here
              </button>
            ) : (
              <div className="space-y-3">
                <label htmlFor="unlock-username-input" className="sr-only">
                  Username
                </label>
                <Input
                  id="unlock-username-input"
                  aria-label="Username"
                  placeholder="Username"
                  autoComplete="username"
                  value={credUsername}
                  onChange={(e) => {
                    setCredUsername(e.target.value);
                    setCredError('');
                  }}
                  className="bg-background"
                  disabled={isCheckoutLoading || credLoading}
                />
                <label htmlFor="unlock-password-input" className="sr-only">
                  Password
                </label>
                <div className="flex gap-2">
                  <Input
                    id="unlock-password-input"
                    aria-label="Password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={credPassword}
                    onChange={(e) => {
                      setCredPassword(e.target.value);
                      setCredError('');
                    }}
                    className="flex-1 bg-background"
                    onKeyDown={(e) => e.key === 'Enter' && handleCredentialsUnlock()}
                    disabled={isCheckoutLoading || credLoading}
                  />
                  <Button
                    onClick={handleCredentialsUnlock}
                    variant="secondary"
                    disabled={isCheckoutLoading || credLoading}
                  >
                    {credLoading ? 'Unlocking…' : 'Unlock'}
                  </Button>
                </div>
                {credError && (
                  <p className="text-sm text-destructive">{credError}</p>
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
