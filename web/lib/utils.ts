/**
 * Utility to fix URLs that might incorrectly point to localhost
 * or other development environments.
 */

export const fixUrl = (url?: string | null): string | undefined => {
    if (!url) return undefined;

    const RENDER_URL = 'https://mrohaung.onrender.com';

    // Replace localhost or 127.0.0.1 with the correct Render production URL
    if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
        return url.replace(/http:\/\/localhost:\d+/, RENDER_URL)
            .replace(/http:\/\/127.0.0.1:\d+/, RENDER_URL);
    }

    return url;
};
