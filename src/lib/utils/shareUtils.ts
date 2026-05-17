/**
 * Utility functions for sharing memes using the Web Share API
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Share content using the Web Share API if available, with fallbacks for unsupported browsers
 * @param shareData - The data to share (title, text, url)
 * @param fallbackAction - Optional custom fallback action for desktop/unsupported browsers
 * @param onShareSuccess - Optional callback when sharing is successful
 * @returns Promise<boolean> - true if share was successful, false otherwise
 */
export const shareMeme = async (
  shareData: ShareData,
  fallbackAction?: () => boolean | Promise<boolean> | void,
  onShareSuccess?: () => void
): Promise<boolean> => {
  console.log('shareMeme called with:', { shareData, hasFallback: !!fallbackAction, hasSuccessCallback: !!onShareSuccess });
  
  // Check if Web Share API is supported (mobile devices)
  if (navigator.share) {
    console.log('Web Share API supported, using native sharing');
    try {
      await navigator.share(shareData);
      console.log('Content shared successfully via Web Share API');
      // Call success callback if provided
      if (onShareSuccess) {
        console.log('Calling success callback');
        onShareSuccess();
      }
      return true; // Web Share API succeeded
    } catch (error) {
      // User cancelled sharing or there was an error
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing content via Web Share API:', error);
      } else {
        console.log('User cancelled sharing via Web Share API');
      }
      return false; // Web Share API failed or was cancelled
    }
  } else {
    console.log('Web Share API not supported, using fallback');
    // Fallback for desktop or unsupported browsers
    if (fallbackAction) {
      console.log('Using custom fallback action');
      const fallbackResult = await fallbackAction();
      if (fallbackResult === true) {
        if (onShareSuccess) {
          console.log('Calling success callback for custom fallback');
          onShareSuccess();
        }
        return true;
      }
      return false;
    } else {
      // Default fallback: copy URL to clipboard
      console.log('Using default fallback: copy to clipboard');
      try {
        await navigator.clipboard.writeText(shareData.url);
        console.log('URL copied to clipboard successfully');
        // Call success callback for clipboard copy as well
        if (onShareSuccess) {
          console.log('Calling success callback for clipboard copy');
          onShareSuccess();
        }
        return true; // Clipboard copy succeeded
      } catch (error) {
        console.error('Failed to copy URL to clipboard:', error);
        // Final fallback: open in new window
        console.log('Final fallback: opening in new window');
        window.open(shareData.url, '_blank');
        return false; // Cannot verify actual share occurred
      }
    }
  }
}

/**
 * Create share data for a meme
 * @param memeTitle - The title of the meme
 * @param memeSlug - The slug of the meme
 * @param baseUrl - The base URL of the site (optional, defaults to window.location.origin)
 * @returns ShareData object ready for sharing
 */
export const createMemeShareData = (
  memeTitle: string,
  memeSlug: string,
  baseUrl?: string
): ShareData => {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return {
    title: memeTitle,
    text: `Check out this meme: ${memeTitle}`,
    url: `${origin}/meme/${memeSlug}`,
  };
};

/**
 * Record a share in the database
 * @param memeSlug - The slug of the meme being shared
 */
export const recordShare = async (memeSlug: string): Promise<void> => {
  try {
    console.log('Recording share for meme:', memeSlug);
    
    const response = await fetch(`/api/memes/${memeSlug}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to record share: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Share recorded successfully:', data);
  } catch (error) {
    console.error('Error recording share:', error);
    // Don't throw - we don't want to break the sharing experience if recording fails
  }
};

/**
 * Share a meme with automatic fallback handling and share recording
 * @param memeTitle - The title of the meme
 * @param memeSlug - The slug of the meme
 * @param baseUrl - The base URL of the site (optional)
 * @returns Promise<boolean> - true if share was successful, false otherwise
 */
export const shareMemeWithFallback = async (
  memeTitle: string,
  memeSlug: string,
  baseUrl?: string
): Promise<boolean> => {
  console.log('Sharing meme:', { title: memeTitle, slug: memeSlug, baseUrl });
  
  const shareData = createMemeShareData(memeTitle, memeSlug, baseUrl);
  console.log('Share data created:', shareData);
  
  // Record the share when sharing is successful
  const onShareSuccess = () => {
    console.log('Share successful, recording in database...');
    recordShare(memeSlug);
  };
  
  return await shareMeme(shareData, undefined, onShareSuccess);
};

function loadImageWithCors(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

async function drawToPngBlob(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  width: number,
  height: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }
  draw(ctx, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create image blob'))),
      'image/png',
    );
  });
}

async function blobToPngBlob(blob: Blob): Promise<Blob> {
  if (blob.type === 'image/png') {
    return blob;
  }

  const bitmap = await createImageBitmap(blob);
  try {
    return await drawToPngBlob(
      (ctx) => ctx.drawImage(bitmap, 0, 0),
      bitmap.width,
      bitmap.height,
    );
  } finally {
    bitmap.close();
  }
}

async function imageUrlToPngBlob(imageUrl: string): Promise<Blob> {
  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      if (blob.type.startsWith('image/')) {
        return blobToPngBlob(blob);
      }
    }
  } catch {
    // Fall through to canvas when fetch is blocked by CORS.
  }

  const img = await loadImageWithCors(imageUrl);
  return drawToPngBlob(
    (ctx) => ctx.drawImage(img, 0, 0),
    img.naturalWidth,
    img.naturalHeight,
  );
}

/**
 * Copy a PNG blob to the system clipboard (paste as image in supporting apps).
 */
export async function copyPngBlobToClipboard(blob: Blob): Promise<void> {
  if (typeof window === 'undefined' || !navigator.clipboard?.write) {
    throw new Error('Clipboard image copy is not supported');
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);
}

/**
 * Copy a meme image to the system clipboard (paste as image in supporting apps).
 * Clipboard writes use PNG — browsers reject JPEG/WebP for image clipboard data.
 */
export async function copyImageToClipboard(imageUrl: string): Promise<void> {
  const pngBlob = await imageUrlToPngBlob(imageUrl);
  await copyPngBlobToClipboard(pngBlob);
}
