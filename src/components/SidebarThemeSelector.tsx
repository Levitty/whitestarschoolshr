import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
    border: string;
    muted: string;
  };
  gradient: string;
}

export const sidebarThemes: SidebarTheme[] = [
  {
    id: 'teal',
    name: 'Deep Teal',
    colors: {
      background: '200 30% 15%',
      foreground: '200 15% 90%',
      primary: '175 50% 45%',
      accent: '200 25% 22%',
      border: '200 20% 22%',
      muted: '200 15% 35%',
    },
    gradient: 'linear-gradient(180deg, hsl(200 30% 15%) 0%, hsl(200 28% 18%) 50%, hsl(200 30% 15%) 100%)',
  },
  {
    id: 'slate',
    name: 'Charcoal Slate',
    colors: {
      background: '220 20% 14%',
      foreground: '220 15% 90%',
      primary: '220 60% 55%',
      accent: '220 20% 20%',
      border: '220 15% 20%',
      muted: '220 15% 35%',
    },
    gradient: 'linear-gradient(180deg, hsl(220 20% 14%) 0%, hsl(220 18% 18%) 50%, hsl(220 20% 14%) 100%)',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    colors: {
      background: '245 25% 18%',
      foreground: '245 15% 92%',
      primary: '245 60% 60%',
      accent: '245 25% 25%',
      border: '245 20% 25%',
      muted: '245 15% 38%',
    },
    gradient: 'linear-gradient(180deg, hsl(245 25% 18%) 0%, hsl(245 22% 22%) 50%, hsl(245 25% 18%) 100%)',
  },
  {
    id: 'emerald',
    name: 'Forest Green',
    colors: {
      background: '160 25% 14%',
      foreground: '160 15% 90%',
      primary: '160 55% 45%',
      accent: '160 25% 20%',
      border: '160 20% 20%',
      muted: '160 15% 32%',
    },
    gradient: 'linear-gradient(180deg, hsl(160 25% 14%) 0%, hsl(160 22% 18%) 50%, hsl(160 25% 14%) 100%)',
  },
  {
    id: 'rose',
    name: 'Burgundy Rose',
    colors: {
      background: '350 25% 16%',
      foreground: '350 15% 92%',
      primary: '350 60% 55%',
      accent: '350 25% 22%',
      border: '350 20% 22%',
      muted: '350 15% 35%',
    },
    gradient: 'linear-gradient(180deg, hsl(350 25% 16%) 0%, hsl(350 22% 20%) 50%, hsl(350 25% 16%) 100%)',
  },
  {
    id: 'amber',
    name: 'Warm Espresso',
    colors: {
      background: '30 20% 14%',
      foreground: '30 15% 90%',
      primary: '35 70% 50%',
      accent: '30 20% 20%',
      border: '30 15% 20%',
      muted: '30 15% 32%',
    },
    gradient: 'linear-gradient(180deg, hsl(30 20% 14%) 0%, hsl(30 18% 18%) 50%, hsl(30 20% 14%) 100%)',
  },
  {
    id: 'violet',
    name: 'Deep Purple',
    colors: {
      background: '270 25% 16%',
      foreground: '270 15% 92%',
      primary: '270 60% 58%',
      accent: '270 25% 22%',
      border: '270 20% 22%',
      muted: '270 15% 35%',
    },
    gradient: 'linear-gradient(180deg, hsl(270 25% 16%) 0%, hsl(270 22% 20%) 50%, hsl(270 25% 16%) 100%)',
  },
  {
    id: 'cyan',
    name: 'Ocean Blue',
    colors: {
      background: '195 30% 14%',
      foreground: '195 15% 92%',
      primary: '195 70% 50%',
      accent: '195 25% 20%',
      border: '195 20% 20%',
      muted: '195 15% 32%',
    },
    gradient: 'linear-gradient(180deg, hsl(195 30% 14%) 0%, hsl(195 28% 18%) 50%, hsl(195 30% 14%) 100%)',
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
  root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
  root.style.setProperty('--sidebar-accent', theme.colors.accent);
  root.style.setProperty('--sidebar-accent-foreground', theme.colors.foreground);
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
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sidebarThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                selectedTheme === theme.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/30 hover:bg-muted/50"
              )}
            >
              {/* Color preview */}
              <div
                className="w-full h-12 rounded-lg shadow-inner overflow-hidden"
                style={{ background: theme.gradient }}
              >
                {/* Mini sidebar preview */}
                <div className="h-full p-2 flex flex-col gap-1">
                  <div 
                    className="w-1/2 h-1.5 rounded-full opacity-80"
                    style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                  />
                  <div 
                    className="w-3/4 h-1 rounded-full opacity-40"
                    style={{ backgroundColor: `hsl(${theme.colors.foreground})` }}
                  />
                  <div 
                    className="w-2/3 h-1 rounded-full opacity-40"
                    style={{ backgroundColor: `hsl(${theme.colors.foreground})` }}
                  />
                </div>
              </div>
              
              {/* Theme name */}
              <span className="text-xs font-medium text-foreground">
                {theme.name}
              </span>

              {/* Selected indicator */}
              {selectedTheme === theme.id && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SidebarThemeSelector;
