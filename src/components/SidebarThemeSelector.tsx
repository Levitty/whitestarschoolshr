import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarTheme {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    muted: string;
  };
  preview: {
    bg: string;
    accent: string;
  };
}

export const sidebarThemes: SidebarTheme[] = [
  // Light themes
  {
    id: 'light-default',
    name: 'Clean White',
    isDark: false,
    colors: {
      background: '0 0% 100%',
      foreground: '222 47% 11%',
      primary: '230 65% 45%',
      primaryForeground: '0 0% 100%',
      accent: '220 14% 96%',
      accentForeground: '222 47% 11%',
      border: '220 13% 91%',
      muted: '220 9% 46%',
    },
    preview: { bg: '#ffffff', accent: '#4361ee' },
  },
  {
    id: 'light-warm',
    name: 'Warm Sand',
    isDark: false,
    colors: {
      background: '40 30% 98%',
      foreground: '30 20% 15%',
      primary: '25 80% 50%',
      primaryForeground: '0 0% 100%',
      accent: '40 20% 94%',
      accentForeground: '30 20% 15%',
      border: '40 15% 90%',
      muted: '30 10% 50%',
    },
    preview: { bg: '#faf8f5', accent: '#e67e22' },
  },
  {
    id: 'light-mint',
    name: 'Fresh Mint',
    isDark: false,
    colors: {
      background: '160 30% 98%',
      foreground: '160 20% 15%',
      primary: '160 55% 40%',
      primaryForeground: '0 0% 100%',
      accent: '160 20% 94%',
      accentForeground: '160 20% 15%',
      border: '160 15% 90%',
      muted: '160 10% 50%',
    },
    preview: { bg: '#f5faf8', accent: '#27ae60' },
  },
  {
    id: 'light-lavender',
    name: 'Soft Lavender',
    isDark: false,
    colors: {
      background: '270 30% 98%',
      foreground: '270 20% 15%',
      primary: '270 55% 55%',
      primaryForeground: '0 0% 100%',
      accent: '270 20% 94%',
      accentForeground: '270 20% 15%',
      border: '270 15% 90%',
      muted: '270 10% 50%',
    },
    preview: { bg: '#f8f5fa', accent: '#9b59b6' },
  },
  // Dark themes
  {
    id: 'dark-slate',
    name: 'Charcoal',
    isDark: true,
    colors: {
      background: '220 20% 14%',
      foreground: '220 15% 90%',
      primary: '220 60% 55%',
      primaryForeground: '0 0% 100%',
      accent: '220 20% 20%',
      accentForeground: '220 15% 90%',
      border: '220 15% 20%',
      muted: '220 10% 55%',
    },
    preview: { bg: '#1e2433', accent: '#5c7cfa' },
  },
  {
    id: 'dark-teal',
    name: 'Deep Teal',
    isDark: true,
    colors: {
      background: '200 30% 15%',
      foreground: '200 15% 90%',
      primary: '175 50% 45%',
      primaryForeground: '0 0% 100%',
      accent: '200 25% 22%',
      accentForeground: '200 15% 90%',
      border: '200 20% 22%',
      muted: '200 10% 55%',
    },
    preview: { bg: '#1a2e35', accent: '#2dd4bf' },
  },
  {
    id: 'dark-purple',
    name: 'Royal Purple',
    isDark: true,
    colors: {
      background: '270 25% 16%',
      foreground: '270 15% 92%',
      primary: '270 60% 58%',
      primaryForeground: '0 0% 100%',
      accent: '270 25% 22%',
      accentForeground: '270 15% 92%',
      border: '270 20% 22%',
      muted: '270 10% 55%',
    },
    preview: { bg: '#2a1f3d', accent: '#a855f7' },
  },
  {
    id: 'dark-forest',
    name: 'Forest',
    isDark: true,
    colors: {
      background: '160 25% 14%',
      foreground: '160 15% 90%',
      primary: '160 55% 45%',
      primaryForeground: '0 0% 100%',
      accent: '160 25% 20%',
      accentForeground: '160 15% 90%',
      border: '160 20% 20%',
      muted: '160 10% 55%',
    },
    preview: { bg: '#1a2e24', accent: '#22c55e' },
  },
];

const STORAGE_KEY = 'sidebar-theme';

export const getSavedTheme = (): SidebarTheme => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const theme = sidebarThemes.find(t => t.id === saved);
    if (theme) return theme;
  }
  return sidebarThemes[0];
};

export const applySidebarTheme = (theme: SidebarTheme) => {
  const root = document.documentElement;
  root.style.setProperty('--sidebar-background', theme.colors.background);
  root.style.setProperty('--sidebar-foreground', theme.colors.foreground);
  root.style.setProperty('--sidebar-primary', theme.colors.primary);
  root.style.setProperty('--sidebar-primary-foreground', theme.colors.primaryForeground);
  root.style.setProperty('--sidebar-accent', theme.colors.accent);
  root.style.setProperty('--sidebar-accent-foreground', theme.colors.accentForeground);
  root.style.setProperty('--sidebar-border', theme.colors.border);
  root.style.setProperty('--sidebar-ring', theme.colors.primary);
  root.style.setProperty('--sidebar-muted', theme.colors.muted);
  localStorage.setItem(STORAGE_KEY, theme.id);
};

const SidebarThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>(getSavedTheme().id);

  useEffect(() => {
    const theme = sidebarThemes.find(t => t.id === selectedTheme);
    if (theme) {
      applySidebarTheme(theme);
    }
  }, [selectedTheme]);

  const lightThemes = sidebarThemes.filter(t => !t.isDark);
  const darkThemes = sidebarThemes.filter(t => t.isDark);

  const ThemeButton = ({ theme }: { theme: SidebarTheme }) => (
    <button
      onClick={() => setSelectedTheme(theme.id)}
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
        selectedTheme === theme.id
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-transparent bg-muted/30 hover:bg-muted/50"
      )}
    >
      {/* Color preview */}
      <div
        className="w-full h-10 rounded-lg shadow-inner overflow-hidden border border-border/50"
        style={{ backgroundColor: theme.preview.bg }}
      >
        {/* Mini sidebar preview */}
        <div className="h-full p-2 flex flex-col gap-1">
          <div 
            className="w-1/2 h-1.5 rounded-full"
            style={{ backgroundColor: theme.preview.accent }}
          />
          <div 
            className="w-3/4 h-1 rounded-full opacity-30"
            style={{ backgroundColor: theme.isDark ? '#ffffff' : '#000000' }}
          />
          <div 
            className="w-2/3 h-1 rounded-full opacity-20"
            style={{ backgroundColor: theme.isDark ? '#ffffff' : '#000000' }}
          />
        </div>
      </div>
      
      {/* Theme name */}
      <span className="text-xs font-medium text-foreground">
        {theme.name}
      </span>

      {/* Selected indicator */}
      {selectedTheme === theme.id && (
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <Palette className="h-5 w-5 text-primary" />
          Sidebar Theme
        </CardTitle>
        <CardDescription>
          Choose a color theme for your navigation sidebar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Light Themes */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">Light Themes</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {lightThemes.map((theme) => (
              <ThemeButton key={theme.id} theme={theme} />
            ))}
          </div>
        </div>

        {/* Dark Themes */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">Dark Themes</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {darkThemes.map((theme) => (
              <ThemeButton key={theme.id} theme={theme} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SidebarThemeSelector;
