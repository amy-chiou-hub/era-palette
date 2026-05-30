export interface Filters {
  temp: number; // -100 to 100 (mapped to sepia/hue-rotate)
  brightness: number; // 0 to 200
  contrast: number; // 0 to 200
  saturate: number; // 0 to 200
  grayscale: number; // 0 to 100
  sepia: number; // 0 to 100
}

export interface Era {
  id: string;
  name: string;
  year: string;
  location: string;
  description: string;
  insight: string;
  clues: string[];
  imageUrl: string;
  target: Filters;
  initial: Filters;
}

export interface GameState {
  stage: 'welcome' | 'menu' | 'level' | 'result' | 'gallery';
  currentLevelIndex: number;
  playerFilters: Filters;
  score: number | null;
  hintsUsed: number;
  coins: number;
  earnedCoins: number;
  breakdown: {
    warmth: number;
    color: number;
    texture: number;
  } | null;
}