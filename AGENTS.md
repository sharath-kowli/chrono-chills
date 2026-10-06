
- Episodes can live in code (src/data/episodes.ts) or in the `episodes` table (written only by the `publish-episode` function via x-api-key); main.tsx merges the table into the catalog before render so automations need no redeploy.
