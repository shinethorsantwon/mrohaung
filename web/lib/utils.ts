/**
 * Utility to fix URLs that might incorrectly point to localhost
 * or other development environments.
 */

export const fixUrl = (url?: string | null): string | undefined => {
    if (!url) return undefined;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const BASE_URL = API_URL.replace(/\/api$/, '');
    const OLD_PRODUCTION_URL = 'https://mrohaung.com';

    let fixedUrl = url;

    // 1. Replace localhost or 127.0.0.1
    if (fixedUrl.includes('localhost:') || fixedUrl.includes('127.0.0.1:')) {
        fixedUrl = fixedUrl.replace(/http:\/\/localhost:\d+/, BASE_URL)
            .replace(/http:\/\/127.0.0.1:\d+/, BASE_URL);
    }

    // 2. Replace old production URL with new Render backend if it's pointing to old Hostinger
    // This helps recover old images without re-uploading
    if (fixedUrl.includes(OLD_PRODUCTION_URL) && !API_URL.includes(OLD_PRODUCTION_URL)) {
        fixedUrl = fixedUrl.replace(OLD_PRODUCTION_URL, BASE_URL);
    }

    // 3. Handle relative paths (e.g., /api/images/...)
    if (fixedUrl.startsWith('/')) {
        fixedUrl = `${BASE_URL}${fixedUrl}`;
    }

    return fixedUrl;
};

export const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return targetDate.toLocaleDateString();
};
