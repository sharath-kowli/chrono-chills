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
import episode4Thumb from '@/assets/episode-4-behind-the-door.jpg';

export const series: Series = {
  id: 'still-here-season-1',
  title: 'STILL HERE',
  tagline: 'Some things never leave.',
  episodes: [
    {
      id: 'ep-1',
      number: 1,
      title: "It's in the Eyes",
      subtitle: 'It started with footsteps.',
      duration: '0:38',
      thumbnail: episode1Thumb,
      youtubeId: 'zRs5wtVEwII',
      isNew: true,
    },
    {
      id: 'ep-2',
      number: 2,
      title: 'The Hallway',
      subtitle: 'The corner of your eye never lies.',
      duration: '0:32',
      thumbnail: episode2Thumb,
      youtubeId: '0DXmaV2qB2k',
    },
    {
      id: 'ep-3',
      number: 3,
      title: 'The Hand',
      subtitle: 'They\'re listening through the wires.',
      duration: '0:41',
      thumbnail: episode3Thumb,
      youtubeId: 'UEL9Y3wCH50',
    },
    {
      id: 'ep-4',
      number: 4,
      title: 'Behind the Door',
      subtitle: 'Some doors should stay closed.',
      duration: '0:35',
      thumbnail: episode4Thumb,
      youtubeId: 'rkrPt5vUSvk',
    },
  ],
};
