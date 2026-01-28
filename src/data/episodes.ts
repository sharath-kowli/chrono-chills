export interface Episode {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  duration: string;
  thumbnail: string;
  youtubeId: string; // Placeholder - replace with actual unlisted YouTube IDs
  isNew?: boolean;
  isLocked?: boolean;
}

export interface Series {
  id: string;
  title: string;
  tagline: string;
  episodes: Episode[];
}

// Import thumbnails
import episode1Thumb from '@/assets/episode-1-still-here.jpg';
import episode2Thumb from '@/assets/episode-2-it-moved.jpg';
import episode3Thumb from '@/assets/episode-3-static.jpg';

export const series: Series = {
  id: 'still-here-season-1',
  title: 'STILL HERE',
  tagline: 'Some things never leave.',
  episodes: [
    {
      id: 'ep-1',
      number: 1,
      title: 'The Hallway',
      subtitle: 'It started with footsteps.',
      duration: '0:38',
      thumbnail: episode1Thumb,
      youtubeId: 'zRs5wtVEwII',
      isNew: true,
    },
    {
      id: 'ep-2',
      number: 2,
      title: 'It Moved',
      subtitle: 'The corner of your eye never lies.',
      duration: '0:32',
      thumbnail: episode2Thumb,
      youtubeId: '0DXmaV2qB2k',
    },
    {
      id: 'ep-3',
      number: 3,
      title: 'Static in the Walls',
      subtitle: 'They\'re listening through the wires.',
      duration: '0:41',
      thumbnail: episode3Thumb,
      youtubeId: 'dQw4w9WgXcQ', // Replace with your actual unlisted YouTube video ID
    },
  ],
};
