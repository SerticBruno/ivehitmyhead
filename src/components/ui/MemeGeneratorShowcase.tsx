'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { Button } from './Button';
import { ICONS } from '@/lib/utils/categoryIcons';

interface MemeGeneratorShowcaseProps {
  screenshots?: string[];
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

        {/* Alternating sections */}
        {sections.map((section, index) => {
          const isEven = index % 2 === 0;
          const imageOrder = isEven ? 'order-1' : 'order-2';
          const textOrder = isEven ? 'order-2' : 'order-1';

          return (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 last:mb-0`}
            >
              {/* Image */}
              <div className={`${imageOrder} relative aspect-[16/10] rounded-xl shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700 bg-white dark:bg-gray-800 transition-transform duration-300 hover:scale-105`}>
                {section.image ? (
                  <Image
                    src={section.image}
                    alt={`Meme generator screenshot ${index + 1}`}
                    fill
                    className="object-top"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                    <div className="text-center p-8">
                      <ICONS.Star className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-gray-600 dark:text-gray-300 font-medium">
                        Screenshot {index + 1}
                      </p>
                    </div>
                  </div>
                )}
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
                      className="text-lg px-8"
                      onClick={() => window.location.href = '/meme-generator'}
                    >
                      Try Meme Generator
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-8"
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

