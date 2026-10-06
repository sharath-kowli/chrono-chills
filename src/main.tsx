import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { loadPublishedEpisodes } from "./lib/loadEpisodes";

loadPublishedEpisodes().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  );
});
