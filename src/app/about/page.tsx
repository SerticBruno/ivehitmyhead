'use client';

import React from 'react';
import { Button } from '@/components/ui';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About <span className="text-gray-800 dark:text-gray-200">IVEHITMYHEAD</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Where memes go to die... and then get resurrected.
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Or some do not.</p>
          </div>

          {/* Main Content */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="space-y-6 text-gray-600 dark:text-gray-300">
              <p>
                This started as a way to organize the memes I kept sending to friends. Then it became a way to 
                organize the memes friends kept sending to me. Now it&apos;s just a place where memes go to get organized, 
                I guess. I&apos;m not sure when it got out of hand.
              </p>
              
              <p>
                I&apos;m mostly resharing stuff I find or that friends send me. Just a guy who likes organizing things in a way that doesn&apos;t make sense.
              </p>
              
              <p>
                The meme generator? That was born from pure spite. I was using some random meme page and couldn&apos;t do any of the basic stuff, 
                and then someone told me &quot;you can&apos;t make a meme generator that&apos;s actually usable&quot; and I took that personally. And he was kinda right.
              </p>
              
              <p>
                Built with Next.js, React, and enough caffeine to power a small city. Also, I may have talked to 
                my 2 dogs and a cat while debugging.
              </p>
            </div>
          </div>

          {/* Thank You Section - Simple text like above */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="space-y-6 text-gray-600 dark:text-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
                Thanks, I guess?
              </h2>
              <p>
                To everyone who uses this site: you&apos;re the reason I can tell my family I&apos;m &quot;working&quot; 
                instead of just &quot;messing around on the internet.&quot; Also, you&apos;re the reason I keep finding 
                new bugs to fix at 2 AM. So... thanks? I think?
              </p>
              <p>
                Your support really means so much to me. I&apos;m genuinely thankful to all the people who have supported me 
                and who will continue to support this ridiculous project. It&apos;s amazing to see people actually using 
                something I built, even if it&apos;s just for organizing and creating memes. Thanks again, from the bottom of my heart.
              </p>
              <p>
                Shoutout to the actual meme creators, the developers who inspired me, my pets and my family who has no idea what I do.
              </p>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 text-center shadow-lg mb-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Buy me a coffee
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                If you like this site and want me to keep adding features instead of just fixing bugs, 
                consider buying me a coffee. It&apos;s cheaper than therapy and keeps the servers running.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
                  onClick={() => window.open('https://buymeacoffee.com', '_blank')}
                >
                  ☕ Coffee = More Memes
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Your support keeps the memes flowing<br/>
                <span className="text-xs opacity-75">And helps me explain to my family why I&apos;m &quot;working&quot; at 2 AM</span>
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h2>
                          <p className="text-gray-600 dark:text-gray-300 mb-6">
                Found a bug? Have a suggestion? Just want to say hi? I&apos;m here, I guess. 
                Bugs are just surprise features I didn&apos;t plan for, so don&apos;t feel bad about finding them. 
                I try to find time to reply to each of the emails.
              </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => window.open('mailto:hello@ivehitmyhead.com', '_blank')}
              >
                Email Me
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://twitter.com', '_blank')}
              >
                X
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
