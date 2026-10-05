export type GenderType = 'male' | 'female' | 'other';
export type PreferenceType = 'female' | 'male' | 'any';

const CU_ADJECTIVES = [
  'Shuttle',
  'Katapahar',
  'Jhilimili',
  'Zulmat',
  'Botanical',
  'Kallol',
  'Chittagong',
  'Station',
  'Bhatiary',
  'ForestHill',
  'Monsoon',
  'ScienceComplex',
  'ArtsFaculty',
  'CentralField',
  'GreenValley',
  'Emerald',
  'Midnight',
  'Secret',
  'Twilight',
  'Sunset',
];

const MALE_TITLES = [
  'Poet',
  'Wanderer',
  'Stargazer',
  'Dreamer',
  'Philosopher',
  'Explorer',
  'Voyager',
  'ChaiLover',
  'Knight',
  'Songwriter',
  'Rider',
  'Novelist',
];

const FEMALE_TITLES = [
  'Muse',
  'Poetess',
  'Stargazer',
  'Dreamer',
  'Enigma',
  'Melody',
  'Princess',
  'ChaiLover',
  'Butterfly',
  'Songbird',
  'Storyteller',
  'Seraph',
];

const NEUTRAL_TITLES = [
  'Spirit',
  'Soul',
  'Nomad',
  'Echo',
  'Seeker',
  'Stargazer',
  'ChaiLover',
  'Dreamer',
  'Mystery',
  'Voyager',
];

export function generatePseudonym(gender: GenderType): string {
  const adj = CU_ADJECTIVES[Math.floor(Math.random() * CU_ADJECTIVES.length)];
  let titleList = NEUTRAL_TITLES;
  if (gender === 'male') titleList = MALE_TITLES;
  if (gender === 'female') titleList = FEMALE_TITLES;
  const title = titleList[Math.floor(Math.random() * titleList.length)];
  const num = Math.floor(10 + Math.random() * 89);
  return `${adj} ${title} #${num}`;
}

export function getDiceBearAvatar(gender: GenderType, seed: string): string {
  const cleanSeed = encodeURIComponent(seed.trim() || 'student');
  if (gender === 'female') {
    // Lorelei or Adventurer for feminine cute look
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${cleanSeed}&radius=50&backgroundColor=10b981,059669,047857,064e3b`;
  } else if (gender === 'male') {
    // Micah or Adventurer for masculine look
    return `https://api.dicebear.com/7.x/micah/svg?seed=${cleanSeed}&radius=50&backgroundColor=047857,065f46,0f766e,115e59`;
  } else {
    // Bottts or Thumbs
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanSeed}&radius=50&backgroundColor=064e3b,022c22,047857`;
  }
}

export const CU_FACULTIES = [
  'Faculty of Science',
  'Faculty of Arts & Humanities',
  'Faculty of Business Administration',
  'Faculty of Social Sciences',
  'Faculty of Law',
  'Faculty of Biological Sciences',
  'Faculty of Engineering',
  'Institute of Forestry & Environmental Sciences',
  'Institute of Marine Sciences',
];

export const CU_BATCHES = [
  '55th Batch (Senior Alumni)',
  '56th Batch',
  '57th Batch',
  '58th Batch',
  '59th Batch',
  '60th Batch (Freshers)',
];
