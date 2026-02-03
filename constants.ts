import { ThemeId, ThemeOption } from './types';

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
