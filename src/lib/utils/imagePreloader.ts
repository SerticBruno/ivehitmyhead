/**
 * Utility for preloading images to improve perceived performance
 */

interface PreloadOptions {
  priority?: 'high' | 'low';
  timeout?: number;
}

class ImagePreloader {
  private preloadedImages = new Set<string>();
  private preloadQueue: Array<{ src: string; options: PreloadOptions }> = [];
  private isProcessing = false;

  /**
   * Preload a single image
   */
  preloadImage(src: string, options: PreloadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      const timeout = options.timeout || 10000; // 10 second timeout

      const timeoutId = setTimeout(() => {
        reject(new Error(`Image preload timeout: ${src}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        this.preloadedImages.add(src);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to preload image: ${src}`));
      };

      img.src = src;
    });
  }

  /**
   * Preload multiple images with priority
   */
  async preloadImages(sources: string[], options: PreloadOptions = {}): Promise<void> {
    const highPriority = sources.slice(0, 3); // First 3 images are high priority
    const lowPriority = sources.slice(3);

    // Preload high priority images first
    if (highPriority.length > 0) {
      try {
        await Promise.allSettled(
          highPriority.map(src => this.preloadImage(src, { ...options, priority: 'high' }))
        );
      } catch (error) {
        console.warn('Some high priority images failed to preload:', error);
      }
    }

    // Preload low priority images in background
    if (lowPriority.length > 0) {
      this.queuePreload(lowPriority, { ...options, priority: 'low' });
    }
  }

  /**
   * Queue images for background preloading
   */
  private queuePreload(sources: string[], options: PreloadOptions): void {
    sources.forEach(src => {
      this.preloadQueue.push({ src, options });
    });

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process the preload queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, 3); // Process 3 at a time
      
      try {
        await Promise.allSettled(
          batch.map(({ src }) => this.preloadImage(src, { priority: 'low' }))
        );
      } catch (error) {
        console.warn('Some images in batch failed to preload:', error);
      }

      // Small delay between batches to avoid blocking the main thread
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  /**
   * Check if an image is already preloaded
   */
  isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  /**
   * Clear preloaded images cache
   */
  clearCache(): void {
    this.preloadedImages.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cached: number; queued: number } {
    return {
      cached: this.preloadedImages.size,
      queued: this.preloadQueue.length
    };
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();

// Export the class for testing or custom instances
export { ImagePreloader };
export type { PreloadOptions };
