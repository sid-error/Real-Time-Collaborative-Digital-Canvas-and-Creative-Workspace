export type ThemeType = 'light' | 'dark' | 'system' | 'high-contrast';

const THEME_KEY = 'theme';

export const getStoredTheme = (): ThemeType | null => {
    return localStorage.getItem(THEME_KEY) as ThemeType | null;
};

export const setStoredTheme = (theme: ThemeType) => {
    localStorage.setItem(THEME_KEY, theme);
};

/**
 * Applies theme by manipulating the HTML element's class attribute
 * 
 * For Tailwind CSS with darkMode: 'class':
 * - Light theme: NO .dark class (Tailwind applies default styles)
 * - Dark theme: .dark class present (Tailwind applies dark: variants)
 */
export const applyTheme = (theme: ThemeType) => {
    const html = document.documentElement;

    // Step 1: Always remove all theme-related classes first
    html.classList.remove('light', 'dark', 'high-contrast');

    // Step 2: Force a DOM reflow to ensure clean state
    void html.offsetHeight;

    // Step 3: Apply the appropriate class(es)
    if (theme === 'system') {
        // Use system color scheme preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.classList.add('dark');
        }
        // For light: don't add any class (default Tailwind light styles)
    } else if (theme === 'high-contrast') {
        html.classList.add('high-contrast', 'dark');
    } else if (theme === 'dark') {
        html.classList.add('dark');
    }
    // For light: don't add any class (default Tailwind light styles)
};

export const initializeTheme = (): (() => void) => {
    const storedTheme = getStoredTheme();
    const themeToUse = storedTheme || 'system';

    applyTheme(themeToUse as ThemeType);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        const currentTheme = getStoredTheme();
        if (!currentTheme || currentTheme === 'system') {
            applyTheme('system');
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
};
