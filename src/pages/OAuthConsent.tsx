import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

type OAuthClient = { name?: string; client_name?: string; redirect_uri?: string };
type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

// The `auth.oauth` namespace is beta and may be missing from the SDK types.
type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

const scopeLabel = (scope: string) => {
  switch (scope) {
    case "openid":
      return "Confirm your identity";
    case "email":
      return "Share your email address";
    case "profile":
      return "Share your basic profile";
    default:
      return `Additional permission requested: ${scope}`;
  }
};

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id in the request URL.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      if (!active) return;
      setEmail(sess.session.user.email ?? null);

      const { data, error: detailsError } = await oauthApi().getAuthorizationDetails(
        authorizationId,
      );
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const api = oauthApi();
    const { data, error: decideError } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect was returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "this app";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO
        title="Authorize access — Chrono Chills"
        description="Approve or deny an application requesting access to your Chrono Chills account."
        path="/.lovable/oauth/consent"
      />
      <div className="w-full max-w-md">
        <div className="bg-card/50 backdrop-blur-sm border p-8 rounded-xl shadow-lg space-y-6">
          {error ? (
            <>
              <h1 className="font-display text-2xl tracking-widest text-foreground">
                AUTHORIZATION FAILED
              </h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground">
                The request may have expired. Start the connection again from the app you were
                using.
              </p>
            </>
          ) : !details ? (
            <p className="animate-pulse text-primary text-center">Loading…</p>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="font-display text-2xl tracking-widest text-foreground">
                  CONNECT {clientName.toUpperCase()}
                </h1>
                <p className="text-sm text-muted-foreground">
                  This lets {clientName} use Chrono Chills as you.
                </p>
              </div>

              <div className="text-sm space-y-1 text-muted-foreground">
                {email && (
                  <p>
                    Signed in as <span className="text-foreground">{email}</span>
                  </p>
                )}
                {details.client?.redirect_uri && (
                  <p className="break-all">
                    Redirects to{" "}
                    <span className="text-foreground">{details.client.redirect_uri}</span>
                  </p>
                )}
              </div>

              {scopes.length > 0 && (
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  {scopes.map((s) => (
                    <li key={s}>{scopeLabel(s)}</li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-muted-foreground">
                This does not bypass Chrono Chills' permissions or backend policies.
              </p>

              <div className="flex flex-col gap-3">
                <Button size="lg" disabled={busy} onClick={() => decide(true)}>
                  {busy ? "Working…" : "Approve"}
                </Button>
                <Button variant="outline" size="lg" disabled={busy} onClick={() => decide(false)}>
                  Cancel connection
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthConsent;
