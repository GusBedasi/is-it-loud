import { ImageCDNConfig } from './types';

class ImageCDN {
  private config: ImageCDNConfig;

  constructor(config: ImageCDNConfig) {
    this.config = config;
  }

  /**
   * Transforms an image URL to use CDN with optimizations
   */
  transformImageUrl(originalUrl: string, overrides?: ImageCDNConfig['transformations']): string {
    // In development, return original URL
    if (process.env.NODE_ENV === 'development') {
      return originalUrl;
    }

    // If the URL is already using our CDN, return as-is
    if (originalUrl.startsWith(this.config.baseUrl)) {
      return originalUrl;
    }

    const transformations = { ...this.config.transformations, ...overrides };
    
    // Build transformation parameters
    const params = new URLSearchParams();
    
    if (transformations?.width) params.append('w', transformations.width.toString());
    if (transformations?.height) params.append('h', transformations.height.toString());
    if (transformations?.quality) params.append('q', transformations.quality.toString());
    if (transformations?.format) params.append('f', transformations.format);
    if (transformations?.fit) params.append('fit', transformations.fit);

    // Encode the original URL
    const encodedUrl = encodeURIComponent(originalUrl);
    
    // Build the CDN URL
    const cdnUrl = `${this.config.baseUrl}/transform?${params.toString()}&url=${encodedUrl}`;
    
    return cdnUrl;
  }

  /**
   * Get optimized image URL for different use cases
   */
  getOptimizedUrl(originalUrl: string, preset: 'thumbnail' | 'card' | 'hero' | 'full'): string {
    const presets = {
      thumbnail: { width: 150, height: 150, quality: 80, format: 'webp' as const, fit: 'cover' as const },
      card: { width: 400, height: 300, quality: 85, format: 'webp' as const, fit: 'cover' as const },
      hero: { width: 1200, height: 600, quality: 90, format: 'webp' as const, fit: 'cover' as const },
      full: { width: 1600, height: 1200, quality: 95, format: 'webp' as const, fit: 'cover' as const }
    };

    return this.transformImageUrl(originalUrl, presets[preset]);
  }

  /**
   * Get responsive image sources for different screen sizes
   */
  getResponsiveSources(originalUrl: string): Array<{ srcSet: string; media: string }> {
    return [
      {
        srcSet: this.getOptimizedUrl(originalUrl, 'thumbnail'),
        media: '(max-width: 480px)'
      },
      {
        srcSet: this.getOptimizedUrl(originalUrl, 'card'),
        media: '(max-width: 768px)'
      },
      {
        srcSet: this.getOptimizedUrl(originalUrl, 'hero'),
        media: '(max-width: 1200px)'
      },
      {
        srcSet: this.getOptimizedUrl(originalUrl, 'full'),
        media: '(min-width: 1201px)'
      }
    ];
  }
}

// CDN Configuration - this would be set via environment variables
const cdnConfig: ImageCDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.example.com',
  transformations: {
    quality: 85,
    format: 'webp',
    fit: 'cover'
  }
};

// Export singleton instance
export const imageCDN = new ImageCDN(cdnConfig);

// Export the class for custom instances
export { ImageCDN };
export type { ImageCDNConfig };