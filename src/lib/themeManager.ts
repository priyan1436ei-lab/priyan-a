export type FinFamTheme = 'obsidian' | 'emerald' | 'cyber' | 'amethyst' | 'light';

export interface ThemeOption {
  id: FinFamTheme;
  name: string;
  icon: string;
  gradient: string;
  bgClass: string;
  textClass: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    icon: '🌌',
    gradient: 'from-[#050816] via-[#0A1022] to-[#04060F]',
    bgClass: 'bg-[#050816]',
    textClass: 'text-white'
  },
  {
    id: 'emerald',
    name: 'Emerald Luxe',
    icon: '💎',
    gradient: 'from-[#031A14] via-[#062920] to-[#02100C]',
    bgClass: 'bg-[#031A14]',
    textClass: 'text-emerald-100'
  },
  {
    id: 'cyber',
    name: 'Cyber Cyan',
    icon: '⚡',
    gradient: 'from-[#041527] via-[#08233D] to-[#020B14]',
    bgClass: 'bg-[#041527]',
    textClass: 'text-cyan-100'
  },
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    icon: '💜',
    gradient: 'from-[#140827] via-[#200D3D] to-[#0A0414]',
    bgClass: 'bg-[#140827]',
    textClass: 'text-purple-100'
  },
  {
    id: 'light',
    name: 'Clean Daybreak',
    icon: '☀️',
    gradient: 'from-[#F8FAFC] via-[#EEF2F6] to-[#E2E8F0]',
    bgClass: 'bg-[#0F172A]',
    textClass: 'text-slate-100'
  }
];

export const getSavedTheme = (): FinFamTheme => {
  try {
    const saved = localStorage.getItem('finfam_theme');
    if (saved && ['obsidian', 'emerald', 'cyber', 'amethyst', 'light'].includes(saved)) {
      return saved as FinFamTheme;
    }
  } catch (e) {}
  return 'obsidian';
};

export const applyTheme = (theme: FinFamTheme) => {
  try {
    localStorage.setItem('finfam_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
};
