export const getSecureImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('https://')) return imagePath;

    const rawUrl = imagePath.startsWith('http://')
        ? imagePath
        : `http://www.marketexpress.somee.com/${imagePath.replace(/^\//, '')}`;

    return `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}`;
};

export const getMediaUrl = (urlPath: string | null) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('https://')) return urlPath;
    return urlPath.startsWith('http://')
        ? urlPath
        : `http://www.marketexpress.somee.com/${urlPath.replace(/^\//, '')}`;
};