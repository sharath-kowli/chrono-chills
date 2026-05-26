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
import episode0Thumb from '@/assets/episode-0.jpg';
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
import episode26Thumb from '@/assets/episode-26.jpg';
import episode27Thumb from '@/assets/episode-27.jpg';
import episode28Thumb from '@/assets/episode-28.jpg';
import episode29Thumb from '@/assets/episode-29.jpg';
import episode30Thumb from '@/assets/episode-30.jpg';
import episode31Thumb from '@/assets/episode-31.jpg';
import episode32Thumb from '@/assets/episode-32.jpg';
import episode33Thumb from '@/assets/episode-33.jpg';
import episode34Thumb from '@/assets/episode-34.jpg';
import episode35Thumb from '@/assets/episode-35.jpg';
import episode36Thumb from '@/assets/episode-36.jpg';
import episode37Thumb from '@/assets/episode-37.jpg';
import episode38Thumb from '@/assets/episode-38.jpg';

export const series: Series = {
  id: 'still-here-season-1',
  title: 'STILL HERE',
  tagline: 'Hell is full. We\'re still here.',
  episodes: [
    {
      id: 'ep-0',
      number: 0,
      title: 'Lone and Dreary World',
      subtitle: 'Getting through another day.',
      duration: '1:16',
      thumbnail: episode0Thumb,
      streamId: '72ffbb035554bbd5347daa43ec85db20',
    },
    {
      id: 'ep-1',
      number: 1,
      title: 'World in Your Eyes',
      subtitle: 'A school day takes a surreal turn.',
      duration: '0:31',
      thumbnail: episode1Thumb,
      streamId: 'c69cf60b260460f73325843ba825cbf1',
    },
    {
      id: 'ep-2',
      number: 2,
      title: 'Being Different',
      subtitle: 'The corridors become a trap.',
      duration: '0:35',
      thumbnail: episode2Thumb,
      streamId: 'c145d7980bd0f0a588593d3d1d410db4',
    },
    {
      id: 'ep-3',
      number: 3,
      title: 'Friend and Confidant',
      subtitle: 'Not all familiar faces are what they seem.',
      duration: '0:28',
      thumbnail: episode3Thumb,
      streamId: '64ad652bdf77d941144ae6003d6f1fb4',
    },
    {
      id: 'ep-4',
      number: 4,
      title: "At Death's Door",
      subtitle: 'A desperate plan backfires.',
      duration: '0:36',
      thumbnail: episode4Thumb,
      streamId: '90710073f69afa69c79167d633d4bd3d',
    },
    {
      id: 'ep-5',
      number: 5,
      title: 'Whited Sepulcher',
      subtitle: 'Staying behind reveals the true horror.',
      duration: '0:36',
      thumbnail: episode5Thumb,
      streamId: 'a1f76b8264ac7f16ddb924202f9c9bd6',
    },
    {
      id: 'ep-6',
      number: 6,
      title: 'A Measure of Darkness',
      subtitle: 'The gravity of the situation sinks in.',
      duration: '0:25',
      thumbnail: episode6Thumb,
      streamId: '80a5e07b1458530c122519c4f0d44109',
    },
    {
      id: 'ep-7',
      number: 7,
      title: 'Darkest Night Will End',
      subtitle: 'The dawn breaks after a long night.',
      duration: '0:40',
      thumbnail: episode7Thumb,
      streamId: '0ba286f71e64c79b86082291df709d31',
    },
    {
      id: 'ep-8',
      number: 8,
      title: 'Calm Before Storm',
      subtitle: 'Learning the rules of the new world.',
      duration: '0:30',
      thumbnail: episode8Thumb,
      streamId: '571080544617f967ff6bc2256449470f',
    },
    {
      id: 'ep-9',
      number: 9,
      title: 'The Right Questions',
      subtitle: 'Morning light brings possible answers.',
      duration: '0:40',
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
      duration: '0:50',
      thumbnail: episode11Thumb,
      streamId: 'b55d4334bb431ab2706d3dd96d45e027',
    },
    {
      id: 'ep-12',
      number: 12,
      title: 'To Love is to Protect',
      subtitle: 'Goals are laid out, pretenses are cast aside.',
      duration: '0:43',
      thumbnail: episode12Thumb,
      streamId: 'd2b5377041c7ec31ea15ebf9651cdc1f',
    },
    {
      id: 'ep-13',
      number: 13,
      title: 'Gaining Ground',
      subtitle: 'Brief elation turns into a silent nightmare.',
      duration: '0:38',
      thumbnail: episode13Thumb,
      streamId: '6ab03e4790118f990aa837c53bceaa26',
    },
    {
      id: 'ep-14',
      number: 14,
      title: 'Best Laid Plans',
      subtitle: 'The law is no match for madness.',
      duration: '0:27',
      thumbnail: episode14Thumb,
      streamId: '8f90595c10387f4cf9923c53595f5fbe',
    },
    {
      id: 'ep-15',
      number: 15,
      title: 'The Sky is Falling',
      subtitle: 'Chaos descends to herald the doom.',
      duration: '0:25',
      thumbnail: episode15Thumb,
      streamId: 'b0117591239d41c89320cbf04821dcbe',
    },
    {
      id: 'ep-16',
      number: 16,
      title: 'The Opening Act',
      subtitle: 'A front-row seat to the beginning of the end.',
      duration: '0:28',
      thumbnail: episode16Thumb,
      streamId: 'd8451b89ca5557f76c7937be02d8ae06',
    },
    {
      id: 'ep-17',
      number: 17,
      title: 'A Shared Burden',
      subtitle: 'A quiet drive through the neighborhood.',
      duration: '0:55',
      thumbnail: episode17Thumb,
      streamId: '4fbcaf05eedd262227c725984602cf85',
    },
    {
      id: 'ep-18',
      number: 18,
      title: 'Into the Shadows',
      subtitle: 'The dark trail marks the spot.',
      duration: '0:40',
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
      duration: '0:22',
      thumbnail: episode20Thumb,
      streamId: '37624cd1dbf9189955219a261e7e2015',
      isLocked: true,
    },
    {
      id: 'ep-21',
      number: 21,
      title: 'Things Left Behind',
      subtitle: 'Another story on the start of the nightmare.',
      duration: '1:49',
      thumbnail: episode21Thumb,
      streamId: '9ce9cc49492a45018ec7c74ab3d0ab7b',
      isLocked: true,
    },
    {
      id: 'ep-22',
      number: 22,
      title: "What Doesn't Kill You",
      subtitle: 'Recounting of a dazed journey.',
      duration: '1:19',
      thumbnail: episode22Thumb,
      streamId: '2f24a47c7c472ae3e20ce4b1f2116b50',
      isLocked: true,
    },
    {
      id: 'ep-23',
      number: 23,
      title: 'Family Ties',
      subtitle: 'Plans for the next steps are laid out.',
      duration: '1:51',
      thumbnail: episode23Thumb,
      streamId: '135b11300df13e10a12314bafe79de1f',
      isLocked: true,
    },
    {
      id: 'ep-24',
      number: 24,
      title: 'Powerless',
      subtitle: 'The house is no longer a sanctuary.',
      duration: '0:30',
      thumbnail: episode24Thumb,
      streamId: 'd9a9bf144341b84414a2008073966fcf',
      isLocked: true,
    },
    {
      id: 'ep-25',
      number: 25,
      title: 'Simulation Over',
      subtitle: 'The mask is dropped to reveal a darker truth.',
      duration: '0:40',
      thumbnail: episode25Thumb,
      streamId: 'eaf75324c21dd4bca6231b87e4fec03e',
      isLocked: true,
    },
    {
      id: 'ep-26',
      number: 26,
      title: 'An Act of Mercy',
      subtitle: 'The cost of survival becomes unbearable.',
      duration: '0:49',
      thumbnail: episode26Thumb,
      streamId: 'b2972edd0bfcccf09e6c773f8137780d',
      isLocked: true,
    },
    {
      id: 'ep-27',
      number: 27,
      title: 'Ashes to Ashes',
      subtitle: 'What remains when everything burns away.',
      duration: '1:38',
      thumbnail: episode27Thumb,
      streamId: '274216508270b4a99db2e5af4a75b760',
      isLocked: true,
    },
    {
      id: 'ep-28',
      number: 28,
      title: 'Episode 28',
      subtitle: 'The nightmare continues.',
      duration: '0:44',
      thumbnail: episode28Thumb,
      streamId: 'b75b1413b67d2e1c7d0a756797516c93',
      isLocked: true,
    },
    {
      id: 'ep-29',
      number: 29,
      title: 'Pathological',
      subtitle: 'The survivors make their way toward the lab.',
      duration: '0:30',
      thumbnail: episode29Thumb,
      streamId: '247ad3dc20743102eb6db25b567ad754',
      isLocked: true,
    },
    {
      id: 'ep-30',
      number: 30,
      title: 'The Dark Passenger',
      subtitle: 'The hospital reveals its horrid secret.',
      duration: '0:30',
      thumbnail: episode30Thumb,
      streamId: 'ff3105f48958ac580795b10ac2154c5e',
      isLocked: true,
    },
    {
      id: 'ep-31',
      number: 31,
      title: 'Fruit of the Harvest',
      subtitle: 'Desperate dash for survival.',
      duration: '0:30',
      thumbnail: episode31Thumb,
      streamId: '89972b1718d7f57971ecf615ad6bf80d',
      isLocked: true,
    },
    {
      id: 'ep-32',
      number: 32,
      title: 'The Bunker',
      subtitle: 'Out with the old, in with the new.',
      duration: '0:30',
      thumbnail: episode32Thumb,
      streamId: '77dd5cccb00dddc0800349fb69a863a1',
      isLocked: true,
    },
    {
      id: 'ep-33',
      number: 33,
      title: 'Clinical Hospitality',
      subtitle: 'The survivors settle in for the testing.',
      duration: '0:30',
      thumbnail: episode33Thumb,
      streamId: '84e018d9b26cd0058ba99db19d058a36',
      isLocked: true,
    },
    {
      id: 'ep-34',
      number: 34,
      title: 'A Piece of Home',
      subtitle: 'The group finds a rare moment of rest.',
      duration: '0:30',
      thumbnail: episode34Thumb,
      streamId: 'f280105211392be169a2a5351f109231',
      isLocked: true,
    },
    {
      id: 'ep-35',
      number: 35,
      title: 'Speculative Fiction',
      subtitle: 'Searching for a name for the nightmare.',
      duration: '0:30',
      thumbnail: episode35Thumb,
      streamId: '814d7db16d724704e63001ea06786d64',
      isLocked: true,
    },
    {
      id: 'ep-36',
      number: 36,
      title: 'Inner Battle',
      subtitle: 'The uncomfortable facts are brought to light.',
      duration: '0:30',
      thumbnail: episode36Thumb,
      streamId: 'a05b08db24bddef308445d52725df9bb',
      isLocked: true,
    },
    {
      id: 'ep-37',
      number: 37,
      title: 'Diagram of Survival',
      subtitle: 'A harsh lesson in probability.',
      duration: '0:30',
      thumbnail: episode37Thumb,
      streamId: '38b99d22626737e2f91ced2c3140d79c',
      isLocked: true,
    },
    {
      id: 'ep-38',
      number: 38,
      title: 'Not a Dream',
      subtitle: 'The past refuses to stay buried.',
      duration: '0:30',
      thumbnail: episode38Thumb,
      streamId: 'd6d1d7cf2def153367f41aa04ffc7193',
      isNew: true,
      isLocked: true,
    },
  ],
};
