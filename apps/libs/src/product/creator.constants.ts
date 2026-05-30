export type productTypeHelper =
  | 'BOOK'
  | 'GAME'
  | 'GASTRO'
  | 'GIFT_CARD'
  | 'PUZZLE'
  | 'CARDS'
  | 'TOYS';

export const DEFAULT_EMAIL = 'martin.orsag108@gmail.com';
export const DISCOUNT = [0, 0, 0, 0, 0, 0.05, 0.1, 0.2];
export const RATING_MAX = 5;
export const RATING_MIN = 1;
export const DEFAULT_AVATAR =
  'https://avatars.githubusercontent.com/u/971652350';

export const RATING = {
  min: RATING_MIN,
  max: RATING_MAX,
  fractionDigits: 1,
};

export const computerGameCategory = [
  'Strategic',
  'Shooter',
  'RPG',
  'Survival',
  'Simulation',
  'Platformer',
  'Action-Adventure',
];

export const gatroCategory = [
  'Chocolate',
  'Candy',
  'Puddings',
  'Pastries',
  'Coffee',
];

export const gastroBrands = [
  'Ferrero',
  'Lindt',
  'Nestle',
  'Mars',
  'Trolli',
  'Haribo',
  'Twizzlers',
  'Reese',
  'Milka',
  "Allen's",
  'Skittles',
];

export const computerGames = [
  "Baldur's Gate 3",
  'Elden Ring Nightreign',
  'Slay the Spire 2',
  'Borderlands 4',
  'Resident Evil Requiem',
  'Cyberpunk 2077',
  'Half-Life: Alyx',
  'The Witcher 3: Wild Hunt',
  'Doom Eternal',
  'Hollow Knight',
  'Minecraft',
  'Red Dead Redemption 2',
  'The Elder Scrolls V: Skyrim',
  'Portal 2',
  'Grand Theft Auto V',
  'Hades',
  'Disco Elysium',
  'Dark Souls III',
  'StarCraft II',
  'Mass Effect 2',
  'Civilization VI',
  'Terraria',
  'Stardew Valley',
  'Hogwarts Legacy',
  'Forza Horizon 5',
  'God of War',
  'Helldivers 2',
  'Apex Legends',
  'Counter-Strike 2',
  'World of Warcraft',
];

export const categories: string[] = [
  'Fiction',
  'Non-fiction',
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'History',
  'Biography',
  'Self-help',
  'Mystery',
];

export const computerGameBrands: string[] = [
  'GSC',
  'GTA',
  'Bethesda',
  'Pearl Abyss',
  'Electronic Arts (EA)',
  'Ubisoft',
  'Valve',
  'Nintendo',
  'Sony IE',
  'Xbox Game Studios',
  'Blizzard',
];
