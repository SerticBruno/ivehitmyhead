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
              implement it in a future update. I try to read all suggestions and make the tool more useful for
              everyone.
            </>
          }
        />
      </section>
    </main>
  );
}



