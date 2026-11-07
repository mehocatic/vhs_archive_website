export interface SheetDef {
  url: string;
  w: number;
  h: number;
}

export type SheetId = 'covers' | 'spines' | 'fix' | 'fix2';

export interface CropBox {
  sheet: SheetId;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FilmDef {
  id: string;
  title: string;
  romaji: string;
  kanji: string;
  year: number;
  genre: string;
  min: number;
  synopsis: string;
  spineCrop: CropBox;
  coverCrop: CropBox;
  spineBg: {
    backgroundImage: string;
    backgroundSize: string;
    backgroundPosition: string;
    backgroundRepeat: string;
  };
  coverBg: {
    backgroundImage: string;
    backgroundSize: string;
    backgroundPosition: string;
    backgroundRepeat: string;
  };
  poster: {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const SHEETS: Record<SheetId, SheetDef> = {
  covers: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010644_837e04ca-2418-45c1-b8e0-0233265c4cd5.png&w=1744&q=85',
    w: 1744,
    h: 2336,
  },
  spines: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010738_a3e47ead-18f2-4974-9468-06d16a25edc5.png&w=2688&q=85',
    w: 2688,
    h: 1152,
  },
  fix: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010831_3ebb874b-93dc-433e-87ed-6299aba720f0.png&w=1520&q=85',
    w: 1520,
    h: 2688,
  },
  fix2: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_092020_f96bc094-db7b-46de-9298-074a24e0a3b8.png&w=1520&q=85',
    w: 1520,
    h: 2688,
  },
};

function computeFaceBg(crop: CropBox) {
  const sheet = SHEETS[crop.sheet];
  const sizeX = (sheet.w / crop.w) * 100;
  const sizeY = (sheet.h / crop.h) * 100;
  const posX = (crop.x / (sheet.w - crop.w)) * 100;
  const posY = (crop.y / (sheet.h - crop.h)) * 100;
  return {
    backgroundImage: `url('${sheet.url}')`,
    backgroundSize: `${sizeX}% ${sizeY}%`,
    backgroundPosition: `${posX}% ${posY}%`,
    backgroundRepeat: 'no-repeat',
  };
}

function computePoster(crop: CropBox) {
  const sheet = SHEETS[crop.sheet];
  return {
    url: sheet.url,
    x: (-crop.x * 474) / crop.w,
    y: (-crop.y * 900) / crop.h,
    width: (sheet.w * 474) / crop.w,
    height: (sheet.h * 900) / crop.h,
  };
}

const RAW_FILMS: Omit<FilmDef, 'spineBg' | 'coverBg' | 'poster'>[] = [
  {
    id: 'valley',
    title: 'The Silent Valley',
    romaji: 'SHIZUKANA TANI',
    kanji: '静かな谷',
    year: 1958,
    genre: 'Drama',
    min: 104,
    synopsis:
      'A schoolteacher returns to the mountain village that exiled her father, and finds the valley has kept every one of its secrets.',
    spineCrop: { sheet: 'spines', x: 266, y: 31, w: 189, h: 1089 },
    coverCrop: { sheet: 'covers', x: 497, y: 72, w: 344, h: 659 },
  },
  {
    id: 'bluehour',
    title: 'The Blue Hour',
    romaji: 'AO NO TOKI',
    kanji: '青の刻',
    year: 1962,
    genre: 'Romance',
    min: 97,
    synopsis:
      'Over one long evening in a harbour town, a widow and a stranger trade small lies until the light runs out.',
    spineCrop: { sheet: 'spines', x: 492, y: 31, w: 189, h: 1089 },
    coverCrop: { sheet: 'covers', x: 914, y: 72, w: 342, h: 659 },
  },
  {
    id: 'river',
    title: 'River of Salt',
    romaji: 'SHIO NO KAWA',
    kanji: '塩の川',
    year: 1964,
    genre: 'Drama',
    min: 121,
    synopsis:
      'Two brothers drag a salt barge downriver to a city that no longer wants anything they carry.',
    spineCrop: { sheet: 'fix', x: 197, y: 54, w: 324, h: 2566 },
    coverCrop: { sheet: 'covers', x: 1332, y: 72, w: 344, h: 659 },
  },
  {
    id: 'summer',
    title: 'The Last Summer',
    romaji: 'SAIGO NO NATSU',
    kanji: '最後の夏',
    year: 1966,
    genre: 'Drama',
    min: 109,
    synopsis:
      'The summer before the dam floods their village, three friends set fire to everything they cannot take with them.',
    spineCrop: { sheet: 'spines', x: 937, y: 31, w: 188, h: 1089 },
    coverCrop: { sheet: 'covers', x: 74, y: 813, w: 344, h: 676 },
  },
  {
    id: 'green',
    title: 'The Green Road',
    romaji: 'MIDORI NO MICHI',
    kanji: '緑の道',
    year: 1969,
    genre: 'Mystery',
    min: 101,
    synopsis:
      'A surveyor mapping a forest road keeps finding the same footprints, always one day ahead of him.',
    spineCrop: { sheet: 'spines', x: 1157, y: 31, w: 185, h: 1090 },
    coverCrop: { sheet: 'covers', x: 497, y: 815, w: 344, h: 674 },
  },
  {
    id: 'noon',
    title: 'Noon in Ashes',
    romaji: 'HAI NO SHOGO',
    kanji: '灰の正午',
    year: 1971,
    genre: 'Western',
    min: 112,
    synopsis:
      'A rider crosses a white desert to settle an old debt, and learns too late who sent him.',
    spineCrop: { sheet: 'spines', x: 44, y: 32, w: 184, h: 1088 },
    coverCrop: { sheet: 'covers', x: 74, y: 72, w: 347, h: 659 },
  },
  {
    id: 'observer',
    title: 'The Observer',
    romaji: 'KANSATSUSHA',
    kanji: '観察者',
    year: 1973,
    genre: 'Thriller',
    min: 96,
    synopsis:
      'A night watchman begins to suspect that the building he guards has started watching him back.',
    spineCrop: { sheet: 'fix2', x: 371, y: 15, w: 349, h: 2655 },
    coverCrop: { sheet: 'covers', x: 915, y: 815, w: 342, h: 675 },
  },
  {
    id: 'birds',
    title: 'The Fallen Birds',
    romaji: 'OCHITA TORI',
    kanji: '落ちた鳥',
    year: 1975,
    genre: 'Drama',
    min: 118,
    synopsis:
      'When the birds stop singing over a frontier town, the mayor’s daughter is the only one who goes looking for the reason.',
    spineCrop: { sheet: 'spines', x: 1573, y: 31, w: 183, h: 1089 },
    coverCrop: { sheet: 'covers', x: 1331, y: 815, w: 345, h: 675 },
  },
  {
    id: 'storm',
    title: 'Light in the Storm',
    romaji: 'ARASHI NO HI',
    kanji: '嵐の灯',
    year: 1978,
    genre: 'Drama',
    min: 127,
    synopsis:
      'A lighthouse keeper and his son wait out a three-day storm with a shipwrecked sailor who will not give his name.',
    spineCrop: { sheet: 'fix2', x: 808, y: 15, w: 347, h: 2656 },
    coverCrop: { sheet: 'covers', x: 74, y: 1571, w: 345, h: 681 },
  },
  {
    id: 'tide',
    title: 'The Long Tide',
    romaji: 'NAGAI SHIO',
    kanji: '長い潮',
    year: 1981,
    genre: 'Drama',
    min: 99,
    synopsis:
      'A fisherman’s wife counts the tides on the harbour wall while her husband’s boat fails to come home.',
    spineCrop: { sheet: 'spines', x: 2012, y: 31, w: 188, h: 1089 },
    coverCrop: { sheet: 'covers', x: 496, y: 1577, w: 343, h: 678 },
  },
  {
    id: 'war',
    title: 'A Quiet War',
    romaji: 'SHIZUKANA SENSO',
    kanji: '静かな戦争',
    year: 1985,
    genre: 'Comedy',
    min: 103,
    synopsis:
      'Two neighbours fight a silent war over a garden wall for thirty years, and neither will say how it began.',
    spineCrop: { sheet: 'spines', x: 2236, y: 31, w: 189, h: 1089 },
    coverCrop: { sheet: 'covers', x: 913, y: 1579, w: 343, h: 676 },
  },
  {
    id: 'door',
    title: 'Red Door',
    romaji: 'AKAI TOBIRA',
    kanji: '赤い扉',
    year: 1989,
    genre: 'Thriller',
    min: 114,
    synopsis:
      'A projectionist follows a reel of unknown film through the corridors of a cinema on its final night.',
    spineCrop: { sheet: 'spines', x: 2462, y: 31, w: 188, h: 1089 },
    coverCrop: { sheet: 'covers', x: 1331, y: 1579, w: 344, h: 677 },
  },
];

export const FILMS: FilmDef[] = RAW_FILMS.map((film) => ({
  ...film,
  spineBg: computeFaceBg(film.spineCrop),
  coverBg: computeFaceBg(film.coverCrop),
  poster: computePoster(film.coverCrop),
}));

export function preloadSheets(): void {
  if (typeof window === 'undefined') return;
  Object.values(SHEETS).forEach((sheet) => {
    const img = new Image();
    img.src = sheet.url;
  });
}
