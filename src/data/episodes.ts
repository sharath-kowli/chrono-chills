export interface Episode {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  duration: string;
  thumbnail: string;
  streamId: string;
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
import episode11Thumb from '@/assets/episode-11.jpg';
import episode12Thumb from '@/assets/episode-12.jpg';
import episode13Thumb from '@/assets/episode-13.jpg';
import episode14Thumb from '@/assets/episode-14.jpg';
import episode15Thumb from '@/assets/episode-15.jpg';
import episode16Thumb from '@/assets/episode-16.jpg';
import episode17Thumb from '@/assets/episode-17.jpg';
import episode18Thumb from '@/assets/episode-18.jpg';

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
      streamId: 'c69cf60b260460f73325843ba825cbf1',
      isNew: true,
    },
    {
      id: 'ep-2',
      number: 2,
      title: 'The Hallway',
      subtitle: 'The corner of your eye never lies.',
      duration: '0:32',
      thumbnail: episode2Thumb,
      streamId: 'c145d7980bd0f0a588593d3d1d410db4',
    },
    {
      id: 'ep-3',
      number: 3,
      title: 'The Hand',
      subtitle: "They're listening through the wires.",
      duration: '0:41',
      thumbnail: episode3Thumb,
      streamId: '64ad652bdf77d941144ae6003d6f1fb4',
    },
    {
      id: 'ep-4',
      number: 4,
      title: 'Behind the Door',
      subtitle: 'Some doors should stay closed.',
      duration: '0:35',
      thumbnail: episode4Thumb,
      streamId: '90710073f69afa69c79167d633d4bd3d',
    },
    {
      id: 'ep-5',
      number: 5,
      title: 'Episode 5',
      subtitle: 'The nightmare continues.',
      duration: '0:40',
      thumbnail: episode5Thumb,
      streamId: 'a1f76b8264ac7f16ddb924202f9c9bd6',
    },
    {
      id: 'ep-6',
      number: 6,
      title: 'Episode 6',
      subtitle: 'There is no escape.',
      duration: '0:45',
      thumbnail: episode6Thumb,
      streamId: '80a5e07b1458530c122519c4f0d44109',
    },
    {
      id: 'ep-7',
      number: 7,
      title: 'Episode 7',
      subtitle: 'It remembers you.',
      duration: '0:42',
      thumbnail: episode7Thumb,
      streamId: '0ba286f71e64c79b86082291df709d31',
    },
    {
      id: 'ep-8',
      number: 8,
      title: 'Episode 8',
      subtitle: 'You were never alone.',
      duration: '0:38',
      thumbnail: episode8Thumb,
      streamId: '571080544617f967ff6bc2256449470f',
    },
    {
      id: 'ep-9',
      number: 9,
      title: 'Episode 9',
      subtitle: 'The signal returns.',
      duration: '0:36',
      thumbnail: episode9Thumb,
      streamId: 'aa26625d9c08b811c37b134700770de6',
    },
    {
      id: 'ep-10',
      number: 10,
      title: 'Episode 10',
      subtitle: 'It never ended.',
      duration: '0:34',
      thumbnail: episode10Thumb,
      streamId: '068d014aafd0d6f2a3f3395e70cc70ae',
    },
    {
      id: 'ep-11',
      number: 11,
      title: 'Episode 11',
      subtitle: 'The walls have eyes.',
      duration: '0:40',
      thumbnail: episode10Thumb,
      streamId: 'b55d4334bb431ab2706d3dd96d45e027',
    },
    {
      id: 'ep-12',
      number: 12,
      title: 'Episode 12',
      subtitle: 'Nowhere to hide.',
      duration: '0:38',
      thumbnail: episode10Thumb,
      streamId: 'd2b5377041c7ec31ea15ebf9651cdc1f',
    },
    {
      id: 'ep-13',
      number: 13,
      title: 'Episode 13',
      subtitle: 'It follows.',
      duration: '0:42',
      thumbnail: episode10Thumb,
      streamId: '6ab03e4790118f990aa837c53bceaa26',
    },
    {
      id: 'ep-14',
      number: 14,
      title: 'Episode 14',
      subtitle: 'The last warning.',
      duration: '0:36',
      thumbnail: episode10Thumb,
      streamId: '8f90595c10387f4cf9923c53595f5fbe',
    },
    {
      id: 'ep-15',
      number: 15,
      title: 'Episode 15',
      subtitle: 'No turning back.',
      duration: '0:44',
      thumbnail: episode10Thumb,
      streamId: 'b0117591239d41c89320cbf04821dcbe',
    },
    {
      id: 'ep-16',
      number: 16,
      title: 'Episode 16',
      subtitle: 'The darkness speaks.',
      duration: '0:39',
      thumbnail: episode10Thumb,
      streamId: 'd8451b89ca5557f76c7937be02d8ae06',
    },
    {
      id: 'ep-17',
      number: 17,
      title: 'Episode 17',
      subtitle: 'Almost over.',
      duration: '0:41',
      thumbnail: episode10Thumb,
      streamId: '4fbcaf05eedd262227c725984602cf85',
    },
    {
      id: 'ep-18',
      number: 18,
      title: 'Episode 18',
      subtitle: 'The end is just the beginning.',
      duration: '0:45',
      thumbnail: episode10Thumb,
      streamId: '4d9c3ecdab2b4e1dc9301aa022ccf0ca',
    },
  ],
};
