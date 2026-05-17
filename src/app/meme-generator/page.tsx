import Link from 'next/link';

import { ContactSection } from '@/components/contact/ContactSection';
import { AdvancedMemeGenerator } from '@/components/meme/AdvancedMemeGenerator';

export default function AdvancedMemeGeneratorPage() {
  return (
    <main className="bg-[#f7f4ee] dark:bg-gray-950 py-2 md:py-4">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-0">
          <AdvancedMemeGenerator />
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <ContactSection
          title="Suggest a feature"
          description={
            <>
              Want something added to the generator that you would find helpful? Suggest an idea and I might
              implement it in a future update. I try to read all suggestions and make the meme generator more useful for
              everyone.
            </>
          }
        />

        <p className="mt-10 text-center text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          If you&apos;d like to learn more about the project, check out the{' '}
          <Link
            href="/about"
            className="font-semibold text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-200"
          >
            about page
          </Link>
          .
        </p>
      </section>
    </main>
  );
}



