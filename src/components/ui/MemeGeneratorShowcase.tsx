'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Check, Download, Trash2, Upload } from 'lucide-react';
import { Button } from './Button';
import { ICONS } from '@/lib/utils/categoryIcons';

interface MemeGeneratorShowcaseProps {
  screenshots?: string[];
}

type SwipeableScreenshotStackProps = {
  primarySrc?: string;
  secondarySrc?: string;
  primaryAlt: string;
  secondaryAlt: string;
  priority?: boolean;
  rotationDeg: number;
};

function SwipeableScreenshotStack({
  primarySrc,
  secondarySrc,
  primaryAlt,
  secondaryAlt,
  priority = false,
  rotationDeg,
}: SwipeableScreenshotStackProps) {
  const [frontIndex, setFrontIndex] = useState<0 | 1>(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const touchActiveRef = useRef(false);
  const touchStartXRef = useRef(0);

  // Keep the stack offset responsive so it never collides with surrounding layout.
  const stackOffset = 'clamp(12px, 3.5vw, 44px)';
  const backScale = 0.92;

  const frontSrc = frontIndex === 0 ? primarySrc : secondarySrc;
  const backSrc = frontIndex === 0 ? secondarySrc : primarySrc;
  const frontAlt = frontIndex === 0 ? primaryAlt : secondaryAlt;
  const backAlt = frontIndex === 0 ? secondaryAlt : primaryAlt;

  const canSwipe = Boolean(primarySrc && secondarySrc);

  const swap = useCallback(() => {
    setFrontIndex((prev) => (prev === 0 ? 1 : 0));
  }, []);

  const finishPointer = useCallback(() => {
    pointerIdRef.current = null;
    startXRef.current = 0;
    setIsDragging(false);
  }, []);

  const setDrag = useCallback((x: number) => {
    dragXRef.current = x;
    setDragX(x);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canSwipe || isAnimatingOut) return;
      // Left click only for mouse; touch/pen are fine.
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      // Prevent browser default drag interactions on images.
      e.preventDefault();

      pointerIdRef.current = e.pointerId;
      startXRef.current = e.clientX;
      setIsDragging(true);
      setDrag(0);

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Some browsers can be flaky here; we still handle moves best-effort.
      }
    },
    [canSwipe, isAnimatingOut, setDrag]
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === null || pointerIdRef.current !== e.pointerId) return;
    const delta = e.clientX - startXRef.current;
    const clamped = Math.max(-220, Math.min(220, delta));
    setDrag(clamped);
  }, []);

  const onPointerUpOrCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current === null || pointerIdRef.current !== e.pointerId) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if capture was lost.
      }

      const threshold = 80;
      const currentDrag = dragXRef.current;
      const shouldSwap = Math.abs(currentDrag) > threshold;

      if (!shouldSwap) {
        finishPointer();
        setDrag(0);
        return;
      }

      const width = containerRef.current?.clientWidth ?? 520;
      const direction = currentDrag >= 0 ? 1 : -1;

      setIsAnimatingOut(true);
      finishPointer();
      setDrag(direction * (width * 0.85 + 60));

      window.setTimeout(() => {
        swap();
        setDrag(0);
        setIsAnimatingOut(false);
      }, 220);
    },
    [finishPointer, setDrag, swap]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        paddingRight: stackOffset,
        paddingBottom: stackOffset,
        touchAction: 'pan-y',
      }}
      aria-label={canSwipe ? 'Swipe screenshots' : 'Screenshot'}
    >
      <div className="relative aspect-[16/10] select-none">
        {/* Back/stacked screenshot */}
        {backSrc && (
          <div
            className="absolute inset-0 rounded-xl shadow-xl overflow-hidden border-4 border-white dark:border-gray-700 bg-white dark:bg-gray-800 opacity-90 z-0"
            style={{
              transform: `translate(${stackOffset}, ${stackOffset}) rotate(${rotationDeg}deg) scale(${backScale})`,
            }}
          >
            <Image
              src={backSrc}
              alt={backAlt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
          </div>
        )}

        {/* Front screenshot (draggable) */}
        <div
          className="absolute inset-0 rounded-xl shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700 bg-white dark:bg-gray-800 z-10 will-change-transform"
          style={{
            transform: `translateX(${dragX}px) rotate(${-(rotationDeg * 0.5) + dragX * 0.02}deg)`,
            transition: isDragging ? 'none' : 'transform 220ms ease',
            cursor: canSwipe ? (isDragging ? 'grabbing' : 'grab') : 'default',
            touchAction: canSwipe ? 'none' : 'auto',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUpOrCancel}
          onPointerCancel={onPointerUpOrCancel}
          onTouchStart={(e) => {
            if (!canSwipe || isAnimatingOut) return;
            if (e.touches.length !== 1) return;

            touchActiveRef.current = true;
            touchStartXRef.current = e.touches[0]?.clientX ?? 0;
            setIsDragging(true);
            setDrag(0);
          }}
          onTouchMove={(e) => {
            if (!touchActiveRef.current) return;
            if (e.touches.length !== 1) return;

            // Since we use touchAction: none, preventDefault is safe and avoids rubber-banding.
            e.preventDefault();

            const x = e.touches[0]?.clientX ?? touchStartXRef.current;
            const delta = x - touchStartXRef.current;
            const clamped = Math.max(-220, Math.min(220, delta));
            setDrag(clamped);
          }}
          onTouchEnd={() => {
            if (!touchActiveRef.current) return;
            touchActiveRef.current = false;

            const threshold = 80;
            const currentDrag = dragXRef.current;
            const shouldSwap = Math.abs(currentDrag) > threshold;

            if (!shouldSwap) {
              setIsDragging(false);
              setDrag(0);
              return;
            }

            const width = containerRef.current?.clientWidth ?? 520;
            const direction = currentDrag >= 0 ? 1 : -1;

            setIsAnimatingOut(true);
            setIsDragging(false);
            setDrag(direction * (width * 0.85 + 60));

            window.setTimeout(() => {
              swap();
              setDrag(0);
              setIsAnimatingOut(false);
            }, 220);
          }}
          onKeyDown={(e) => {
            if (!canSwipe) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              swap();
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              swap();
            }
          }}
          role={canSwipe ? 'button' : undefined}
          tabIndex={canSwipe ? 0 : undefined}
          aria-roledescription={canSwipe ? 'swipeable screenshot stack' : undefined}
          aria-label={canSwipe ? 'Drag left or right to swap screenshots' : undefined}
        >
          {frontSrc ? (
            <Image
              src={frontSrc}
              alt={frontAlt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <div className="text-center p-8">
                <ICONS.Star className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">Screenshot</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {canSwipe && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            className={`h-2 w-2 rounded-full transition-colors ${frontIndex === 0 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}
            aria-label="Show first screenshot"
            aria-current={frontIndex === 0 ? 'true' : undefined}
            onClick={() => setFrontIndex(0)}
          />
          <button
            type="button"
            className={`h-2 w-2 rounded-full transition-colors ${frontIndex === 1 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}
            aria-label="Show second screenshot"
            aria-current={frontIndex === 1 ? 'true' : undefined}
            onClick={() => setFrontIndex(1)}
          />
        </div>
      )}
    </div>
  );
}

const MINI_MEME_DEFAULT_TOP = 'TOP TEXT';
const MINI_MEME_DEFAULT_BOTTOM = 'BOTTOM TEXT';

function drawMemeToCanvas(
  image: HTMLImageElement,
  topText: string,
  bottomText: string
): HTMLCanvasElement {
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(image, 0, 0);
  const fontSize = Math.round(Math.min(w, h) * 0.055);
  const strokeW = Math.max(3, Math.round(fontSize * 0.12));
  const lineHeight = fontSize * 1.2;
  ctx.font = `700 ${fontSize}px Impact, "Arial Black", "Helvetica Neue", sans-serif`;
  ctx.textAlign = 'center';

  const drawLine = (line: string, x: number, y: number) => {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = strokeW;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(line, x, y);
    ctx.fillStyle = '#000000';
    ctx.fillText(line, x, y);
  };

  const topLines = topText.split('\n').map((l) => l.trimEnd());
  const bottomLines = bottomText.split('\n').map((l) => l.trimEnd());

  ctx.textBaseline = 'top';
  let ty = h * 0.03;
  for (const line of topLines) {
    if (!line.trim()) {
      ty += lineHeight * 0.5;
      continue;
    }
    drawLine(line, w / 2, ty);
    ty += lineHeight;
  }

  ctx.textBaseline = 'bottom';
  let by = h * 0.97;
  for (let i = bottomLines.length - 1; i >= 0; i--) {
    const line = bottomLines[i]!;
    if (!line.trim()) {
      by -= lineHeight * 0.5;
      continue;
    }
    drawLine(line, w / 2, by);
    by -= lineHeight;
  }

  return canvas;
}

function ShowcaseMiniMemeMaker() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [topText, setTopText] = useState(MINI_MEME_DEFAULT_TOP);
  const [bottomText, setBottomText] = useState(MINI_MEME_DEFAULT_BOTTOM);
  const [isDownloading, setIsDownloading] = useState(false);

  const revokeIfBlob = useCallback((url: string | null) => {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, []);

  useEffect(() => {
    return () => revokeIfBlob(imageSrc);
  }, [imageSrc, revokeIfBlob]);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setImageSrc((prev) => {
      revokeIfBlob(prev);
      return URL.createObjectURL(file);
    });
  }, [revokeIfBlob]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  const clearImage = () => {
    setImageSrc((prev) => {
      revokeIfBlob(prev);
      return null;
    });
  };

  const handleDownload = async () => {
    if (!imageSrc) return;
    setIsDownloading(true);
    try {
      const img = new window.Image();
      img.src = imageSrc;
      await (img.decode?.() ?? new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
      }));

      const canvas = drawMemeToCanvas(img, topText, bottomText);
      const link = document.createElement('a');
      link.download = 'meme.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const captionClass =
    'absolute left-1/2 w-[min(92%,42rem)] -translate-x-1/2 text-center font-bold leading-tight break-words ' +
    'text-black [paint-order:stroke_fill] [-webkit-text-stroke:0.12em_#ffffff] ' +
    '[font-family:Impact,Haettenschweiler,"Arial_Narrow_Bold",sans-serif] ' +
    'text-[length:clamp(0.875rem,5.5cqw,2.5rem)]';

  return (
    <div
      className="mb-16 rounded-2xl border border-gray-200 bg-gray-50/80 p-6 dark:border-gray-600 dark:bg-gray-900/40"
      {...getRootProps()}
    >
      <input {...getInputProps()} aria-label="Upload meme image" />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Try it: upload a photo
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Two captions—top and bottom center—with bold black text and a white outline. Drag an image here or choose a file.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => open()}>
            <Upload className="h-4 w-4" />
            Choose image
          </Button>
          {imageSrc && (
            <>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={clearImage}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-2"
                disabled={isDownloading}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDownload();
                }}
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Saving…' : 'Download PNG'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div
        className={`grid gap-6 lg:grid-cols-[1fr,280px] ${isDragActive ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' : ''}`}
      >
        <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-gray-900/5 dark:border-gray-600 dark:bg-gray-950/40 @container">
          {imageSrc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Your uploaded meme base"
                className="block h-auto w-full object-contain"
              />
              <div className="pointer-events-none absolute inset-0">
                <p className={`${captionClass} top-[2.5%]`}>{topText}</p>
                <p className={`${captionClass} bottom-[2.5%]`}>{bottomText}</p>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => open()}
              className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 p-8 text-gray-500 transition-colors hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
            >
              <Upload className="h-10 w-10 opacity-60" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Drop an image here or click &quot;Choose image&quot;
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="showcase-meme-top" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Top text
            </label>
            <textarea
              id="showcase-meme-top"
              rows={3}
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              className="flex min-h-[72px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
              placeholder="Top caption"
            />
          </div>
          <div>
            <label htmlFor="showcase-meme-bottom" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bottom text
            </label>
            <textarea
              id="showcase-meme-bottom"
              rows={3}
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              className="flex min-h-[72px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
              placeholder="Bottom caption"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MemeGeneratorShowcase({ screenshots = [] }: MemeGeneratorShowcaseProps) {
  // Default placeholder images - replace with actual screenshots
  const defaultScreenshots = screenshots.length > 0 
    ? screenshots 
    : [
        '/images/meme-generator/screenshot1.png',
        '/images/meme-generator/screenshot3.png',
      ];

  const sections = [
    {
      image: defaultScreenshots[0],
      title: 'Create Memes Like a Pro',
      description: 'Our advanced meme generator lets you create custom memes with ease. Choose from dozens of templates, add your own text, customize fonts and colors, and download your masterpiece in seconds.',
      features: [
        'Multiple meme templates to choose from',
        'Customize text, fonts, and colors',
      ],
    },
    {
      image: defaultScreenshots[1],
      title: 'Easy Drag-and-Drop Interface',
      description: 'With our intuitive interface, creating memes has never been easier. Simply drag elements, adjust settings, and see your creation come to life in real-time.',
      features: [
        'Easy drag-and-drop interface',
        'Download high-quality memes instantly',
      ],
    },
  ];

  return (
    <section className="py-8 md:py-12 bg-white dark:bg-gray-800 rounded-2xl mb-12 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              New Feature
            </span>
          </div>
        </div>

        <ShowcaseMiniMemeMaker />

        {/* Alternating sections */}
        {sections.map((section, index) => {
          const isEven = index % 2 === 0;
          const imageOrder = isEven ? 'order-1' : 'order-2';
          const textOrder = isEven ? 'order-2' : 'order-1';
          
          // Use different image for background (toggle between the two)
          const backgroundImage = index === 0 ? defaultScreenshots[1] : defaultScreenshots[0];
          const rotation = index === 0 ? -3 : 3; // Different rotation for each section

          return (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 last:mb-0`}
            >
              {/* Image with stacking effect */}
              <div className={`${imageOrder} w-full max-w-[720px] mx-auto lg:max-w-none`}>
                <SwipeableScreenshotStack
                  primarySrc={section.image}
                  secondarySrc={backgroundImage}
                  primaryAlt={`Meme generator screenshot ${index + 1}`}
                  secondaryAlt={`Meme generator screenshot background ${index + 1}`}
                  priority={index === 0}
                  rotationDeg={rotation}
                />
              </div>

              {/* Text content */}
              <div className={`${textOrder} space-y-6`}>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  {section.title.split(' ').map((word, i) => 
                    word === 'Pro' || word === 'Interface' ? (
                      <span key={i} className="text-blue-600 dark:text-blue-400"> {word}</span>
                    ) : (
                      <span key={i}> {word}</span>
                    )
                  )}
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {section.description}
                </p>
                
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {section.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {index === 0 && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto"
                      onClick={() => window.location.href = '/meme-generator'}
                    >
                      Try Meme Generator
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full sm:w-auto"
                      onClick={() => window.location.href = '/memes'}
                    >
                      Browse Memes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

