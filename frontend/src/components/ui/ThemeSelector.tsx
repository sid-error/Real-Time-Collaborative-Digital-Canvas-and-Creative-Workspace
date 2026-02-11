import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Contrast,
  Check,
  Palette as PaletteIcon
} from 'lucide-react';
import { getStoredTheme, setStoredTheme, applyTheme } from '../../utils/theme';

/**
 * Supported theme types for the application
 *
 * @typedef {'light' | 'dark' | 'system' | 'high-contrast'} ThemeType
 */
export type ThemeType = 'light' | 'dark' | 'system' | 'high-contrast';

/**
 * Interface defining a theme option for display and selection
 */
interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * Interface defining the properties for the ThemeSelector component
 */
interface ThemeSelectorProps {
  /** Currently active theme */
  currentTheme: ThemeType;
  /** Callback when theme changes */
  onThemeChange: (theme: ThemeType) => void;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * ThemeSelector Component
 */
const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  className = ''
}) => {
  /**
   * Array of available theme options with metadata
   */
  const themeOptions: ThemeOption[] = [
    {
      id: 'light',
      name: 'Light',
      description: 'Bright theme for day time use',
      icon: <Sun className="w-5 h-5" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Dark theme for night time use',
      icon: <Moon className="w-5 h-5" />,
      color: 'bg-indigo-600'
    },
    {
      id: 'system',
      name: 'System',
      description: 'Follow your device theme',
      icon: <Monitor className="w-5 h-5" />,
      color: 'bg-slate-600'
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Enhanced visibility for accessibility',
      icon: <Contrast className="w-5 h-5" />,
      color: 'bg-orange-600'
    }
  ];

  /**
   * Local UI state (what user currently selected in this component)
   * Initialized from prop, storage, or fallback.
   */
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(() => {
    return currentTheme || (getStoredTheme() as ThemeType) || 'system';
  });

  /**
   * IMPORTANT:
   * ESLint rule `react-hooks/set-state-in-effect` forbids syncing state in useEffect.
   * So we sync state safely during render using a ref guard.
   */
  const prevThemeRef = useRef<ThemeType | null>(null);

  if (currentTheme && prevThemeRef.current !== currentTheme) {
    prevThemeRef.current = currentTheme;
    setSelectedTheme(currentTheme);
  }

  /**
   * Apply theme + persist when selection changes
   */
  useEffect(() => {
    applyTheme(selectedTheme);
    setStoredTheme(selectedTheme);
  }, [selectedTheme]);

  /**
   * Handle theme selection by user
   */
  const handleThemeSelect = (theme: ThemeType): void => {
    setSelectedTheme(theme);
    onThemeChange(theme);
  };

  /**
   * Reset theme selection to system default
   */
  const resetToDefault = (): void => {
    const defaultTheme: ThemeType = 'system';
    handleThemeSelect(defaultTheme);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header section with title and reset button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PaletteIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-800 dark:text-white">
            Theme Selection
          </h3>
        </div>

        <button
          onClick={resetToDefault}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          aria-label="Reset theme to system default"
        >
          Reset to Default
        </button>
      </div>

      {/* Theme selection grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              selectedTheme === theme.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
            aria-label={`Select ${theme.name} theme`}
            aria-pressed={selectedTheme === theme.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Theme icon */}
                <div className={`p-2 rounded-lg ${theme.color} text-white`}>
                  {theme.icon}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 dark:text-white">
                      {theme.name}
                    </span>

                    {/* Checkmark for selected theme */}
                    {selectedTheme === theme.id && (
                      <Check
                        className="w-4 h-4 text-green-600"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {theme.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual theme preview */}
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="flex h-12">
                {/* Sidebar preview area */}
                <div
                  className={`w-1/4 ${
                    theme.id === 'light'
                      ? 'bg-slate-100'
                      : theme.id === 'dark'
                        ? 'bg-slate-800'
                        : theme.id === 'high-contrast'
                          ? 'bg-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  aria-hidden="true"
                />

                {/* Main content preview area */}
                <div
                  className={`flex-1 ${
                    theme.id === 'light'
                      ? 'bg-white'
                      : theme.id === 'dark'
                        ? 'bg-slate-900'
                        : theme.id === 'high-contrast'
                          ? 'bg-black'
                          : 'bg-white dark:bg-slate-900'
                  }`}
                  aria-hidden="true"
                >
                  <div className="flex items-center gap-2 p-2">
                    {/* UI element preview */}
                    <div
                      className={`w-2 h-2 rounded-full ${
                        theme.id === 'high-contrast'
                          ? 'bg-yellow-400'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div
                      className={`h-2 rounded ${
                        theme.id === 'light'
                          ? 'bg-slate-200'
                          : theme.id === 'dark'
                            ? 'bg-slate-700'
                            : theme.id === 'high-contrast'
                              ? 'bg-white'
                              : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                      style={{ width: '60%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active theme indicator badge */}
            {selectedTheme === theme.id && (
              <div className="absolute -top-2 -right-2" aria-hidden="true">
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Current theme indicator panel */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800 dark:text-white">
              Current Theme
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {themeOptions.find((t) => t.id === selectedTheme)?.description}
            </p>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600"
            aria-label={`Current theme: ${
              themeOptions.find((t) => t.id === selectedTheme)?.name
            }`}
          >
            {/* Theme color dot */}
            <div
              className={`w-2 h-2 rounded-full ${
                selectedTheme === 'light'
                  ? 'bg-yellow-500'
                  : selectedTheme === 'dark'
                    ? 'bg-indigo-600'
                    : selectedTheme === 'system'
                      ? 'bg-slate-600'
                      : 'bg-orange-600'
              }`}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {themeOptions.find((t) => t.id === selectedTheme)?.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
