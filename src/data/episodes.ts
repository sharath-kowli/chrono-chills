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
import episode5Thumb from '@/assets/episode-5.jpg';
import episode6Thumb from '@/assets/episode-6.jpg';
import episode7Thumb from '@/assets/episode-7.jpg';
import episode8Thumb from '@/assets/episode-8.jpg';
import episode9Thumb from '@/assets/episode-9.jpg';
import episode10Thumb from '@/assets/episode-10.jpg';

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
      youtubeId: 'Hk0QL6w7WdU',
      isNew: true,
    },
    {
      id: 'ep-2',
      number: 2,
      title: 'The Hallway',
      subtitle: 'The corner of your eye never lies.',
      duration: '0:32',
      thumbnail: episode2Thumb,
      youtubeId: 'OnG0wHQ3KsM',
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
    {
      id: 'ep-5',
      number: 5,
      title: 'Episode 5',
      subtitle: 'The nightmare continues.',
      duration: '0:40',
      thumbnail: episode5Thumb,
      youtubeId: 'WoZyTFyUHas',
    },
    {
      id: 'ep-6',
      number: 6,
      title: 'Episode 6',
      subtitle: 'There is no escape.',
      duration: '0:45',
      thumbnail: episode6Thumb,
      youtubeId: 'K-fELkj0EPY',
    },
    {
      id: 'ep-7',
      number: 7,
      title: 'Episode 7',
      subtitle: 'It remembers you.',
      duration: '0:42',
      thumbnail: episode7Thumb,
      youtubeId: '1HCv_TVLm4k',
    },
    {
      id: 'ep-8',
      number: 8,
      title: 'Episode 8',
      subtitle: 'You were never alone.',
      duration: '0:38',
      thumbnail: episode8Thumb,
      youtubeId: 'Q3x1NUEIf-I',
    },
    {
      id: 'ep-9',
      number: 9,
      title: 'Episode 9',
      subtitle: 'The signal returns.',
      duration: '0:36',
      thumbnail: episode9Thumb,
      youtubeId: 'svMRhBFejI8',
    },
    {
      id: 'ep-10',
      number: 10,
      title: 'Episode 10',
      subtitle: 'It never ended.',
      duration: '0:34',
      thumbnail: episode10Thumb,
      youtubeId: 'tfzYnnhmDoQ',
    },
  ],
};
