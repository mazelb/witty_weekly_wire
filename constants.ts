import { ThemeId, ThemeOption, NewsSource } from './types';

export const THEMES: ThemeOption[] = [
  {
    id: ThemeId.AI,
    label: "Artificial Intelligence",
    icon: "🤖",
    description: "LLMs, generative art, and our future robot overlords."
  },
  {
    id: ThemeId.ROBOTICS,
    label: "Robotics",
    icon: "🦾",
    description: "Boston Dynamics dances and automated helpers."
  },
  {
    id: ThemeId.HARDWARE,
    label: "Hardware & Wearables",
    icon: "⌚",
    description: "The latest chips, vision pros, and smart rings."
  },
  {
    id: ThemeId.SCIENCE,
    label: "Scientific Breakthroughs",
    icon: "🧬",
    description: "CRISPR, fusion energy, and curing the incurable."
  },
  {
    id: ThemeId.SPACE,
    label: "Space Exploration",
    icon: "🚀",
    description: "Mars missions, Webb telescope, and aliens (maybe)."
  },
  {
    id: ThemeId.WORLD,
    label: "World News",
    icon: "🌍",
    description: "Global events, minus the doomscrolling vibe."
  },
];

export const NEWS_SOURCES: NewsSource[] = [
  { id: 'techcrunch', name: 'TechCrunch', url: 'techcrunch.com', icon: '⚡' },
  { id: 'theverge', name: 'The Verge', url: 'theverge.com', icon: '📐' },
  { id: 'wired', name: 'Wired', url: 'wired.com', icon: '🔌' },
  { id: 'mit', name: 'MIT Tech Review', url: 'technologyreview.com', icon: '🏛️' },
  { id: 'arstechnica', name: 'Ars Technica', url: 'arstechnica.com', icon: '📜' },
  { id: 'reuters', name: 'Reuters', url: 'reuters.com', icon: '📡' },
  { id: 'bloomberg', name: 'Bloomberg', url: 'bloomberg.com', icon: '📉' },
  { id: 'nature', name: 'Nature', url: 'nature.com', icon: '🍃' },
];
