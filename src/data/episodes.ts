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
import episode19Thumb from '@/assets/episode-19.jpg';
import episode20Thumb from '@/assets/episode-20.jpg';
import episode21Thumb from '@/assets/episode-21.jpg';
import episode22Thumb from '@/assets/episode-22.jpg';
import episode23Thumb from '@/assets/episode-23.jpg';
import episode24Thumb from '@/assets/episode-24.jpg';
import episode25Thumb from '@/assets/episode-25.jpg';

export const series: Series = {
  id: 'still-here-season-1',
  title: 'STILL HERE',
  tagline: 'Some things never leave.',
  episodes: [
    {
      id: 'ep-1',
      number: 1,
      title: 'World in Your Eyes',
      subtitle: 'A school day takes a surreal turn.',
      duration: '0:38',
      thumbnail: episode1Thumb,
      streamId: 'c69cf60b260460f73325843ba825cbf1',
    },
    {
      id: 'ep-2',
      number: 2,
      title: 'Being Different',
      subtitle: 'The corridors become a trap.',
      duration: '0:32',
      thumbnail: episode2Thumb,
      streamId: 'c145d7980bd0f0a588593d3d1d410db4',
    },
    {
      id: 'ep-3',
      number: 3,
      title: 'Friend and Confidant',
      subtitle: 'Not all familiar faces are what they seem.',
      duration: '0:41',
      thumbnail: episode3Thumb,
      streamId: '64ad652bdf77d941144ae6003d6f1fb4',
    },
    {
      id: 'ep-4',
      number: 4,
      title: "At Death's Door",
      subtitle: 'A desperate plan backfires.',
      duration: '0:35',
      thumbnail: episode4Thumb,
      streamId: '90710073f69afa69c79167d633d4bd3d',
    },
    {
      id: 'ep-5',
      number: 5,
      title: 'Whited Sepulcher',
      subtitle: 'Staying behind reveals the true horror.',
      duration: '0:40',
      thumbnail: episode5Thumb,
      streamId: 'a1f76b8264ac7f16ddb924202f9c9bd6',
    },
    {
      id: 'ep-6',
      number: 6,
      title: 'A Measure of Darkness',
      subtitle: 'The gravity of the situation sinks in.',
      duration: '0:45',
      thumbnail: episode6Thumb,
      streamId: '80a5e07b1458530c122519c4f0d44109',
    },
    {
      id: 'ep-7',
      number: 7,
      title: 'Darkest Night Will End',
      subtitle: 'The dawn breaks after a long night.',
      duration: '0:42',
      thumbnail: episode7Thumb,
      streamId: '0ba286f71e64c79b86082291df709d31',
    },
    {
      id: 'ep-8',
      number: 8,
      title: 'Calm Before Storm',
      subtitle: 'Learning the rules of the new world.',
      duration: '0:38',
      thumbnail: episode8Thumb,
      streamId: '571080544617f967ff6bc2256449470f',
    },
    {
      id: 'ep-9',
      number: 9,
      title: 'The Right Questions',
      subtitle: 'Morning light brings possible answers.',
      duration: '0:36',
      thumbnail: episode9Thumb,
      streamId: 'aa26625d9c08b811c37b134700770de6',
    },
    {
      id: 'ep-10',
      number: 10,
      title: 'Absent Without Leave',
      subtitle: 'A voice from the past gives a chilling invitation.',
      duration: '0:34',
      thumbnail: episode10Thumb,
      streamId: '068d014aafd0d6f2a3f3395e70cc70ae',
    },
    {
      id: 'ep-11',
      number: 11,
      title: 'Flicker of Hope',
      subtitle: 'A phone call provides fleeting hope.',
      duration: '0:40',
      thumbnail: episode11Thumb,
      streamId: 'b55d4334bb431ab2706d3dd96d45e027',
    },
    {
      id: 'ep-12',
      number: 12,
      title: 'To Love is to Protect',
      subtitle: 'Goals are laid out, pretenses are cast aside.',
      duration: '0:38',
      thumbnail: episode12Thumb,
      streamId: 'd2b5377041c7ec31ea15ebf9651cdc1f',
    },
    {
      id: 'ep-13',
      number: 13,
      title: 'Gaining Ground',
      subtitle: 'Brief elation turns into a silent nightmare.',
      duration: '0:42',
      thumbnail: episode13Thumb,
      streamId: '6ab03e4790118f990aa837c53bceaa26',
    },
    {
      id: 'ep-14',
      number: 14,
      title: 'Best Laid Plans',
      subtitle: 'The law is no match for madness.',
      duration: '0:36',
      thumbnail: episode14Thumb,
      streamId: '8f90595c10387f4cf9923c53595f5fbe',
    },
    {
      id: 'ep-15',
      number: 15,
      title: 'The Sky is Falling',
      subtitle: 'Chaos descends to herald the doom.',
      duration: '0:44',
      thumbnail: episode15Thumb,
      streamId: 'b0117591239d41c89320cbf04821dcbe',
    },
    {
      id: 'ep-16',
      number: 16,
      title: 'The Opening Act',
      subtitle: 'A front-row seat to the beginning of the end.',
      duration: '0:39',
      thumbnail: episode16Thumb,
      streamId: 'd8451b89ca5557f76c7937be02d8ae06',
    },
    {
      id: 'ep-17',
      number: 17,
      title: 'A Shared Burden',
      subtitle: 'A quiet drive through the neighborhood.',
      duration: '0:41',
      thumbnail: episode17Thumb,
      streamId: '4fbcaf05eedd262227c725984602cf85',
    },
    {
      id: 'ep-18',
      number: 18,
      title: 'Into the Shadows',
      subtitle: 'The dark trail marks the spot.',
      duration: '0:45',
      thumbnail: episode18Thumb,
      streamId: '4d9c3ecdab2b4e1dc9301aa022ccf0ca',
    },
    {
      id: 'ep-19',
      number: 19,
      title: 'A Glimmer in the Dark',
      subtitle: 'The long-awaited reunion is interrupted.',
      duration: '0:30',
      thumbnail: episode19Thumb,
      streamId: 'aeea7dcd27a7958e5dcd37b207dbca4f',
      isLocked: true,
    },
    {
      id: 'ep-20',
      number: 20,
      title: 'Here You Are',
      subtitle: 'There are strange stories to be told.',
      duration: '0:35',
      thumbnail: episode20Thumb,
      streamId: '37624cd1dbf9189955219a261e7e2015',
      isLocked: true,
    },
    {
      id: 'ep-21',
      number: 21,
      title: 'Things Left Behind',
      subtitle: 'Another story on the start of the nightmare.',
      duration: '0:35',
      thumbnail: episode21Thumb,
      streamId: '9ce9cc49492a45018ec7c74ab3d0ab7b',
      isLocked: true,
    },
    {
      id: 'ep-22',
      number: 22,
      title: "What Doesn't Kill You",
      subtitle: 'Recounting of a dazed journey.',
      duration: '0:35',
      thumbnail: episode22Thumb,
      streamId: '2f24a47c7c472ae3e20ce4b1f2116b50',
      isLocked: true,
    },
    {
      id: 'ep-23',
      number: 23,
      title: 'Family Ties',
      subtitle: 'Plans for the next steps are laid out.',
      duration: '0:35',
      thumbnail: episode23Thumb,
      streamId: '135b11300df13e10a12314bafe79de1f',
      isLocked: true,
    },
    {
      id: 'ep-24',
      number: 24,
      title: 'Powerless',
      subtitle: 'The house is no longer a sanctuary.',
      duration: '0:35',
      thumbnail: episode24Thumb,
      streamId: 'd9a9bf144341b84414a2008073966fcf',
      isLocked: true,
    },
    {
      id: 'ep-25',
      number: 25,
      title: 'Simulation Over',
      subtitle: 'The mask is dropped to reveal a darker truth.',
      duration: '0:35',
      thumbnail: episode25Thumb,
      streamId: 'eaf75324c21dd4bca6231b87e4fec03e',
      isNew: true,
      isLocked: true,
    },
  ],
};
