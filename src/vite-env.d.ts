/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override the Cloudflare Stream delivery origin, e.g. https://customer-<code>.cloudflarestream.com */
  readonly VITE_CLOUDFLARE_STREAM_BASE?: string;
}
