export enum ThemeId {
  AI = 'AI',
  ROBOTICS = 'Robotics',
  HARDWARE = 'Hardware & Wearables',
  SCIENCE = 'Scientific Breakthroughs',
  WORLD = 'World News',
  CRYPTO = 'Crypto & Web3',
  SPACE = 'Space Exploration',
  GAMING = 'Gaming Industry'
}

export interface ThemeOption {
  id: ThemeId;
  label: string;
  icon: string;
  description: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export interface CustomSource {
  id: string;
  value: string;
  type: 'url' | 'social' | 'newsletter';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface NewsletterData {
  content: string;
  sources: GroundingSource[];
  generatedAt: Date;
}

export type AppStatus = 'selection' | 'generating' | 'preview' | 'sent' | 'error';
