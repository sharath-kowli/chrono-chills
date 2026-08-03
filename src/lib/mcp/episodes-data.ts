// Metadata-only episode catalog for the MCP server bundle.
// Kept in src/lib/mcp/ so the Vite plugin can bundle it for the Deno edge
// function without pulling in the frontend's image imports.

export interface EpisodeMeta {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  duration: string;
  isLocked?: boolean;
  isNew?: boolean;
}

export const seriesMeta = {
  id: "still-here-season-1",
  title: "STILL HERE",
  tagline: "Hell is full. We're still here.",
  episodes: [
    { id: "ep-0", number: 0, title: "Lone and Dreary World", subtitle: "Getting through another day.", duration: "1:16" },
    { id: "ep-1", number: 1, title: "World in Your Eyes", subtitle: "A school day takes a surreal turn.", duration: "0:31" },
    { id: "ep-2", number: 2, title: "Being Different", subtitle: "The corridors become a trap.", duration: "0:35" },
    { id: "ep-3", number: 3, title: "Friend and Confidant", subtitle: "Not all familiar faces are what they seem.", duration: "0:28" },
    { id: "ep-4", number: 4, title: "At Death's Door", subtitle: "A desperate plan backfires.", duration: "0:36" },
    { id: "ep-5", number: 5, title: "Whited Sepulcher", subtitle: "Staying behind reveals the true horror.", duration: "0:36" },
    { id: "ep-6", number: 6, title: "A Measure of Darkness", subtitle: "The gravity of the situation sinks in.", duration: "0:25" },
    { id: "ep-7", number: 7, title: "Darkest Night Will End", subtitle: "The dawn breaks after a long night.", duration: "0:40" },
    { id: "ep-8", number: 8, title: "Calm Before Storm", subtitle: "Learning the rules of the new world.", duration: "0:30" },
    { id: "ep-9", number: 9, title: "The Right Questions", subtitle: "Morning light brings possible answers.", duration: "0:40" },
    { id: "ep-10", number: 10, title: "Absent Without Leave", subtitle: "A voice from the past gives a chilling invitation.", duration: "0:34" },
    { id: "ep-11", number: 11, title: "Flicker of Hope", subtitle: "A phone call provides fleeting hope.", duration: "0:50" },
    { id: "ep-12", number: 12, title: "To Love is to Protect", subtitle: "Goals are laid out, pretenses are cast aside.", duration: "0:43" },
    { id: "ep-13", number: 13, title: "Gaining Ground", subtitle: "Brief elation turns into a silent nightmare.", duration: "0:38" },
    { id: "ep-14", number: 14, title: "Best Laid Plans", subtitle: "The law is no match for madness.", duration: "0:27" },
    { id: "ep-15", number: 15, title: "The Sky is Falling", subtitle: "Chaos descends to herald the doom.", duration: "0:25" },
    { id: "ep-16", number: 16, title: "The Opening Act", subtitle: "A front-row seat to the beginning of the end.", duration: "0:28" },
    { id: "ep-17", number: 17, title: "A Shared Burden", subtitle: "A quiet drive through the neighborhood.", duration: "0:55" },
    { id: "ep-18", number: 18, title: "Into the Shadows", subtitle: "The dark trail marks the spot.", duration: "0:40" },
    { id: "ep-19", number: 19, title: "A Glimmer in the Dark", subtitle: "The long-awaited reunion is interrupted.", duration: "0:30", isLocked: true },
    { id: "ep-20", number: 20, title: "Here You Are", subtitle: "There are strange stories to be told.", duration: "0:22", isLocked: true },
    { id: "ep-21", number: 21, title: "Things Left Behind", subtitle: "Another story on the start of the nightmare.", duration: "1:49", isLocked: true },
    { id: "ep-22", number: 22, title: "What Doesn't Kill You", subtitle: "Recounting of a dazed journey.", duration: "1:19", isLocked: true },
    { id: "ep-23", number: 23, title: "Family Ties", subtitle: "Plans for the next steps are laid out.", duration: "1:51", isLocked: true },
    { id: "ep-24", number: 24, title: "Powerless", subtitle: "The house is no longer a sanctuary.", duration: "0:30", isLocked: true },
    { id: "ep-25", number: 25, title: "Simulation Over", subtitle: "The mask is dropped to reveal a darker truth.", duration: "0:40" },
    { id: "ep-26", number: 26, title: "An Act of Mercy", subtitle: "The cost of survival becomes unbearable.", duration: "0:49", isLocked: true },
    { id: "ep-27", number: 27, title: "Ashes to Ashes", subtitle: "What remains when everything burns away.", duration: "1:38", isLocked: true },
    { id: "ep-28", number: 28, title: "Episode 28", subtitle: "The nightmare continues.", duration: "0:44", isLocked: true },
    { id: "ep-29", number: 29, title: "Pathological", subtitle: "The survivors make their way toward the lab.", duration: "0:30", isLocked: true },
    { id: "ep-30", number: 30, title: "The Dark Passenger", subtitle: "The hospital reveals its horrid secret.", duration: "0:30", isLocked: true },
    { id: "ep-31", number: 31, title: "Fruit of the Harvest", subtitle: "Desperate dash for survival.", duration: "0:30", isLocked: true },
    { id: "ep-32", number: 32, title: "The Bunker", subtitle: "Out with the old, in with the new.", duration: "0:30", isLocked: true },
    { id: "ep-33", number: 33, title: "Clinical Hospitality", subtitle: "The survivors settle in for the testing.", duration: "0:30", isLocked: true },
    { id: "ep-34", number: 34, title: "A Piece of Home", subtitle: "The group finds a rare moment of rest.", duration: "0:30", isLocked: true },
    { id: "ep-35", number: 35, title: "Speculative Fiction", subtitle: "Searching for a name for the nightmare.", duration: "0:30", isLocked: true },
    { id: "ep-36", number: 36, title: "Inner Battle", subtitle: "The uncomfortable facts are brought to light.", duration: "0:30", isLocked: true },
    { id: "ep-37", number: 37, title: "Diagram of Survival", subtitle: "A harsh lesson in probability.", duration: "0:30", isLocked: true },
    { id: "ep-38", number: 38, title: "Not a Dream", subtitle: "The past refuses to stay buried.", duration: "0:30", isLocked: true },
    { id: "ep-39", number: 39, title: "Voice of the Legion", subtitle: "Terrifying visions blur with reality.", duration: "0:30", isLocked: true },
    { id: "ep-40", number: 40, title: "Paradise Lost", subtitle: "The group finds the world claimed by darkness.", duration: "0:30", isLocked: true },
    { id: "ep-41", number: 41, title: "No Man's Land", subtitle: "Hope for other survivors is dimming.", duration: "0:30", isLocked: true },
    { id: "ep-42", number: 42, title: "Life After Death", subtitle: "The survivors learn more about the enemy.", duration: "0:30", isLocked: true },
    { id: "ep-43", number: 43, title: "Blind Fear", subtitle: "Fear takes hold when sight fails.", duration: "0:30", isLocked: true },
    { id: "ep-44", number: 44, title: "Bloodhound", subtitle: "The pursuit results in a terrifying realization.", duration: "0:30", isLocked: true, isNew: true },
  ] as EpisodeMeta[],
};
