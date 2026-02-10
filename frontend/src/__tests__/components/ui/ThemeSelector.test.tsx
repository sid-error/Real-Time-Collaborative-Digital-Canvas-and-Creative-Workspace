import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ThemeSelector from '../../../components/ui/ThemeSelector';

const createMatchMedia = (matches: boolean) => {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();

  return (query: string) => {
    const mql: any = {
      matches,
      media: query,
      onchange: null,
      addEventListener: (event: string, cb: any) => {
        if (event === 'change') listeners.add(cb);
      },
      removeEventListener: (event: string, cb: any) => {
        if (event === 'change') listeners.delete(cb);
      },
      dispatch: (nextMatches: boolean) => {
        mql.matches = nextMatches;
        listeners.forEach((cb) => cb({ matches: nextMatches } as MediaQueryListEvent));
      }
    };
    return mql;
  };
};

describe('ThemeSelector', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  test('renders all theme options', () => {
    render(<ThemeSelector currentTheme="system" onThemeChange={jest.fn()} />);

    expect(screen.getByText('Theme Selection')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Select Light theme/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select Dark theme/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select System theme/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select High Contrast theme/i })).toBeInTheDocument();
  });

  test('uses saved theme from localStorage if valid', () => {
    localStorage.setItem('theme', 'dark');

    render(<ThemeSelector currentTheme="light" onThemeChange={jest.fn()} />);

    expect(screen.getByLabelText('Current theme: Dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('ignores invalid saved theme and falls back to currentTheme', () => {
    localStorage.setItem('theme', 'not-a-theme');

    render(<ThemeSelector currentTheme="light" onThemeChange={jest.fn()} />);

    expect(screen.getByLabelText('Current theme: Light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  test('clicking a theme calls onThemeChange and applies correct class + localStorage', () => {
    const onThemeChange = jest.fn();

    render(<ThemeSelector currentTheme="system" onThemeChange={onThemeChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Select Dark theme/i }));

    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('high-contrast applies both high-contrast and dark classes', () => {
    render(<ThemeSelector currentTheme="system" onThemeChange={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Select High Contrast theme/i }));

    expect(localStorage.getItem('theme')).toBe('high-contrast');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('reset to default sets system theme and calls onThemeChange(system)', () => {
    const onThemeChange = jest.fn();

    render(<ThemeSelector currentTheme="dark" onThemeChange={onThemeChange} />);

    // Select dark first
    fireEvent.click(screen.getByRole('button', { name: /Select Dark theme/i }));
    expect(screen.getByLabelText('Current theme: Dark')).toBeInTheDocument();

    // Reset
    fireEvent.click(screen.getByRole('button', { name: /Reset theme to system default/i }));

    expect(onThemeChange).toHaveBeenLastCalledWith('system');
    expect(localStorage.getItem('theme')).toBe('system');
    expect(screen.getByLabelText('Current theme: System')).toBeInTheDocument();
  });

  test('system theme applies dark if system prefers dark', () => {
    (window as any).matchMedia = createMatchMedia(true);

    render(<ThemeSelector currentTheme="system" onThemeChange={jest.fn()} />);

    expect(localStorage.getItem('theme')).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  test('system theme applies light if system prefers light', () => {
    (window as any).matchMedia = createMatchMedia(false);

    render(<ThemeSelector currentTheme="system" onThemeChange={jest.fn()} />);

    expect(localStorage.getItem('theme')).toBe('system');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('listens for system theme changes ONLY when selectedTheme is system', () => {
    const mmFactory = createMatchMedia(false);
    const mql = mmFactory('(prefers-color-scheme: dark)');
    (window as any).matchMedia = () => mql;

    render(<ThemeSelector currentTheme="system" onThemeChange={jest.fn()} />);

    // Initially light
    expect(document.documentElement.classList.contains('light')).toBe(true);

    // System changes to dark
    act(() => {
      mql.dispatch(true);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('does NOT listen for system changes when selectedTheme is not system', () => {
    const mmFactory = createMatchMedia(false);
    const mql = mmFactory('(prefers-color-scheme: dark)');
    (window as any).matchMedia = () => mql;

    render(<ThemeSelector currentTheme="system" onThemeChange={jest.fn()} />);

    // Switch away from system
    fireEvent.click(screen.getByRole('button', { name: /Select Dark theme/i }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Now system changes to light -> should NOT override
    act(() => {
      mql.dispatch(false);
    });

    // Still dark because user selected dark manually
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('selected theme button has aria-pressed=true', () => {
    render(<ThemeSelector currentTheme="system" onThemeChange={jest.fn()} />);

    const darkBtn = screen.getByRole('button', { name: /Select Dark theme/i });

    fireEvent.click(darkBtn);

    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');

    const lightBtn = screen.getByRole('button', { name: /Select Light theme/i });
    expect(lightBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
