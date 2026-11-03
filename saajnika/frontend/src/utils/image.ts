/**
 * Image optimization utilities for SAAJNIKA.
 * Dynamically resizes and compresses external and CDN assets (Unsplash, Cloudinary, etc.)
 * to modern WebP/AVIF formats, exact device dimensions, and provides smooth inline placeholders.
 */

// Elegant warm alabaster shimmer placeholder for luxury aesthetic
export const LUXURY_IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="50%" stop-color="#F2EDE4" />
          <stop offset="100%" stop-color="#FAF8F5" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
      <circle cx="200" cy="250" r="28" fill="#E4DCD0" opacity="0.6" />
    </svg>`
  );

/**
 * Optimizes an image URL for fast delivery:
 * - Downscales resolution to container-appropriate dimensions (e.g. 500px for grid cards instead of 2000px raw)
 * - Enables automatic format negotiation (AVIF/WebP)
 * - Applies optimal lossy compression (quality 75-80)
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  width = 600,
  quality = 75
): string {
  if (!url) return LUXURY_IMAGE_PLACEHOLDER;

  // Unsplash CDN optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('q', String(quality));
      return parsed.toString();
    } catch {
      // Fallback string replacement if URL constructor fails
      const base = url.split('?')[0];
      return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
    }
  }

  // Cloudinary image transformation
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transform = `f_auto,q_auto,w_${width},c_limit/`;
    return url.replace('/upload/', `/upload/${transform}`);
  }

  return url;
}

/**
 * Preload high-priority images (e.g. hero banner or first visible product)
 */
export function preloadImage(url: string): void {
  if (typeof window === 'undefined' || !url) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}
