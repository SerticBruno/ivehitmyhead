'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
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
  const stackTouchRef = useRef<HTMLDivElement | null>(null);
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
      // Touch is handled via non-passive native listeners so preventDefault works on touchmove.
      if (e.pointerType === 'touch') return;
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

  const canSwipeRef = useRef(canSwipe);
  const isAnimatingOutRef = useRef(isAnimatingOut);
  canSwipeRef.current = canSwipe;
  isAnimatingOutRef.current = isAnimatingOut;

  useEffect(() => {
    const el = stackTouchRef.current;
    if (!el || !canSwipe) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!canSwipeRef.current || isAnimatingOutRef.current) return;
      if (e.touches.length !== 1) return;
      touchActiveRef.current = true;
      touchStartXRef.current = e.touches[0]?.clientX ?? 0;
      setIsDragging(true);
      setDrag(0);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActiveRef.current) return;
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const x = e.touches[0]?.clientX ?? touchStartXRef.current;
      const delta = x - touchStartXRef.current;
      const clamped = Math.max(-220, Math.min(220, delta));
      setDrag(clamped);
    };

    const finishTouch = () => {
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
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', finishTouch);
    el.addEventListener('touchcancel', finishTouch);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', finishTouch);
      el.removeEventListener('touchcancel', finishTouch);
    };
  }, [canSwipe, setDrag, swap]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        paddingRight: stackOffset,
        paddingBottom: stackOffset,
        touchAction: canSwipe ? 'none' : 'auto',
      }}
      aria-label={canSwipe ? 'Swipe screenshots' : 'Screenshot'}
    >
      <div
        ref={stackTouchRef}
        className="relative aspect-[16/10] select-none"
        style={canSwipe ? { touchAction: 'none' } : undefined}
      >
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
              draggable={false}
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
              draggable={false}
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
      title: "Text on a JPEG. That's the whole pitch.",
      description:
        "Templates you've already seen everywhere, fonts if you're feeling fancy, colors if you must. Export a PNG, post it, question your choices. No \"masterpieces.\" Just pixels.",
      features: [
        'Enough templates to stop stalling',
        'Type, tweak, pretend it was ironic',
      ],
    },
    {
      image: defaultScreenshots[1],
      title: 'Drag stuff until it looks wrong on purpose',
      description:
        "Move layers around while it updates in real time. Looks fine? Make it worse. Download when you're done lying to yourself.",
      features: [
        "Click and drag like you know what you're doing",
        'High-res export - your shame in crisp detail',
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
                  {section.title}
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

