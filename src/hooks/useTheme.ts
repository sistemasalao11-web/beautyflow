import { useEffect } from 'react';
import { useSaaS } from './useSaaS';

const hexToRgb = (hex: string) => {
    if (!hex || typeof hex !== 'string') return '245 158 11'; // Default Amber

    // Remove # if present and trim
    hex = hex.replace('#', '').trim();

    // Handle short hex (e.g. F00)
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length !== 6) return '245 158 11'; // Default Amber

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return '245 158 11';

    return `${r} ${g} ${b}`;
};

export const useTheme = () => {
    const saas = useSaaS();
    const settings = saas?.settings;

    useEffect(() => {
        if (!settings?.themeColor) return;

        try {
            const root = document.documentElement;
            const rgb = hexToRgb(settings.themeColor);

            // Set CSS Variable
            root.style.setProperty('--color-primary', rgb);

            // Optional: Secondary color logic if implemented
            if (settings.themeSecondaryColor) {
                // root.style.setProperty('--color-secondary', hexToRgb(settings.themeSecondaryColor));
            }
        } catch (error) {
            console.error('Theme application failed:', error);
        }
    }, [settings?.themeColor]); // Run when themeColor changes

    // Helper to preview live changes (e.g. from Settings input)
    const previewTheme = (hexColor: string) => {
        try {
            const root = document.documentElement;
            const rgb = hexToRgb(hexColor);
            root.style.setProperty('--color-primary', rgb);
        } catch (e) {
            // ignore invalid colors during typing
        }
    };

    return { previewTheme };
};
